
import { BuildPhase, BuildStatus } from "../lfs-automation";

// Types for Supabase data models
export interface LFSBuildConfig {
  id?: string;
  name: string;
  target_disk: string;
  sources_path: string;
  scripts_path: string;
  created_at?: string;
  user_id?: string;
}

export interface LFSBuildRecord {
  id?: string;
  config_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  current_phase: BuildPhase;
  current_step_id: string | null;
  progress_percentage: number;
  started_at?: string;
  completed_at?: string | null;
  user_id?: string;
}

export interface LFSBuildStep {
  id?: string;
  build_id: string;
  step_id: string;
  status: BuildStatus;
  started_at?: string;
  completed_at?: string | null;
  output_log?: string;
}
