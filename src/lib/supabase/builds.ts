
import { supabase } from "@/integrations/supabase/client";
import { LFSBuildRecord } from "./types";
import { ensureAuthenticated, handleError } from "./utils";
import { BuildPhase } from "../lfs-automation";

import { supabase } from "@/integrations/supabase/client";
import { LFSBuildRecord, LFSBuildStep as LFSBuildStepType } from "./types"; // Added LFSBuildStepType
import { ensureAuthenticated, handleError } from "./utils";
import { BuildPhase, BuildStatus as AppBuildStatus } from "../lfs-automation"; // Renamed BuildStatus to avoid conflict

/**
 * Start tracking a new build
 * @param configId The ID of the LFSBuildConfig used for this build, or null if not from a saved config.
 */
export async function startBuild(configId: string | null): Promise<LFSBuildRecord | null> {
  if (!ensureAuthenticated()) return null;

  const { data: { user } } = await supabase.auth.getUser(); // Get user for user_id
  if (!user) {
    handleError(new Error("User not found to start build."), "starting build");
    return null;
  }
  
  try {
    // Ensure all fields required by LFSBuildRecord (excluding defaults like id, started_at) are here
    const buildRecordData: Omit<LFSBuildRecord, 'id' | 'started_at' | 'user_id' | 'completed_at'> = {
      config_id: configId, // Can be null
      status: 'in_progress',
      current_phase: BuildPhase.INITIAL_SETUP, // Default starting phase
      current_step_id: null, // No step started yet, or provide first step id
      progress_percentage: 0,
      // user_id will be set below
    };

    const { data, error } = await supabase
      .from('lfs_builds') // Assumed table name from existing file
      .insert([{ ...buildRecordData, user_id: user.id }])
      .select()
      .single(); // Assuming you want a single record back

    if (error) {
      handleError(error, "starting new build");
      return null;
    }
    return data as LFSBuildRecord; // Type assertion
  } catch (e) {
    handleError(e, "starting new build");
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
      .from('lfs_builds') // Assumed table name
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
 * Get all builds for the current authenticated user, ordered by start time.
 */
export async function getAllUserBuilds(): Promise<LFSBuildRecord[]> {
  if (!ensureAuthenticated()) return [];

  // RLS should ensure that only builds belonging to the authenticated user are returned
  // if lfs_builds table has user_id and appropriate RLS policies are in place.
  // The user_id is being set in startBuild.
  try {
    const { data, error } = await supabase
      .from('lfs_builds')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      handleError(error, "fetching all user builds");
      return [];
    }
    return (data || []) as LFSBuildRecord[];
  } catch (error) {
    handleError(error, "fetching all user builds");
    return [];
  }
}

/**
 * Records a specific step's outcome in a build.
 * @param buildId The ID of the current build record.
 * @param stepId The unique identifier of the step (e.g., "01-partitioning").
 * @param status The status of the step (e.g., COMPLETED, FAILED).
 * @param outputLog Optional log output specific to this step.
 * @returns True if successful, false otherwise.
 */
export async function recordBuildStep(
  buildId: string,
  stepId: string,
  status: AppBuildStatus, // Using the aliased import
  outputLog?: string
): Promise<boolean> {
  if (!ensureAuthenticated()) {
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    handleError(new Error("User not found to record build step."), "recording build step");
    return false;
  }

  const stepData: Omit<LFSBuildStepType, 'id' | 'created_at' | 'user_id' | 'started_at' | 'completed_at'> = { // Ensure LFSBuildStepType matches this
    build_id: buildId,
    step_id: stepId, // This is the string id like "01-partitioning"
    status: status, // This should match the enum/type used in LFSBuildStepType
    output_log: outputLog,
    // user_id will be set below
  };

  // Note: LFSBuildStepType from types.ts has started_at and completed_at as optional.
  // Depending on DB schema, they might be auto-set or need to be explicitly set.
  // For simplicity here, we're not setting them explicitly.

  try {
    const { error } = await supabase
      .from('lfs_build_steps') // This table name is from the LFSBuildStepType context
      .insert([{ ...stepData, user_id: user.id }]);

    if (error) {
      handleError(error, `recording step ${stepId} for build ${buildId}`);
      return false;
    }
    return true;
  } catch (e) {
    handleError(e, `recording step ${stepId} for build ${buildId}`);
    return false;
  }
}
