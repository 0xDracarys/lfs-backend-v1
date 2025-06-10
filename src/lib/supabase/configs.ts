
import { supabase } from "@/integrations/supabase/client";
import { LFSBuildConfig } from "./types";
import { ensureAuthenticated, handleError } from "./utils";

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
 * Deletes a build configuration by its ID.
 * @param configId The ID of the configuration to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export async function deleteBuildConfiguration(configId: string): Promise<boolean> {
  if (!ensureAuthenticated()) {
    // ensureAuthenticated already shows a toast, so just return false
    return false;
  }

  try {
    const { error } = await supabase
      .from('lfs_build_configs')
      .delete()
      .eq('id', configId);

    if (error) {
      handleError(error, `deleting build configuration with ID ${configId}`);
      return false;
    }

    // It's conventional to show success feedback where the action is initiated (e.g., in the component)
    // But if handleError also handles success or if a generic success toast is desired here, it could be added.
    // For now, success is indicated by returning true, component will show toast.
    return true;
  } catch (error) {
    handleError(error, `deleting build configuration with ID ${configId}`);
    return false;
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
