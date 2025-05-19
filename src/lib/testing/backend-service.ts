
import { IsoGenerationOptions } from "./types";
import { DockerService } from "./docker-service";
import { toast } from "sonner";

// Configuration for the backend service
const BACKEND_CONFIG = {
  apiUrl: import.meta.env.VITE_ISO_BACKEND_URL || "http://localhost:3000",
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
  private generationJobs: Record<string, {
    jobId: string;
    buildId: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    containerId?: string;
    startTime: Date;
    message?: string;
    isDocker: boolean;
  }> = {};
  
  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || BACKEND_CONFIG.apiUrl;
    this.dockerService = new DockerService();
    
    // Listen for Docker container status updates
    this.dockerService.onStatusUpdate(this.handleDockerStatusUpdate);
    
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
   * Handle Docker container status updates
   */
  private handleDockerStatusUpdate = (containerStatus: any) => {
    // Find the job that corresponds to this container
    const jobEntries = Object.entries(this.generationJobs);
    for (const [jobId, job] of jobEntries) {
      if (job.isDocker && job.containerId === containerStatus.containerId) {
        // Update job status based on container status
        this.generationJobs[jobId] = {
          ...job,
          status: containerStatus.running ? "processing" : (containerStatus.progress >= 100 ? "completed" : "failed"),
          progress: containerStatus.progress,
          message: containerStatus.logs[containerStatus.logs.length - 1] || job.message
        };
        
        // If container is no longer running and job isn't marked as completed, mark as failed
        if (!containerStatus.running && job.status !== "completed" && containerStatus.progress < 100) {
          this.generationJobs[jobId].status = "failed";
          this.generationJobs[jobId].message = "Container stopped unexpectedly";
        }
        
        break;
      }
    }
  };
  
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
      
      // Try to send request to backend
      try {
        // Send request to backend
        const response = await fetch(`${this.apiUrl}${BACKEND_CONFIG.endpoints.generateIso}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
          signal: AbortSignal.timeout(10000) // 10 second timeout for initial request
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Backend error: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.jobId) {
          throw new Error("Invalid response from backend, no job ID returned");
        }
        
        // Store job information
        this.generationJobs[result.jobId] = {
          jobId: result.jobId,
          buildId: options.buildId,
          status: "pending",
          progress: 0,
          startTime: new Date(),
          message: "Submitted to backend server",
          isDocker: false
        };
        
        return result;
      } catch (error) {
        console.error("Error connecting to backend server:", error);
        
        // If backend request failed and Docker is available, use it as fallback
        if (dockerAvailable) {
          toast.info("Using local Docker for ISO generation", {
            description: "Backend server not available, using local Docker instead."
          });
          
          // Fall back to local Docker
          return this.generateLocalIso(options);
        } else {
          throw error; // Re-throw if Docker is not available
        }
      }
    } catch (error) {
      console.error("Error requesting ISO generation:", error);
      
      // Check if we can fall back to local Docker
      const dockerAvailable = await this.dockerService.checkDockerAvailability();
      
      if (dockerAvailable) {
        toast.info("Falling back to local Docker for ISO generation", {
          duration: 5000
        });
        
        // Use local Docker as fallback
        return this.generateLocalIso(options);
      }
      
      throw new Error(`Failed to request ISO generation: ${error}`);
    }
  }
  
  /**
   * Generate ISO locally using Docker as a fallback
   * This is used when the backend API is not available
   */
  private async generateLocalIso(options: IsoGenerationOptions): Promise<{
    jobId: string;
    status: string;
  }> {
    console.log("Generating ISO locally using Docker...");
    
    try {
      // Generate a job ID
      const jobId = `local-${Date.now()}`;
      
      // Start Docker container for ISO generation
      const containerStatus = this.dockerService.getContainerStatus();
      
      // Initialize job status
      this.generationJobs[jobId] = {
        jobId,
        buildId: options.buildId,
        status: "pending",
        progress: 0,
        startTime: new Date(),
        containerId: containerStatus.containerId,
        message: "Starting local Docker container",
        isDocker: true
      };
      
      // Start the ISO generation process asynchronously
      this.runLocalIsoGeneration(jobId, options).catch(error => {
        console.error("Error in local ISO generation:", error);
        this.generationJobs[jobId].status = "failed";
        this.generationJobs[jobId].message = `Error: ${error}`;
      });
      
      return {
        jobId,
        status: "pending"
      };
    } catch (error) {
      console.error("Error generating ISO locally:", error);
      throw new Error(`Local ISO generation failed: ${error}`);
    }
  }
  
  /**
   * Run the local ISO generation process in a Docker container
   */
  private async runLocalIsoGeneration(jobId: string, options: IsoGenerationOptions): Promise<void> {
    try {
      // Use the DockerService to generate the ISO locally
      const result = await this.dockerService.runIsoGeneration({
        sourceDir: options.sourceDir,
        outputPath: options.outputPath,
        volumeLabel: options.label,
        bootloader: options.bootloader,
        bootable: options.bootable
      });
      
      // Update job status based on result
      this.generationJobs[jobId] = {
        ...this.generationJobs[jobId],
        status: result.success ? "completed" : "failed",
        progress: result.success ? 100 : 0,
        message: result.success 
          ? `ISO generated successfully: ${result.output}` 
          : `ISO generation failed: ${result.logs[result.logs.length - 1] || "Unknown error"}`
      };
      
      if (!result.success) {
        throw new Error(`Local ISO generation failed: ${result.logs.join('\n')}`);
      }
    } catch (error) {
      console.error("Error generating ISO locally:", error);
      
      // Update job with failed status
      this.generationJobs[jobId] = {
        ...this.generationJobs[jobId],
        status: "failed",
        progress: 0,
        message: `Error: ${error}`
      };
      
      throw error;
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
    // Check if we have a local job with this ID
    if (this.generationJobs[jobId]) {
      const job = this.generationJobs[jobId];
      
      // If using local Docker, sync with Docker container status
      if (job.isDocker && job.containerId) {
        const containerStatus = this.dockerService.getContainerStatus();
        
        if (containerStatus.containerId === job.containerId) {
          // Update progress from Docker container
          job.progress = containerStatus.progress;
          job.message = containerStatus.logs[containerStatus.logs.length - 1] || job.message;
          
          // Update status based on Docker container state
          if (!containerStatus.running) {
            if (containerStatus.progress >= 100) {
              job.status = "completed";
            } else if (job.status !== "completed") {
              job.status = "failed";
              job.message = "Container stopped unexpectedly";
            }
          }
        }
      }
      
      return {
        status: job.status,
        progress: job.progress,
        message: job.message,
        downloadUrl: job.status === "completed" ? this.getIsoDownloadUrl(jobId) : undefined
      };
    }
    
    // If not a local job, check with backend API
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
    
    // If it's a local Docker job, return a local URL
    if (this.generationJobs[jobId]?.isDocker) {
      // In a real implementation, this would be a local file URL
      // For now, we'll return a simulated URL
      return `/api/iso/local/${jobId}${filenameParam}`;
    }
    
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
  
  /**
   * Get all active generation jobs
   */
  getActiveJobs(): Record<string, {
    jobId: string;
    buildId: string;
    status: string;
    progress: number;
    isDocker: boolean;
    startTime: Date;
  }> {
    return Object.fromEntries(
      Object.entries(this.generationJobs)
        .map(([jobId, job]) => [jobId, {
          jobId,
          buildId: job.buildId,
          status: job.status,
          progress: job.progress,
          isDocker: job.isDocker,
          startTime: job.startTime
        }])
    );
  }
}

/**
 * Create an instance of BackendService for use throughout the application
 */
export const backendService = new BackendService();
