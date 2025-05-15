
import { supabase } from "@/integrations/supabase/client";
import { LFSBuildStep } from "./types";
import { ensureAuthenticated, handleError } from "./utils";
import { BuildStatus } from "../lfs-automation";

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
