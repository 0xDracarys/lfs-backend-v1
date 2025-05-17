
import { LFSTestConfiguration } from "./types";

// Sample test configurations for LFS builds
export const TEST_CONFIGURATIONS: LFSTestConfiguration[] = [
  {
    name: "Basic LFS Build",
    description: "Standard LFS build with minimal customizations",
    target_disk: "/dev/sda",
    sources_path: "/path/to/sources",
    scripts_path: "/path/to/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "lfs-basic.iso",
      bootable: true,
      bootloader: "grub"
    }
  },
  {
    name: "Advanced LFS Build",
    description: "LFS build with additional packages and customizations",
    target_disk: "/dev/sdb",
    sources_path: "/path/to/advanced/sources",
    scripts_path: "/path/to/advanced/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "lfs-advanced.iso",
      bootable: true,
      bootloader: "isolinux"
    }
  },
  {
    name: "Non-Bootable ISO Test",
    description: "Generate a non-bootable ISO for data purposes",
    target_disk: "/dev/sdc",
    sources_path: "/path/to/data/sources",
    scripts_path: "/path/to/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "lfs-data.iso",
      bootable: false
    }
  },
  {
    name: "Expected Failure Test",
    description: "Test case that is expected to fail with a specific error",
    target_disk: "/dev/invalid",
    sources_path: "/invalid/path",
    scripts_path: "/path/to/scripts",
    expected_outcomes: {
      should_complete: false,
      expected_error: "Invalid disk configuration"
    },
    iso_generation: {
      generate: false
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
  generateIso: boolean = false,
  bootable: boolean = true,
  bootloader: "grub" | "isolinux" | "none" = "grub"
): LFSTestConfiguration {
  return {
    name,
    description: `Custom test: ${name}`,
    target_disk: targetDisk,
    sources_path: sourcesPath,
    scripts_path: scriptsPath,
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: generateIso,
      iso_name: `lfs-custom-${Date.now()}.iso`,
      bootable,
      bootloader
    }
  };
}
