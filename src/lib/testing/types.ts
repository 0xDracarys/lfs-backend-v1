
import { BuildPhase } from "../lfs-automation";

/**
 * Test configuration for LFS builds
 */
export interface LFSTestConfiguration {
  name: string;
  description: string;
  target_disk: string;
  sources_path: string;
  scripts_path: string;
  user_inputs: {
    [stepId: string]: string;  // Maps step IDs to their expected input values
  };
  expected_outcomes: {
    should_complete: boolean;
    expected_phases_to_complete: BuildPhase[];
    expected_duration_minutes?: number;
  };
  iso_generation: {
    generate: boolean;
    minimal_iso: boolean;
    expected_size_mb?: number;
  };
}

/**
 * Test run results
 */
export interface TestRunResult {
  configId: string;
  buildId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in_progress' | 'completed' | 'failed';
  completedPhases: BuildPhase[];
  failedStep?: {
    stepId: string;
    error: string;
  };
  isoGenerated: boolean;
  isoDownloadUrl?: string;
  logs: string[];
}
