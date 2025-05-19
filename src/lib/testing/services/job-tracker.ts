
import { GenerationJob } from "../types/backend-types";

/**
 * Service for tracking ISO generation jobs
 */
export class JobTracker {
  private generationJobs: Record<string, GenerationJob> = {};

  /**
   * Add a new job to track
   */
  addJob(jobId: string, buildId: string, isDocker: boolean, containerId?: string): void {
    this.generationJobs[jobId] = {
      jobId,
      buildId,
      status: "pending",
      progress: 0,
      startTime: new Date(),
      message: isDocker ? "Starting local Docker container" : "Submitted to backend server",
      isDocker,
      containerId
    };
  }

  /**
   * Update an existing job
   */
  updateJob(
    jobId: string, 
    updates: Partial<Omit<GenerationJob, "jobId" | "buildId" | "isDocker" | "startTime">>
  ): void {
    if (this.generationJobs[jobId]) {
      this.generationJobs[jobId] = {
        ...this.generationJobs[jobId],
        ...updates
      };
    }
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): GenerationJob | undefined {
    return this.generationJobs[jobId];
  }

  /**
   * Get all active jobs
   */
  getAllJobs(): Record<string, GenerationJob> {
    return { ...this.generationJobs };
  }

  /**
   * Get active jobs for tracking
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
