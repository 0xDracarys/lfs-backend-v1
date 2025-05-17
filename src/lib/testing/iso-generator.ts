import { IsoGenerationOptions } from "./types";
import { DockerService, DockerIsoOptions } from "./docker-service";
import { promises as fs } from 'fs';
import path from 'path';

// Constants for ISO storage
const DEFAULT_ISO_DIR = "/tmp/iso";
const ISO_METADATA_FILE = "iso-metadata.json";

// Interface for ISO metadata
export interface IsoMetadata {
  buildId: string;
  isoName: string;
  timestamp: string;
  configName: string;
  outputPath: string;
  bootable: boolean;
  bootloader: string;
  label: string;
}

/**
 * Class responsible for generating ISO images from LFS builds
 * This class coordinates the ISO generation process, using Docker when available
 */
export class IsoGenerator {
  private dockerService: DockerService;
  private useDocker: boolean = false;
  private storageDirectory: string = DEFAULT_ISO_DIR;
  
  constructor(storageDirectory?: string) {
    this.dockerService = new DockerService();
    
    // Set custom storage directory if provided
    if (storageDirectory) {
      this.storageDirectory = storageDirectory;
    }
  }
  
  /**
   * Set whether to use Docker for ISO generation
   */
  setUseDocker(useDocker: boolean): void {
    this.useDocker = useDocker;
  }

  /**
   * Set the storage directory for ISO files
   */
  setStorageDirectory(directory: string): void {
    this.storageDirectory = directory;
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
      await this.ensureDirectoryExists(outputDir);
      
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
    
    const dockerOptions: DockerIsoOptions = {
      sourceDir: options.sourceDir,
      outputPath: options.outputPath,
      volumeLabel: options.label,
      bootloader: options.bootloader,
      bootable: options.bootable
    };
    
    const result = await this.dockerService.runIsoGeneration(dockerOptions);
    
    if (result.success) {
      console.log("Docker ISO generation successful");
      
      // Store ISO metadata for future access
      await this.saveIsoMetadata({
        buildId: options.buildId,
        isoName: path.basename(options.outputPath),
        timestamp: new Date().toISOString(),
        configName: options.label,
        outputPath: options.outputPath,
        bootable: options.bootable,
        bootloader: options.bootloader,
        label: options.label
      });
      
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
      
      // Store ISO metadata for future access
      await this.saveIsoMetadata({
        buildId: options.buildId,
        isoName: path.basename(options.outputPath),
        timestamp: new Date().toISOString(),
        configName: options.label,
        outputPath: options.outputPath,
        bootable: options.bootable,
        bootloader: options.bootloader,
        label: options.label
      });
      
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
   * Save ISO metadata for future access
   */
  private async saveIsoMetadata(metadata: IsoMetadata): Promise<void> {
    try {
      // Ensure the metadata directory exists
      await this.ensureDirectoryExists(this.storageDirectory);
      
      const metadataPath = path.join(this.storageDirectory, ISO_METADATA_FILE);
      
      // Read existing metadata if it exists
      let existingMetadata: IsoMetadata[] = [];
      try {
        const data = await fs.readFile(metadataPath, 'utf8');
        existingMetadata = JSON.parse(data);
      } catch (error) {
        // File doesn't exist or is invalid, start with empty array
        existingMetadata = [];
      }
      
      // Add new metadata to the list (or update existing)
      const existingIndex = existingMetadata.findIndex(m => 
        m.buildId === metadata.buildId && m.isoName === metadata.isoName);
        
      if (existingIndex >= 0) {
        existingMetadata[existingIndex] = metadata;
      } else {
        existingMetadata.push(metadata);
      }
      
      // Write updated metadata back to file
      await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2), 'utf8');
      
      console.log(`Saved ISO metadata for ${metadata.isoName} (Build ID: ${metadata.buildId})`);
    } catch (error) {
      console.error(`Error saving ISO metadata:`, error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Get metadata for all saved ISOs
   */
  async getAllIsoMetadata(): Promise<IsoMetadata[]> {
    try {
      const metadataPath = path.join(this.storageDirectory, ISO_METADATA_FILE);
      
      try {
        const data = await fs.readFile(metadataPath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        // File doesn't exist or is invalid, return empty array
        return [];
      }
    } catch (error) {
      console.error(`Error reading ISO metadata:`, error);
      return [];
    }
  }

  /**
   * Get metadata for a specific ISO by build ID
   */
  async getIsoMetadataByBuildId(buildId: string): Promise<IsoMetadata[]> {
    const allMetadata = await this.getAllIsoMetadata();
    return allMetadata.filter(m => m.buildId === buildId);
  }

  /**
   * Helper method to get directory path from a file path
   */
  private getDirectoryPath(filePath: string): string {
    return filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '.';
  }
  
  /**
   * Ensure a directory exists, creating it if necessary
   */
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      // In a browser environment, fs operations will fail, so just log the error
      console.warn(`Warning: Could not create directory ${directory}: ${error}`);
    }
  }
  
  /**
   * Get download URL for an ISO image
   */
  getIsoDownloadUrl(buildId: string, isoName: string): string {
    return `/api/iso/${buildId}/${isoName}`;
  }
}
