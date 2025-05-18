
import { IsoGenerationOptions } from "./types";
import { DockerService } from "./docker-service";
import { toast } from "sonner";

// Configuration for the backend service
const BACKEND_CONFIG = {
  apiUrl: process.env.ISO_BACKEND_URL || "http://localhost:3000",
  endpoints: {
    generateIso: "/api/iso/generate",
    status: "/api/iso/status",
    download: "/api/iso/download"
  },
  timeout: 300000 // 5 minutes timeout
};

/**
 * Backend service for real ISO generation
 * This service communicates with the Node.js backend server
 */
export class BackendService {
  private apiUrl: string;
  private dockerService: DockerService;
  
  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || BACKEND_CONFIG.apiUrl;
    this.dockerService = new DockerService();
    
    // Check if API is available on init
    this.checkApiAvailability();
  }
  
  /**
   * Check if the backend API is available
   */
  async checkApiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log("Backend API is available");
        return true;
      }
      
      console.warn("Backend API is not available:", response.statusText);
      return false;
    } catch (error) {
      console.warn("Backend API is not available:", error);
      return false;
    }
  }
  
  /**
   * Send a request to generate a real ISO file
   * 
   * @param options ISO generation options
   * @returns A job ID for tracking the generation process
   */
  async requestIsoGeneration(options: IsoGenerationOptions): Promise<{ jobId: string; status: string }> {
    try {
      // First check if local Docker is available as a fallback
      const dockerAvailable = await this.dockerService.checkDockerAvailability();
      
      // If Docker is available locally and the API is not responding, we can use local Docker
      if (dockerAvailable) {
        console.log("Local Docker is available as a fallback");
      }
      
      // Prepare request data
      const requestData = {
        buildId: options.buildId,
        label: options.label,
        bootable: options.bootable,
        bootloader: options.bootloader,
        // In a real implementation, we'd need to transfer source files
        // Here we're assuming the backend has access to the buildId directory
        sourceDir: options.sourceDir
      };
      
      // Send request to backend
      const response = await fetch(`${this.apiUrl}${BACKEND_CONFIG.endpoints.generateIso}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        timeout: BACKEND_CONFIG.timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.jobId) {
        throw new Error("Invalid response from backend, no job ID returned");
      }
      
      return result;
    } catch (error) {
      console.error("Error requesting ISO generation:", error);
      
      // Check if we can fall back to local Docker
      const dockerAvailable = await this.dockerService.checkDockerAvailability();
      
      if (dockerAvailable) {
        toast.info("Falling back to local Docker for ISO generation", {
          duration: 5000
        });
        
        // Use local Docker as fallback
        const localResult = await this.generateLocalIso(options);
        return { jobId: localResult.buildId, status: "processing" };
      }
      
      throw new Error(`Failed to request ISO generation: ${error}`);
    }
  }
  
  /**
   * Generate ISO locally using Docker as a fallback
   * This is used when the backend API is not available
   */
  private async generateLocalIso(options: IsoGenerationOptions): Promise<{
    buildId: string;
    outputPath: string;
  }> {
    console.log("Generating ISO locally using Docker...");
    
    try {
      // Use the DockerService to generate the ISO locally
      const result = await this.dockerService.runIsoGeneration({
        sourceDir: options.sourceDir,
        outputPath: options.outputPath,
        volumeLabel: options.label,
        bootloader: options.bootloader,
        bootable: options.bootable
      });
      
      if (!result.success) {
        throw new Error(`Local ISO generation failed: ${result.logs.join('\n')}`);
      }
      
      return {
        buildId: options.buildId,
        outputPath: options.outputPath
      };
    } catch (error) {
      console.error("Error generating ISO locally:", error);
      throw new Error(`Local ISO generation failed: ${error}`);
    }
  }
  
  /**
   * Check the status of an ISO generation job
   * 
   * @param jobId The job ID returned from requestIsoGeneration
   * @returns The current status of the job
   */
  async checkIsoGenerationStatus(jobId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    progress?: number;
    message?: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await fetch(`${this.apiUrl}${BACKEND_CONFIG.endpoints.status}/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error checking ISO generation status:", error);
      throw new Error(`Failed to check ISO generation status: ${error}`);
    }
  }
  
  /**
   * Get the download URL for a completed ISO
   * 
   * @param jobId The job ID of the completed ISO generation
   * @returns The URL to download the ISO
   */
  getIsoDownloadUrl(jobId: string, filename?: string): string {
    const filenameParam = filename ? `?filename=${encodeURIComponent(filename)}` : '';
    return `${this.apiUrl}${BACKEND_CONFIG.endpoints.download}/${jobId}${filenameParam}`;
  }
  
  /**
   * Trigger browser download of the ISO file
   * 
   * @param jobId The job ID of the completed ISO generation
   * @param filename Optional custom filename for the downloaded ISO
   */
  downloadIso(jobId: string, filename?: string): void {
    const downloadUrl = this.getIsoDownloadUrl(jobId, filename);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `lfs-${jobId}.iso`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("ISO download started", {
      description: `Your ISO file ${filename || `lfs-${jobId}.iso`} is being downloaded.`
    });
  }
}

/**
 * Create an instance of BackendService for use throughout the application
 */
export const backendService = new BackendService();
