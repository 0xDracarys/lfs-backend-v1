
/**
 * LFS Builder Supabase Integration
 * 
 * This module contains functions for interacting with Supabase to:
 * - Store and manage build configurations
 * - Track build progress and status
 * - Save build logs
 */

import { supabase } from "@/integrations/supabase/client";
import { BuildPhase, BuildStatus } from "./lfs-automation";
import { toast } from "@/components/ui/use-toast";

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

/**
 * Check if user is authenticated and show toast if not
 */
const ensureAuthenticated = (): boolean => {
  const user = supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Authentication required",
      description: "You must be signed in to perform this action",
      variant: "destructive"
    });
    return false;
  }
  return true;
};

/**
 * Handle API errors consistently
 */
const handleError = (error: any, operation: string): void => {
  console.error(`Error ${operation}:`, error);
  toast({
    title: "Operation failed",
    description: `Failed to ${operation}. Please try again.`,
    variant: "destructive"
  });
};

/**
 * Save a new LFS build configuration
 */
export async function saveBuildConfiguration(config: Omit<LFSBuildConfig, 'id' | 'created_at' | 'user_id'>): Promise<LFSBuildConfig | null> {
  if (!ensureAuthenticated()) return null;
  
  try {
    const { data, error } = await supabase
      .from('lfs_build_configs')
      .insert([config])
      .select();

    if (error) {
      handleError(error, "saving build configuration");
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    handleError(error, "saving build configuration");
    return null;
  }
}

/**
 * Get all saved build configurations for the current user
 */
export async function getBuildConfigurations(): Promise<LFSBuildConfig[]> {
  try {
    const { data, error } = await supabase
      .from('lfs_build_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleError(error, "fetching build configurations");
      return [];
    }

    return data || [];
  } catch (error) {
    handleError(error, "fetching build configurations");
    return [];
  }
}

/**
 * Get a specific build configuration by ID
 */
export async function getBuildConfigurationById(id: string): Promise<LFSBuildConfig | null> {
  try {
    const { data, error } = await supabase
      .from('lfs_build_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleError(error, `fetching build configuration with ID ${id}`);
      return null;
    }

    return data;
  } catch (error) {
    handleError(error, `fetching build configuration with ID ${id}`);
    return null;
  }
}

/**
 * Start tracking a new build
 */
export async function startBuild(configId: string): Promise<LFSBuildRecord | null> {
  if (!ensureAuthenticated()) return null;
  
  try {
    const buildRecord: Omit<LFSBuildRecord, 'id' | 'started_at'> = {
      config_id: configId,
      status: 'in_progress',
      current_phase: BuildPhase.INITIAL_SETUP,
      current_step_id: null,
      progress_percentage: 0,
    };

    const { data, error } = await supabase
      .from('lfs_builds')
      .insert([buildRecord])
      .select();

    if (error) {
      handleError(error, "starting build");
      return null;
    }

    // Cast to ensure type safety
    return data?.[0] ? data[0] as LFSBuildRecord : null;
  } catch (error) {
    handleError(error, "starting build");
    return null;
  }
}

/**
 * Update the status of an ongoing build
 */
export async function updateBuildStatus(
  buildId: string, 
  status: LFSBuildRecord['status'], 
  currentPhase: BuildPhase,
  currentStepId: string | null,
  progressPercentage: number
): Promise<boolean> {
  if (!ensureAuthenticated()) return false;
  
  try {
    const updateData: Partial<LFSBuildRecord> = {
      status,
      current_phase: currentPhase,
      current_step_id: currentStepId,
      progress_percentage: progressPercentage,
    };

    // If the build is completed or failed, set the completion time
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('lfs_builds')
      .update(updateData)
      .eq('id', buildId);

    if (error) {
      handleError(error, `updating build status for build ${buildId}`);
      return false;
    }

    return true;
  } catch (error) {
    handleError(error, `updating build status for build ${buildId}`);
    return false;
  }
}

/**
 * Record a step's status and log
 */
export async function recordBuildStep(
  buildId: string,
  stepId: string,
  status: BuildStatus,
  outputLog?: string
): Promise<boolean> {
  if (!ensureAuthenticated()) return false;
  
  try {
    const stepData: Partial<LFSBuildStep> = {
      build_id: buildId,
      step_id: stepId,
      status,
      output_log: outputLog,
    };

    // If the step is completed or failed, set the completion time
    if (status === BuildStatus.COMPLETED || status === BuildStatus.FAILED) {
      stepData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('lfs_build_steps')
      .upsert([stepData as LFSBuildStep], { onConflict: 'build_id,step_id' })
      .select();

    if (error) {
      handleError(error, `recording build step for build ${buildId}, step ${stepId}`);
      return false;
    }

    return true;
  } catch (error) {
    handleError(error, `recording build step for build ${buildId}, step ${stepId}`);
    return false;
  }
}

/**
 * Get all step records for a specific build
 */
export async function getBuildSteps(buildId: string): Promise<LFSBuildStep[]> {
  try {
    const { data, error } = await supabase
      .from('lfs_build_steps')
      .select('*')
      .eq('build_id', buildId)
      .order('started_at', { ascending: true });

    if (error) {
      handleError(error, `fetching build steps for build ${buildId}`);
      return [];
    }

    // Cast to ensure type safety
    return (data || []) as LFSBuildStep[];
  } catch (error) {
    handleError(error, `fetching build steps for build ${buildId}`);
    return [];
  }
}

/**
 * Get all builds for a specific configuration
 */
export async function getBuildsForConfiguration(configId: string): Promise<LFSBuildRecord[]> {
  try {
    const { data, error } = await supabase
      .from('lfs_builds')
      .select('*')
      .eq('config_id', configId)
      .order('started_at', { ascending: false });

    if (error) {
      handleError(error, `fetching builds for config ${configId}`);
      return [];
    }

    // Cast to ensure type safety
    return (data || []) as LFSBuildRecord[];
  } catch (error) {
    handleError(error, `fetching builds for config ${configId}`);
    return [];
  }
}

/**
 * Get all logs for a specific step in a build
 */
export async function getStepLogs(buildId: string, stepId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('lfs_build_steps')
      .select('output_log')
      .eq('build_id', buildId)
      .eq('step_id', stepId)
      .single();

    if (error) {
      handleError(error, `fetching logs for build ${buildId}, step ${stepId}`);
      return null;
    }

    return data?.output_log || null;
  } catch (error) {
    handleError(error, `fetching logs for build ${buildId}, step ${stepId}`);
    return null;
  }
}
