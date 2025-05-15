
import { LFSTestConfiguration } from "./types";

/**
 * Predefined test configurations for LFS Builder
 */
export const TEST_CONFIGURATIONS: LFSTestConfiguration[] = [
  {
    name: "Minimal LFS Build",
    description: "A minimal build configuration with basic settings",
    target_disk: "/dev/sdb",
    sources_path: "/path/to/lfs/sources",
    scripts_path: "/path/to/lfs/scripts",
    user_inputs: {
      "create-lfs-user": "lfspassword123",
      "set-root-password-chroot": "rootpassword123"
    },
    expected_outcomes: {
      should_complete: true,
      expected_phases_to_complete: ["Initial Setup", "LFS User Build", "Chroot Setup"],
      expected_duration_minutes: 30
    },
    iso_generation: {
      generate: true,
      minimal_iso: true,
      expected_size_mb: 200
    }
  },
  {
    name: "Full LFS Build",
    description: "A complete LFS build with all phases",
    target_disk: "/dev/sdc",
    sources_path: "/opt/lfs/sources",
    scripts_path: "/opt/lfs/scripts",
    user_inputs: {
      "create-lfs-user": "securelfspass456",
      "set-root-password-chroot": "securerootpass789"
    },
    expected_outcomes: {
      should_complete: true,
      expected_phases_to_complete: ["Initial Setup", "LFS User Build", "Chroot Setup", "Chroot Build", "System Configuration", "Final Steps"],
      expected_duration_minutes: 180
    },
    iso_generation: {
      generate: true,
      minimal_iso: false,
      expected_size_mb: 800
    }
  },
  {
    name: "Error Test - Invalid Disk",
    description: "Tests error handling with an invalid disk device",
    target_disk: "/dev/nonexistent",
    sources_path: "/path/to/lfs/sources",
    scripts_path: "/path/to/lfs/scripts",
    user_inputs: {
      "create-lfs-user": "testpass123",
      "set-root-password-chroot": "testpass456"
    },
    expected_outcomes: {
      should_complete: false,
      expected_phases_to_complete: []
    },
    iso_generation: {
      generate: false,
      minimal_iso: false
    }
  }
];

/**
 * Get a test configuration by name
 */
export function getTestConfigurationByName(name: string): LFSTestConfiguration | undefined {
  return TEST_CONFIGURATIONS.find(config => config.name === name);
}

/**
 * Create a custom test configuration
 */
export function createCustomTestConfiguration(
  name: string,
  targetDisk: string,
  sourcesPath: string,
  scriptsPath: string,
  generateIso: boolean = false
): LFSTestConfiguration {
  return {
    name,
    description: `Custom test configuration: ${name}`,
    target_disk: targetDisk,
    sources_path: sourcesPath,
    scripts_path: scriptsPath,
    user_inputs: {
      "create-lfs-user": "custompassword123",
      "set-root-password-chroot": "customrootpass123"
    },
    expected_outcomes: {
      should_complete: true,
      expected_phases_to_complete: ["Initial Setup", "LFS User Build"]
    },
    iso_generation: {
      generate: generateIso,
      minimal_iso: generateIso
    }
  };
}
