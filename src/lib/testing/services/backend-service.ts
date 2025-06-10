
import { IsoGenerationOptions } from "../types";
import { DockerService } from "../docker-service";
import { toast } from "sonner";
import { BACKEND_CONFIG } from "../config/backend-config";
import { JobTracker } from "./job-tracker";
import { ApiClient } from "./api-client";
import { IsoGenerationStatus } from "../types/backend-types";

/**
 * Backend service for real ISO generation
 * This service communicates with the Node.js backend server
 */
export class BackendService {
  private apiClient: ApiClient;
  private dockerService: DockerService;
  private jobTracker: JobTracker;
  
  constructor(apiUrl?: string) {
    const config = { ...BACKEND_CONFIG };
    if (apiUrl) {
      config.apiUrl = apiUrl;
    }
    
    this.apiClient = new ApiClient(config);
    this.dockerService = new DockerService();
    this.jobTracker = new JobTracker();
    
    // Listen for Docker container status updates
    this.dockerService.onStatusUpdate(this.handleDockerStatusUpdate);
    
    // Check if API is available on init
    this.apiClient.checkApiAvailability();
  }

  /**
   * Checks if the API client (and thus the backend service for remote operations) is configured with an API URL.
   * @returns True if apiUrl is set in the ApiClient's config, false otherwise.
   */
  public isApiConfigured(): boolean {
    return this.apiClient.isConfigured();
  }
  
  /**
   * Check if the backend API is available
   */
  async checkApiAvailability(): Promise<boolean> {
    return this.apiClient.checkApiAvailability();
  }
  
  /**
   * Handle Docker container status updates
   */
  private handleDockerStatusUpdate = (containerStatus: any) => {
    // Find the job that corresponds to this container
    const jobs = this.jobTracker.getAllJobs();
    const jobEntries = Object.entries(jobs);
    
    for (const [jobId, job] of jobEntries) {
      if (job.isDocker && job.containerId === containerStatus.containerId) {
        // Update job status based on container status
        this.jobTracker.updateJob(jobId, {
          status: containerStatus.running ? "processing" : (containerStatus.progress >= 100 ? "completed" : "failed"),
          progress: containerStatus.progress,
          message: containerStatus.logs[containerStatus.logs.length - 1] || job.message
        });
        
        // If container is no longer running and job isn't marked as completed, mark as failed
        if (!containerStatus.running && job.status !== "completed" && containerStatus.progress < 100) {
          this.jobTracker.updateJob(jobId, {
            status: "failed",
            message: "Container stopped unexpectedly"
          });
        }
        
        break;
      }
    }
  };
  
  /**
   * Send a request to generate a real ISO file
   */
  async requestIsoGeneration(options: IsoGenerationOptions): Promise<{ jobId: string; status: string }> {
    try {
      // First check if local Docker is available as a fallback
      const dockerAvailable = await this.dockerService.checkDockerAvailability();
      
      // If Docker is available locally and the API is not responding, we can use local Docker
      if (dockerAvailable) {
        console.log("Local Docker is available as a fallback");
      }
      
      // Try to send request to backend
      try {
        // Send request to backend
        const result = await this.apiClient.requestIsoGeneration(options);
        
        // Store job information
        this.jobTracker.addJob(result.jobId, options.buildId, false);
        
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
      this.jobTracker.addJob(jobId, options.buildId, true, containerStatus.containerId);
      
      // Start the ISO generation process asynchronously
      this.runLocalIsoGeneration(jobId, options).catch(error => {
        console.error("Error in local ISO generation:", error);
        this.jobTracker.updateJob(jobId, {
          status: "failed",
          message: `Error: ${error}`
        });
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
      this.jobTracker.updateJob(jobId, {
        status: result.success ? "completed" : "failed",
        progress: result.success ? 100 : 0,
        message: result.success 
          ? `ISO generated successfully: ${result.output}` 
          : `ISO generation failed: ${result.logs[result.logs.length - 1] || "Unknown error"}`
      });
      
      if (!result.success) {
        throw new Error(`Local ISO generation failed: ${result.logs.join('\n')}`);
      }
    } catch (error) {
      console.error("Error generating ISO locally:", error);
      
      // Update job with failed status
      this.jobTracker.updateJob(jobId, {
        status: "failed",
        progress: 0,
        message: `Error: ${error}`
      });
      
      throw error;
    }
  }
  
  /**
   * Check the status of an ISO generation job
   */
  async checkIsoGenerationStatus(jobId: string): Promise<IsoGenerationStatus> {
    // Check if we have a local job with this ID
    const job = this.jobTracker.getJob(jobId);
    
    if (job) {
      // If using local Docker, sync with Docker container status
      if (job.isDocker && job.containerId) {
        const containerStatus = this.dockerService.getContainerStatus();
        
        if (containerStatus.containerId === job.containerId) {
          // Update progress from Docker container
          this.jobTracker.updateJob(jobId, {
            progress: containerStatus.progress,
            message: containerStatus.logs[containerStatus.logs.length - 1] || job.message
          });
          
          // Update status based on Docker container state
          if (!containerStatus.running) {
            if (containerStatus.progress >= 100) {
              this.jobTracker.updateJob(jobId, { status: "completed" });
            } else if (job.status !== "completed") {
              this.jobTracker.updateJob(jobId, {
                status: "failed",
                message: "Container stopped unexpectedly"
              });
            }
          }
        }
      }
      
      // Get the updated job
      const updatedJob = this.jobTracker.getJob(jobId);
      if (updatedJob) {
        return {
          status: updatedJob.status,
          progress: updatedJob.progress,
          message: updatedJob.message,
          downloadUrl: updatedJob.status === "completed" ? this.getIsoDownloadUrl(jobId) : undefined
        };
      }
    }
    
    // If not a local job, check with backend API
    try {
      return await this.apiClient.checkIsoGenerationStatus(jobId);
    } catch (error) {
      console.error("Error checking ISO generation status:", error);
      throw new Error(`Failed to check ISO generation status: ${error}`);
    }
  }
  
  /**
   * Get the download URL for a completed ISO
   */
  getIsoDownloadUrl(jobId: string, filename?: string): string {
    const job = this.jobTracker.getJob(jobId);
    return this.apiClient.getIsoDownloadUrl(jobId, filename, job?.isDocker || false);
  }
  
  /**
   * Trigger browser download of the ISO file
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
    return this.jobTracker.getActiveJobs();
  }
}

/**
 * Create an instance of BackendService for use throughout the application
 */
export const backendService = new BackendService();
