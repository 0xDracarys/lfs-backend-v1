
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Service for interacting with Docker containers for ISO generation
 */
export class DockerService {
  private readonly imageName = 'lfs-iso-builder';
  private isDockerAvailable: boolean | null = null;
  
  /**
   * Check if Docker is available on the system
   */
  async checkDockerAvailability(): Promise<boolean> {
    if (this.isDockerAvailable !== null) {
      return this.isDockerAvailable;
    }
    
    try {
      const { stdout } = await execPromise('docker --version');
      console.log(`Docker version: ${stdout.trim()}`);
      this.isDockerAvailable = true;
      return true;
    } catch (error) {
      console.error('Docker is not available:', error);
      this.isDockerAvailable = false;
      return false;
    }
  }
  
  /**
   * Build the Docker image for ISO generation
   */
  async buildDockerImage(forceBuild: boolean = false): Promise<boolean> {
    if (!await this.checkDockerAvailability()) {
      return false;
    }
    
    try {
      // Check if image exists
      if (!forceBuild) {
        try {
          const { stdout } = await execPromise(`docker image inspect ${this.imageName}`);
          if (stdout) {
            console.log('Docker image already exists, skipping build');
            return true;
          }
        } catch {
          // Image doesn't exist, continue to build
        }
      }
      
      // Create a temporary directory for the Dockerfile
      const dockerfilePath = '/tmp/lfs-iso-builder-dockerfile';
      
      // Write the Dockerfile content
      const dockerfileContent = this.getDockerfileContent();
      await this.writeFile(dockerfilePath, dockerfileContent);
      
      // Build the Docker image
      console.log('Building Docker image...');
      const { stdout, stderr } = await execPromise(
        `docker build -t ${this.imageName} -f ${dockerfilePath} .`
      );
      
      console.log('Docker build output:', stdout);
      if (stderr) console.error('Docker build stderr:', stderr);
      
      return true;
    } catch (error) {
      console.error('Failed to build Docker image:', error);
      return false;
    }
  }
  
  /**
   * Run the ISO generation command in a Docker container
   */
  async runIsoGeneration(options: {
    sourceDir: string;
    outputPath: string;
    volumeLabel: string;
    bootloader: "grub" | "isolinux" | "none";
    bootable: boolean;
  }): Promise<{success: boolean; logs: string[]}> {
    if (!await this.checkDockerAvailability()) {
      return { 
        success: false, 
        logs: ['Docker is not available on this system'] 
      };
    }
    
    const logs: string[] = [];
    logs.push('Starting ISO generation in Docker container');
    
    try {
      // Ensure the Docker image exists
      if (!await this.buildDockerImage()) {
        logs.push('Failed to build or find Docker image');
        return { success: false, logs };
      }
      
      logs.push('Docker image is ready');
      
      // Create the output directory if it doesn't exist
      await this.ensureDirectoryExists(options.outputPath);
      
      // Get the directory path from the output file path
      const outputDir = options.outputPath.substring(0, options.outputPath.lastIndexOf('/'));
      const isoFileName = options.outputPath.substring(options.outputPath.lastIndexOf('/') + 1);
      
      // Run the Docker container with mounted volumes
      const dockerCommand = this.buildDockerCommand(options, outputDir, isoFileName);
      logs.push(`Running Docker command: ${dockerCommand}`);
      
      const { stdout, stderr } = await execPromise(dockerCommand);
      
      logs.push('Docker container execution complete');
      logs.push(stdout);
      
      if (stderr) {
        logs.push(`Docker stderr: ${stderr}`);
      }
      
      // Verify the ISO file was created
      try {
        await execPromise(`ls -la ${options.outputPath}`);
        logs.push(`ISO file created successfully at ${options.outputPath}`);
        return { success: true, logs };
      } catch (error) {
        logs.push(`Failed to verify ISO file: ${error}`);
        return { success: false, logs };
      }
    } catch (error) {
      logs.push(`Error running Docker container: ${error}`);
      return { success: false, logs };
    }
  }
  
