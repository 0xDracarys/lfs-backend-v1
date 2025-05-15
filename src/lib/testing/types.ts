
import { BuildPhase, BuildStatus } from "../lfs-automation";

/**
 * Configuration for an LFS test case
 */
export interface TestConfiguration {
  /** Unique identifier for this test configuration */
  id: string;
  
  /** Human-readable name for the test case */
  name: string;
  
  /** Description of what this test verifies */
  description: string;
  
  /** Target disk device for LFS installation */
  targetDisk: string;
  
  /** Mount point where LFS will be built */
  lfsMountPoint: string;
  
  /** Path to LFS sources */
  sourcesPath: string;
  
  /** Phases to include in the test */
  includePhases: BuildPhase[];
  
  /** Whether the test can run without user intervention */
  automated: boolean;
  
  /** Maximum time in minutes before the test is aborted */
  timeoutMinutes: number;
  
  /** Whether to generate an ISO image after the build */
  generateIso?: boolean;
  
  /** Pre-defined inputs for input requests during build */
  inputs: Record<string, string>;
  
  /** Custom commands to execute at different stages */
  customCommands?: {
    /** Commands to run after initial setup phase */
    afterInitialSetup?: string[];
    
    /** Commands to run before entering chroot */
    beforeChrootEnter?: string[];
    
    /** Commands to run after exiting chroot */
    afterChrootExit?: string[];
  };
  
  /** Kernel configuration options */
  kernelConfig?: {
    /** Kernel modules to explicitly enable */
    enableModules?: string[];
    
    /** Kernel modules to explicitly disable */
    disableModules?: string[];
  };
  
  /** ISO generation options */
  isoOptions?: {
    /** ISO volume label */
    label: string;
    
    /** Type of bootloader to use */
    bootloaderType: string;
    
    /** Packages to include in the ISO */
    includePackages: string[];
    
    /** Name of the generated ISO file */
    isoName: string;
  };
}

/**
 * Result of a test run
 */
export interface TestRunResult {
  /** ID of the test configuration used */
  configId: string;
  
  /** ID of the associated build */
  buildId: string;
  
  /** Time when the test started */
  startTime: Date;
  
  /** Time when the test finished */
  endTime: Date;
  
  /** Success or failure status */
  status: "success" | "failed" | "timeout" | "aborted";
  
  /** Phases that were successfully completed */
  completedPhases: string[];
  
  /** Logs from the test run */
  logs: string[];
  
  /** Whether an ISO was successfully generated */
  isoGenerated: boolean;
}

/**
 * Configuration for the test runner
 */
export interface TestConfig {
  /** Level of detail in logs */
  logLevel: "error" | "warn" | "info" | "debug";
  
  /** Whether to save test results */
  saveResults?: boolean;
  
  /** Directory to save results in */
  resultDir?: string;
}

/**
 * ISO generation options
 */
export interface IsoGenerationOptions {
  /** Source directory containing files to include in the ISO */
  sourceDir: string;
  
  /** Output path for the ISO file */
  outputPath: string;
  
  /** Volume label */
  label: string;
  
  /** Type of bootloader to use */
  bootloader: "grub" | "isolinux" | "none";
  
  /** Whether to make the ISO bootable */
  bootable: boolean;
}
