
import { LFSTestConfiguration } from "./types";

/**
 * Predefined test configurations for LFS builds
 * These configurations define different scenarios for testing the LFS build process
 * and ISO generation capabilities
 */
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
  },
  {
    name: "Minimal System Build",
    description: "Build a minimal LFS system with essential packages only",
    target_disk: "/dev/sdd",
    sources_path: "/path/to/minimal/sources",
    scripts_path: "/path/to/minimal/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "lfs-minimal.iso",
      bootable: true,
      bootloader: "grub"
    }
  },
  {
    name: "Server Configuration",
    description: "LFS build optimized for server use cases",
    target_disk: "/dev/sde",
    sources_path: "/path/to/server/sources",
    scripts_path: "/path/to/server/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "lfs-server.iso",
      bootable: true,
      bootloader: "grub"
    }
  }
];

/**
 * Get a test configuration by name
 * 
 * @param name The name of the test configuration to retrieve
 * @returns The requested test configuration or undefined if not found
 */
export function getTestConfigurationByName(name: string): LFSTestConfiguration | undefined {
  return TEST_CONFIGURATIONS.find(config => config.name === name);
}

/**
 * Create a custom test configuration with the specified parameters
 * 
 * @param name Test configuration name
 * @param targetDisk Target disk for LFS installation
 * @param sourcesPath Path to LFS source files
 * @param scriptsPath Path to build scripts
 * @param generateIso Whether to generate an ISO image
 * @param bootable Whether the ISO should be bootable
 * @param bootloader Bootloader to use (grub or isolinux)
 * @returns A new LFSTestConfiguration object
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
      iso_name: generateIso ? `lfs-custom-${name.toLowerCase().replace(/\s+/g, '-')}.iso` : undefined,
      bootable,
      bootloader
    }
  };
}
