
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
import { Database } from "@/integrations/supabase/types";

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
 * Save a new LFS build configuration
 */
export async function saveBuildConfiguration(config: Omit<LFSBuildConfig, 'id' | 'created_at' | 'user_id'>): Promise<LFSBuildConfig | null> {
  try {
    const { data, error } = await supabase
      .from('lfs_build_configs')
      .insert([config])
      .select();

    if (error) {
      console.error('Error saving build configuration:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Exception saving build configuration:', error);
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
      console.error('Error fetching build configurations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching build configurations:', error);
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
      console.error(`Error fetching build configuration with ID ${id}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Exception fetching build configuration with ID ${id}:`, error);
    return null;
  }
}

/**
 * Start tracking a new build
 */
export async function startBuild(configId: string): Promise<LFSBuildRecord | null> {
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
      console.error('Error starting build:', error);
      return null;
    }

    // Cast to ensure type safety
    return data?.[0] ? data[0] as LFSBuildRecord : null;
  } catch (error) {
    console.error('Exception starting build:', error);
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
      console.error(`Error updating build status for build ${buildId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Exception updating build status for build ${buildId}:`, error);
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
      console.error(`Error recording build step for build ${buildId}, step ${stepId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Exception recording build step for build ${buildId}, step ${stepId}:`, error);
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
      console.error(`Error fetching build steps for build ${buildId}:`, error);
      return [];
    }

    // Cast to ensure type safety
    return (data || []) as LFSBuildStep[];
  } catch (error) {
    console.error(`Exception fetching build steps for build ${buildId}:`, error);
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
      console.error(`Error fetching builds for config ${configId}:`, error);
      return [];
    }

    // Cast to ensure type safety
    return (data || []) as LFSBuildRecord[];
  } catch (error) {
    console.error(`Exception fetching builds for config ${configId}:`, error);
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
      console.error(`Error fetching logs for build ${buildId}, step ${stepId}:`, error);
      return null;
    }

    return data?.output_log || null;
  } catch (error) {
    console.error(`Exception fetching logs for build ${buildId}, step ${stepId}:`, error);
    return null;
  }
}
