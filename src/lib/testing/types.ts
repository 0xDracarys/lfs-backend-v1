
export interface IsoGenerationOptions {
  sourceDir: string;
  outputPath: string;
  label: string;
  bootable: boolean;
  bootloader: "grub" | "isolinux" | "none";
  buildId: string;
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
  use_docker?: boolean;
  lfs_build?: boolean;
}

export interface LFSTestConfiguration {
  name: string;
  description: string;
  target_disk: string;
  sources_path: string;
  scripts_path: string;
  iso_generation: IsoGenerationConfig;
  expected_outcomes: ExpectedOutcomes;
  docker_enabled?: boolean;
}

export interface TestConfig {
  logLevel: "info" | "debug" | "warn" | "error";
  docker?: {
    enabled: boolean;
    image: string;
  };
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
  dockerContainerId?: string;
  dockerStatus?: "not_used" | "running" | "completed" | "failed";
}

// Interface for ISO metadata
export interface IsoMetadata {
  buildId: string;
  isoName: string;
  timestamp: string;
  configName: string;
  outputPath: string;
  bootable: boolean;
  bootloader: string;
  label?: string;
  jobId?: string;
  dockerGenerated?: boolean;
}

// Define docker service specific types
export interface DockerIsoOptions {
  sourceDir: string;
  outputPath: string;
  volumeLabel: string;
  bootable: boolean;
  bootloader: "grub" | "isolinux" | "none";
  runLfsBuild?: boolean;
}

export interface DockerResult {
  success: boolean;
  logs: string[];
  output?: string;
}
