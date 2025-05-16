
/**
 * LFS Automation Types
 * 
 * Core types and enums used throughout the LFS automation system
 */

// User context types
export enum UserContext {
  ROOT = 'root',
  LFS_USER = 'lfs',
  CHROOT = 'chroot'
}

// Build phases
export enum BuildPhase {
  INITIAL_SETUP = 'Initial Setup',
  LFS_USER_BUILD = 'LFS User Build',
  CHROOT_SETUP = 'Chroot Setup',
  CHROOT_BUILD = 'Chroot Build',
  SYSTEM_CONFIGURATION = 'System Configuration',
  FINAL_STEPS = 'Final Steps'
}

// Status of a build step
export enum BuildStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// Build step definition
export interface BuildStep {
  id: string;
  name: string;
  description: string;
  phase: BuildPhase;
  context: UserContext;
  status: BuildStatus;
  requiresInput?: boolean;
  command?: string; // The actual shell command this step would execute
  estimatedTime?: number; // in seconds
  dependencies?: string[]; // IDs of steps that must complete before this one
  onComplete?: (output: string) => void;
  onError?: (error: string) => void;
}

// Input request types
export interface InputRequest {
  type: 'text' | 'password' | 'path' | 'confirm';
  message: string;
  default?: string;
  required?: boolean;
}

