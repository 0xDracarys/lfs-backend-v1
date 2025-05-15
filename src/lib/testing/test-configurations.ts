
import { BuildPhase, UserContext } from "../lfs-automation";
import { TestConfiguration } from "./types";

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
