
import { IsoGenerationOptions } from "../types";

/**
 * Configuration for the backend service
 */
export interface BackendConfig {
  apiUrl: string;
  endpoints: {
    generateIso: string;
    status: string;
    download: string;
  };
  timeout: number;
}

/**
 * Status of an ISO generation job
 */
export interface GenerationJob {
  jobId: string;
  buildId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  containerId?: string;
  startTime: Date;
  message?: string;
  isDocker: boolean;
}

/**
 * Result of checking ISO generation status
 */
export interface IsoGenerationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  message?: string;
  downloadUrl?: string;
}

/**
 * Response from ISO generation request
 */
export interface IsoGenerationResponse {
  jobId: string;
  status: string;
}
