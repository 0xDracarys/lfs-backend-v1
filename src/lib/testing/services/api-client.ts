
import { BackendConfig } from "../types/backend-types";
import { IsoGenerationOptions } from "../types";
import { IsoGenerationResponse, IsoGenerationStatus } from "../types/backend-types";

/**
 * API client for interacting with the ISO generation backend
 */
export class ApiClient {
  private config: BackendConfig; // Store the whole config

  constructor(config: BackendConfig) {
    this.config = config; // Store the config object
  }

  /**
   * Checks if the API client is configured with an API URL.
   * @returns True if apiUrl is set, false otherwise.
   */
  public isConfigured(): boolean {
    return !!this.config.apiUrl;
  }

  /**
   * Check if the backend API is available
   */
  async checkApiAvailability(): Promise<boolean> {
    if (!this.config.apiUrl) {
      console.warn("Backend API URL is not configured. Skipping availability check.");
      return Promise.resolve(false);
    }
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
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
    if (!this.config.apiUrl) {
      throw new Error("ApiClient is not configured: apiUrl is missing.");
    }
    // Prepare request data
    const requestData = {
      buildId: options.buildId,
      label: options.label,
      bootable: options.bootable,
      bootloader: options.bootloader,
      sourceDir: options.sourceDir
    };
    
    // Send request to backend
    const response = await fetch(`${this.config.apiUrl}${this.config.endpoints.generateIso}`, {
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
    if (!this.config.apiUrl) {
      throw new Error("ApiClient is not configured: apiUrl is missing.");
    }
    const response = await fetch(`${this.config.apiUrl}${this.config.endpoints.status}/${jobId}`, {
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
    
    // If it's a local Docker job, return a local URL (this part might need re-evaluation if it's purely API client)
    if (isDocker) {
      // This suggests that local Docker "downloads" are handled by a local API endpoint.
      // If this ApiClient is strictly for a remote backend, this local case might be out of place.
      // For now, keeping logic as is but noting it.
      return `/api/iso/local/${jobId}${filenameParam}`;
    }

    if (!this.config.apiUrl) {
      // Cannot construct a backend download URL if apiUrl is not set.
      // Depending on desired behavior, could throw error or return a specific indicator.
      // Returning a placeholder or throwing an error are options.
      // Let's throw an error for clarity, as a URL is expected.
      throw new Error("ApiClient is not configured: apiUrl is missing, cannot generate download URL.");
    }
    
    return `${this.config.apiUrl}${this.config.endpoints.download}/${jobId}${filenameParam}`;
  }
}
