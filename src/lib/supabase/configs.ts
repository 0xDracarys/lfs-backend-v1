
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
