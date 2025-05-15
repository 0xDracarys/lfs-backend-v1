
import { supabase } from "@/integrations/supabase/client";
import { LFSBuildRecord } from "./types";
import { ensureAuthenticated, handleError } from "./utils";
import { BuildPhase } from "../lfs-automation";

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
