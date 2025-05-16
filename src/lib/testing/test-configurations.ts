
import { BuildPhase, UserContext } from "../lfs-automation";
import { LFSTestConfiguration, TestConfiguration } from "./types";

/**
 * Default test configurations for the LFS Builder testing framework
 */
export const DEFAULT_TEST_CONFIGURATIONS: Record<string, TestConfiguration> = {
  /**
   * Basic functional test for LFS Builder initial setup phase
   */
  basic: {
    id: "basic",
    name: "Basic Functional Test",
    description: "Tests the initial setup phase with minimal configuration",
    targetDisk: "/dev/sdb",
    lfsMountPoint: "/mnt/lfs",
    sourcesPath: "/sources",
    includePhases: [BuildPhase.INITIAL_SETUP, BuildPhase.LFS_USER_BUILD, BuildPhase.CHROOT_SETUP],
    automated: true,
    timeoutMinutes: 10,
    inputs: {
      "root-password": "rootpassword123",
      "lfs-password": "lfspassword123"
    }
  },
  
  /**
   * Complete test for full LFS build process
   */
  complete: {
    id: "complete",
    name: "Complete LFS Build",
    description: "Full LFS build with all phases and custom configurations",
    targetDisk: "/dev/sdc",
    lfsMountPoint: "/mnt/lfs-custom",
    sourcesPath: "/sources/lfs-11.2",
    includePhases: [
      BuildPhase.INITIAL_SETUP,
      BuildPhase.LFS_USER_BUILD,
      BuildPhase.CHROOT_SETUP,
      BuildPhase.CHROOT_BUILD,
      BuildPhase.SYSTEM_CONFIGURATION,
      BuildPhase.FINAL_STEPS
    ],
    automated: true,
    timeoutMinutes: 180,
    generateIso: true,
    inputs: {
      "root-password": "secureRootPass!",
      "lfs-password": "secureLfsPass!",
      "hostname": "lfs-test-machine",
      "domain": "local.test",
      "network-config": "dhcp"
    },
    customCommands: {
      afterInitialSetup: [
        "echo 'Custom setup complete' >> /mnt/lfs/setup.log",
        "mkdir -p /mnt/lfs/custom"
      ],
      beforeChrootEnter: [
        "cp /etc/resolv.conf /mnt/lfs/etc/",
        "touch /mnt/lfs/custom/chroot-ready"
      ]
    },
    kernelConfig: {
      enableModules: ["ext4", "usb-storage", "e1000e"],
      disableModules: ["bluetooth", "wireless"]
    }
  },
  
  /**
   * Test for minimal ISO generation
   */
  minimalIso: {
    id: "minimalIso",
    name: "Minimal ISO Generation Test",
    description: "Tests the generation of a minimal bootable ISO",
    targetDisk: "/dev/sdd",
    lfsMountPoint: "/mnt/lfs-iso",
    sourcesPath: "/sources/minimal",
    includePhases: [BuildPhase.INITIAL_SETUP, BuildPhase.LFS_USER_BUILD, BuildPhase.CHROOT_SETUP],
    automated: true,
    timeoutMinutes: 30,
    generateIso: true,
    inputs: {
      "root-password": "isotest123",
      "lfs-password": "isouser123"
    },
    isoOptions: {
      label: "LFS_MINIMAL",
      bootloaderType: "grub",
      includePackages: ["bash", "coreutils", "grep", "gzip", "linux-kernel", "busybox"],
      isoName: "lfs-minimal-test.iso"
    }
  }
};

/**
 * Predefined test configurations for LFS Builder
 */
export const TEST_CONFIGURATIONS: LFSTestConfiguration[] = [
  {
    name: "Default Build Test",
    description: "Tests the default LFS build configuration with minimal setup",
    target_disk: "/dev/sdb",
    sources_path: "/sources",
    scripts_path: "/scripts",
    iso_generation: {
      generate: false
    },
    expected_outcomes: {
      should_complete: true
    }
  },
  {
    name: "ISO Generation Test",
    description: "Tests the LFS build with ISO generation at the end",
    target_disk: "/dev/sdc",
    sources_path: "/sources/lfs-11.2",
    scripts_path: "/scripts/iso-build",
    iso_generation: {
      generate: true,
      iso_name: "lfs-test.iso"
    },
    expected_outcomes: {
      should_complete: true
    }
  },
  {
    name: "Error Handling Test",
    description: "Test that deliberately triggers an error to verify error handling",
    target_disk: "/invalid/disk/path",
    sources_path: "/nonexistent/sources",
    scripts_path: "/scripts",
    iso_generation: {
      generate: false
    },
    expected_outcomes: {
      should_complete: false,
      expected_error: "Invalid disk path"
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
  generateIso: boolean
): LFSTestConfiguration {
  return {
    name,
    description: `Custom test configuration: ${name}`,
    target_disk: targetDisk,
    sources_path: sourcesPath,
    scripts_path: scriptsPath,
    iso_generation: {
      generate: generateIso,
      iso_name: generateIso ? `${name.toLowerCase().replace(/\s+/g, '-')}.iso` : undefined
    },
    expected_outcomes: {
      should_complete: true
    }
  };
}
