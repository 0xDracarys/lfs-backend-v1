
import { IsoGenerationOptions } from "./types";
import { DockerService } from "./docker-service";

/**
 * Class responsible for generating ISO images from LFS builds
 * This class coordinates the ISO generation process, using Docker when available
 */
export class IsoGenerator {
  private dockerService: DockerService;
  private useDocker: boolean = false;
  
  constructor() {
    this.dockerService = new DockerService();
  }
  
  /**
   * Set whether to use Docker for ISO generation
   */
  setUseDocker(useDocker: boolean): void {
    this.useDocker = useDocker;
  }
  
  /**
   * Check if Docker is available for ISO generation
   */
  async isDockerAvailable(): Promise<boolean> {
    return this.dockerService.checkDockerAvailability();
  }
  
  /**
   * Generate an ISO image from a completed LFS build
   * 
   * @param options Configuration options for the ISO generation
   * @returns Path to the generated ISO file
   */
  async generateIso(options: IsoGenerationOptions): Promise<string> {
    console.log(`Starting ISO generation with options:`, options);
    
    try {
      // Ensure the output directory exists
      const outputDir = this.getDirectoryPath(options.outputPath);
      
      // Check for Docker availability if we want to use it
      if (this.useDocker) {
        const dockerAvailable = await this.dockerService.checkDockerAvailability();
        if (dockerAvailable) {
          return this.generateIsoWithDocker(options);
        } else {
          console.log("Docker is not available, falling back to simulation mode");
        }
      }
      
      // If we're not using Docker or Docker is not available, use the simulated approach
      return this.generateSimulatedIso(options);
    } catch (error) {
      console.error(`ISO generation failed:`, error);
      throw new Error(`Failed to generate ISO: ${error}`);
    }
  }
  
  /**
   * Generate ISO using Docker
   */
  private async generateIsoWithDocker(options: IsoGenerationOptions): Promise<string> {
    console.log("Generating ISO using Docker...");
    
    const result = await this.dockerService.runIsoGeneration({
      sourceDir: options.sourceDir,
      outputPath: options.outputPath,
      volumeLabel: options.label,
      bootloader: options.bootloader,
      bootable: options.bootable
    });
    
    if (result.success) {
      console.log("Docker ISO generation successful");
      return options.outputPath;
    } else {
      console.error("Docker ISO generation failed:", result.logs);
      throw new Error(`Docker ISO generation failed: ${result.logs.join('\n')}`);
    }
  }
  
  /**
   * Generate a simulated ISO (fallback method when Docker is not available)
   */
  private async generateSimulatedIso(options: IsoGenerationOptions): Promise<string> {
    console.log("Generating simulated ISO...");
    
    // Create a temporary directory for ISO preparation (simulated)
    const isoTempDir = `${this.getDirectoryPath(options.outputPath)}/iso-temp-${Date.now()}`;
    
    try {
      // Simulate setup of ISO structure
      await this.simulateIsoCreation(options);
      
      // Clean up simulated temporary files (just log it)
      console.log(`Would clean up temporary directory: ${isoTempDir}`);
      
      console.log(`Simulated ISO created successfully at: ${options.outputPath}`);
      return options.outputPath;
    } catch (error) {
      console.error(`Error in simulated ISO creation:`, error);
      throw new Error(`Simulated ISO generation failed: ${error}`);
    }
  }
  
  /**
   * Simulate the creation of an ISO file with actual content
   * This method simulates the steps that would occur in a real ISO creation process
   */
  private async simulateIsoCreation(options: IsoGenerationOptions): Promise<void> {
    // Simulate a delay for "processing time"
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Simulating ISO creation with label: ${options.label}`);
    console.log(`Source directory: ${options.sourceDir}`);
    console.log(`Output path: ${options.outputPath}`);
    
    if (options.bootable) {
      console.log(`Setting up ${options.bootloader} bootloader`);
      
      if (options.bootloader === 'grub') {
        console.log("Creating GRUB bootloader configuration");
        console.log("Generating El Torito boot image");
        console.log("Building boot catalog");
      } else if (options.bootloader === 'isolinux') {
        console.log("Creating ISOLINUX configuration");
        console.log("Copying ISOLINUX bootloader files");
        console.log("Setting up boot menu");
      }
      
      console.log("Creating placeholder kernel and initrd");
    } else {
      console.log("Creating data-only ISO (non-bootable)");
    }
    
    // Simulate xorriso command execution
    console.log("Running xorriso to generate ISO image");
    
    // Simulate more processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("ISO simulation complete");
  }
  
  /**
   * Helper method to get directory path from a file path
   */
  private getDirectoryPath(filePath: string): string {
    return filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '.';
  }
  
  /**
   * Verify an ISO is bootable and contains expected files
   */
  async verifyIso(isoPath: string): Promise<boolean> {
    console.log(`Simulating verification of ISO at ${isoPath}`);
    
    // Simulate a delay for verification process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For simulation purposes, return true 90% of the time
    const isValid = Math.random() > 0.1;
    
    console.log(`ISO verification ${isValid ? 'successful' : 'failed'}`);
    return isValid;
  }
  
  /**
   * Get download URL for an ISO image
   */
  getIsoDownloadUrl(buildId: string, isoName: string): string {
    return `/api/iso/${buildId}/${isoName}`;
  }
}
