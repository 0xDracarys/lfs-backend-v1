export interface IsoGenerationOptions {
  sourceDir: string;
  outputPath: string;
  label: string;
  bootloader: "grub" | "isolinux" | "none";
  bootable: boolean;
}

export interface ExpectedOutcomes {
  should_complete: boolean;
  expected_error?: string;
}

export interface IsoGenerationConfig {
  generate: boolean;
  iso_name?: string;
  bootable?: boolean;
  bootloader?: "grub" | "isolinux" | "none";
}

export interface LFSTestConfiguration {
  name: string;
  description: string;
  target_disk: string;
  sources_path: string;
  scripts_path: string;
  iso_generation: IsoGenerationConfig;
  expected_outcomes: ExpectedOutcomes;
}

export interface TestConfig {
  logLevel: "info" | "debug" | "warn" | "error";
}

export enum BuildStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped"
}

export interface TestRunResult {
  configId: string;
  buildId: string;
  startTime: Date;
  endTime?: Date;
  status: "success" | "failed";
  completedPhases: string[];
  logs: string[];
  failedStep?: {
    stepId: string;
    error: string;
  };
  isoGenerated?: boolean;
  isoDownloadUrl?: string;
}
