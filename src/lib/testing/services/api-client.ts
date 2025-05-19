
import { BackendConfig } from "../types/backend-types";
import { IsoGenerationOptions } from "../types";
import { IsoGenerationResponse, IsoGenerationStatus } from "../types/backend-types";

/**
 * API client for interacting with the ISO generation backend
 */
export class ApiClient {
  private apiUrl: string;
  private endpoints: BackendConfig["endpoints"];
  
  constructor(config: BackendConfig) {
    this.apiUrl = config.apiUrl;
    this.endpoints = config.endpoints;
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
   * Request ISO generation from the backend
   */
  async requestIsoGeneration(options: IsoGenerationOptions): Promise<IsoGenerationResponse> {
    // Prepare request data
    const requestData = {
      buildId: options.buildId,
      label: options.label,
      bootable: options.bootable,
      bootloader: options.bootloader,
      sourceDir: options.sourceDir
    };
    
    // Send request to backend
    const response = await fetch(`${this.apiUrl}${this.endpoints.generateIso}`, {
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
    
    return result;
  }

  /**
   * Check the status of an ISO generation job
   */
  async checkIsoGenerationStatus(jobId: string): Promise<IsoGenerationStatus> {
    const response = await fetch(`${this.apiUrl}${this.endpoints.status}/${jobId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  }

  /**
   * Get the download URL for a completed ISO
   */
  getIsoDownloadUrl(jobId: string, filename?: string, isDocker: boolean = false): string {
    const filenameParam = filename ? `?filename=${encodeURIComponent(filename)}` : '';
    
    // If it's a local Docker job, return a local URL
    if (isDocker) {
      return `/api/iso/local/${jobId}${filenameParam}`;
    }
    
    return `${this.apiUrl}${this.endpoints.download}/${jobId}${filenameParam}`;
  }
}