  /**
   * Build the Docker command for running the ISO generation container
   */
  private buildDockerCommand(
    options: {
      sourceDir: string;
      volumeLabel: string;
      bootloader: "grub" | "isolinux" | "none";
      bootable: boolean;
    },
    outputDir: string,
    isoFileName: string
  ): string {
    // Parameters for the ISO generation command
    const bootloaderParam = options.bootable ? 
      (options.bootloader === 'grub' ? 'grub' : 
       options.bootloader === 'isolinux' ? 'isolinux' : 'none') : 
      'none';
    
    // Build the Docker run command
    return `docker run --rm \\
      -v "${options.sourceDir}:/lfs-source:ro" \\
      -v "${outputDir}:/output" \\
      ${this.imageName} \\
      /bin/bash -c "generate-iso \\
      --source=/lfs-source \\
      --output=/output/${isoFileName} \\
      --label='${options.volumeLabel}' \\
      --bootloader=${bootloaderParam} \\
      --bootable=${options.bootable ? 'true' : 'false'}"`;
  }
  
  /**
   * Get the content of the Dockerfile
   */
  private getDockerfileContent(): string {
    // Create a bash script as a string but properly escape characters
    // that would cause issues in TypeScript template literals
    const generateIsoScript = `#!/bin/bash
set -e

# Parse arguments
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --source=*)
      SOURCE="\${key#*=}"
      shift
      ;;
    --output=*)
      OUTPUT="\${key#*=}"
      shift
      ;;
    --label=*)
      LABEL="\${key#*=}"
      shift
      ;;
    --bootloader=*)
      BOOTLOADER="\${key#*=}"
      shift
      ;;
    --bootable=*)
      BOOTABLE="\${key#*=}"
      shift
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

# Set defaults
SOURCE=\${SOURCE:-/lfs-source}
OUTPUT=\${OUTPUT:-/output/lfs.iso}
LABEL=\${LABEL:-LFS_TEST}
BOOTLOADER=\${BOOTLOADER:-grub}
BOOTABLE=\${BOOTABLE:-true}

echo "Creating ISO with the following parameters:"
echo "Source: $SOURCE"
echo "Output: $OUTPUT"
echo "Label: $LABEL"
echo "Bootloader: $BOOTLOADER"
echo "Bootable: $BOOTABLE"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy source files to temporary directory
echo "Copying source files..."
mkdir -p $TEMP_DIR/isolinux $TEMP_DIR/boot/grub
cp -r $SOURCE/* $TEMP_DIR/ || echo "Warning: Source directory may be empty"

if [ "$BOOTABLE" = "true" ]; then
  # Set up bootloader
  if [ "$BOOTLOADER" = "grub" ]; then
    echo "Setting up GRUB bootloader..."
    mkdir -p $TEMP_DIR/boot/grub/i386-pc
    echo "set default=0" > $TEMP_DIR/boot/grub/grub.cfg
    echo "set timeout=5" >> $TEMP_DIR/boot/grub/grub.cfg
    echo "menuentry \\"Boot LFS Test System\\" {" >> $TEMP_DIR/boot/grub/grub.cfg
    echo "    linux /boot/vmlinuz root=/dev/sr0 ro quiet" >> $TEMP_DIR/boot/grub/grub.cfg
    echo "    initrd /boot/initrd.img" >> $TEMP_DIR/boot/grub/grub.cfg
    echo "}" >> $TEMP_DIR/boot/grub/grub.cfg
    
    # Create a dummy kernel and initrd if they dont exist
    if [ ! -f $TEMP_DIR/boot/vmlinuz ]; then
      echo "Creating placeholder kernel..."
      dd if=/dev/zero of=$TEMP_DIR/boot/vmlinuz bs=1M count=5
    fi
    if [ ! -f $TEMP_DIR/boot/initrd.img ]; then
      echo "Creating placeholder initrd..."
      dd if=/dev/zero of=$TEMP_DIR/boot/initrd.img bs=1M count=10
    fi
    
    # Create GRUB bootable image for El Torito
    grub-mkimage -o $TEMP_DIR/boot/grub/i386-pc/eltorito.img -O i386-pc-eltorito -p /boot/grub biosdisk iso9660
    
    # Generate ISO with GRUB bootloader
    echo "Generating ISO with GRUB bootloader..."
    xorriso -as mkisofs -R -J -V "$LABEL" -o "$OUTPUT" \\
      -b boot/grub/i386-pc/eltorito.img -no-emul-boot -boot-load-size 4 -boot-info-table \\
      "$TEMP_DIR"
  elif [ "$BOOTLOADER" = "isolinux" ]; then
    echo "Setting up ISOLINUX bootloader..."
    mkdir -p $TEMP_DIR/isolinux
    cp /usr/lib/ISOLINUX/isolinux.bin $TEMP_DIR/isolinux/
    cp /usr/lib/syslinux/modules/bios/ldlinux.c32 $TEMP_DIR/isolinux/
    cp /usr/lib/syslinux/modules/bios/libcom32.c32 $TEMP_DIR/isolinux/
    cp /usr/lib/syslinux/modules/bios/libutil.c32 $TEMP_DIR/isolinux/
    cp /usr/lib/syslinux/modules/bios/menu.c32 $TEMP_DIR/isolinux/
    
    echo "DEFAULT linux" > $TEMP_DIR/isolinux/isolinux.cfg
    echo "TIMEOUT 50" >> $TEMP_DIR/isolinux/isolinux.cfg
    echo "PROMPT 1" >> $TEMP_DIR/isolinux/isolinux.cfg
    echo "LABEL linux" >> $TEMP_DIR/isolinux/isolinux.cfg
    echo "  KERNEL /boot/vmlinuz" >> $TEMP_DIR/isolinux/isolinux.cfg
    echo "  APPEND initrd=/boot/initrd.img root=/dev/sr0 ro quiet" >> $TEMP_DIR/isolinux/isolinux.cfg
    
    # Create a dummy kernel and initrd if they dont exist
    if [ ! -f $TEMP_DIR/boot/vmlinuz ]; then
      echo "Creating placeholder kernel..."
      dd if=/dev/zero of=$TEMP_DIR/boot/vmlinuz bs=1M count=5
    fi
    if [ ! -f $TEMP_DIR/boot/initrd.img ]; then
      echo "Creating placeholder initrd..."
      dd if=/dev/zero of=$TEMP_DIR/boot/initrd.img bs=1M count=10
    fi
    
    # Generate ISO with ISOLINUX bootloader
    echo "Generating ISO with ISOLINUX bootloader..."
    xorriso -as mkisofs -R -J -V "$LABEL" -o "$OUTPUT" \\
      -b isolinux/isolinux.bin -no-emul-boot -boot-load-size 4 -boot-info-table \\
      -c isolinux/boot.cat "$TEMP_DIR"
  fi
else
  # Generate non-bootable ISO
  echo "Generating non-bootable ISO..."
  xorriso -as mkisofs -R -J -V "$LABEL" -o "$OUTPUT" "$TEMP_DIR"
fi

# Clean up
echo "Cleaning up temporary directory..."
rm -rf $TEMP_DIR

echo "ISO creation complete: $OUTPUT"
ls -lh $OUTPUT`;

    // Now build the Dockerfile content
    return `FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \\
    xorriso \\
    binutils \\
    grub-pc-bin \\
    grub-efi-amd64-bin \\
    mtools \\
    syslinux \\
    isolinux \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Create the ISO generation script
RUN echo '${generateIsoScript}' > /usr/local/bin/generate-iso

RUN chmod +x /usr/local/bin/generate-iso

WORKDIR /

ENTRYPOINT ["/bin/bash"]`;
  }
  
  /**
   * Helper method to ensure a directory exists
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '.';
    
    try {
      await execPromise(`mkdir -p ${dir}`);
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to write a file
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure the directory exists
      await this.ensureDirectoryExists(filePath);
      
      // Write the file using echo to avoid issues with special characters
      await execPromise(`echo '${content.replace(/'/g, "'\\''")}'  > ${filePath}`);
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
      throw error;
    }
  }
}
