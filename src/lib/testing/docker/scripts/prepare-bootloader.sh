
#!/bin/bash
# Script to prepare bootloader configuration for ISO

# Exit on error
set -e

# Default values
SOURCE_DIR="."
BOOTLOADER_TYPE="grub"
ISO_LABEL="LFS_CUSTOM"

# Parse command line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --type=*)
      BOOTLOADER_TYPE="${1#*=}"
      ;;
    --source=*)
      SOURCE_DIR="${1#*=}"
      ;;
    --label=*)
      ISO_LABEL="${1#*=}"
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

# Prepare GRUB bootloader
prepare_grub() {
  echo "Preparing GRUB bootloader..."
  
  # Create necessary directories
  mkdir -p "$SOURCE_DIR/boot/grub"
  
  # Create GRUB configuration file
  cat > "$SOURCE_DIR/boot/grub/grub.cfg" << EOF
set default=0
set timeout=10

menuentry "LFS System ($ISO_LABEL)" {
  linux /boot/vmlinuz root=live:CDLABEL=$ISO_LABEL quiet
  initrd /boot/initrd.img
}

menuentry "LFS System - Verbose Mode" {
  linux /boot/vmlinuz root=live:CDLABEL=$ISO_LABEL
  initrd /boot/initrd.img
}
EOF

  # Create placeholder kernel and initramfs if they don't exist
  # In a real implementation, these would be actual files from the LFS build
  if [ ! -f "$SOURCE_DIR/boot/vmlinuz" ]; then
    echo "Warning: No kernel found, creating placeholder"
    dd if=/dev/zero of="$SOURCE_DIR/boot/vmlinuz" bs=1M count=4
  fi
  
  if [ ! -f "$SOURCE_DIR/boot/initrd.img" ]; then
    echo "Warning: No initramfs found, creating placeholder"
    dd if=/dev/zero of="$SOURCE_DIR/boot/initrd.img" bs=1M count=8
  fi
  
  # Create GRUB BIOS boot image
  mkdir -p "$SOURCE_DIR/boot/grub/i386-pc"
  cp -a /usr/lib/grub/i386-pc/* "$SOURCE_DIR/boot/grub/i386-pc/"
  
  grub-mkimage -O i386-pc -o "$SOURCE_DIR/boot/grub/core.img" \
    biosdisk iso9660 part_gpt part_msdos linux normal boot configfile loopback ls \
    search search_label search_fs_file search_fs_uuid gfxmenu gfxterm gfxterm_background \
    gfxterm_menu test all_video loadenv exfat ext2 fat help linux chain keylayouts
  
  cat /usr/lib/grub/i386-pc/cdboot.img "$SOURCE_DIR/boot/grub/core.img" > "$SOURCE_DIR/boot/grub/bios.img"
  
  # Create EFI boot image
  mkdir -p "$SOURCE_DIR/EFI/boot"
  
  # Create temporary directory for EFI image
  TEMP_EFI_DIR=$(mktemp -d)
  mkdir -p "$TEMP_EFI_DIR/EFI/boot"
  
  # Copy GRUB EFI files
  cp -a /usr/lib/grub/x86_64-efi "$TEMP_EFI_DIR/EFI/boot/"
  
  # Create GRUB EFI configuration
  mkdir -p "$TEMP_EFI_DIR/boot/grub"
  cp "$SOURCE_DIR/boot/grub/grub.cfg" "$TEMP_EFI_DIR/boot/grub/"
  
  # Create EFI bootloader
  grub-mkimage -O x86_64-efi -o "$TEMP_EFI_DIR/EFI/boot/bootx64.efi" \
    iso9660 fat part_gpt part_msdos normal boot linux configfile loopback ls \
    search search_label search_fs_file search_fs_uuid gfxmenu gfxterm gfxterm_background \
    gfxterm_menu test all_video loadenv exfat ext2 help linux chain keylayouts
  
  # Create FAT image for EFI boot
  dd if=/dev/zero of="$SOURCE_DIR/EFI/boot/efiboot.img" bs=1M count=16
  mkfs.vfat "$SOURCE_DIR/EFI/boot/efiboot.img"
  
  # Mount and copy files
  TEMP_MOUNT_DIR=$(mktemp -d)
  mount -o loop "$SOURCE_DIR/EFI/boot/efiboot.img" "$TEMP_MOUNT_DIR"
  cp -r "$TEMP_EFI_DIR/EFI" "$TEMP_MOUNT_DIR/"
  umount "$TEMP_MOUNT_DIR"
  
  # Cleanup
  rm -rf "$TEMP_EFI_DIR" "$TEMP_MOUNT_DIR"
  
  echo "GRUB bootloader preparation complete"
}

# Prepare ISOLINUX bootloader
prepare_isolinux() {
  echo "Preparing ISOLINUX bootloader..."
  
  # Create necessary directories
  mkdir -p "$SOURCE_DIR/isolinux"
  
  # Copy ISOLINUX files
  cp /usr/lib/ISOLINUX/isolinux.bin "$SOURCE_DIR/isolinux/"
  cp /usr/lib/syslinux/modules/bios/*.c32 "$SOURCE_DIR/isolinux/"
  
  # Create ISOLINUX configuration
  cat > "$SOURCE_DIR/isolinux/isolinux.cfg" << EOF
UI menu.c32
PROMPT 0
MENU TITLE LFS Boot Menu
TIMEOUT 300
DEFAULT lfs

LABEL lfs
  MENU LABEL LFS System ($ISO_LABEL)
  KERNEL /boot/vmlinuz
  APPEND initrd=/boot/initrd.img root=live:CDLABEL=$ISO_LABEL quiet

LABEL lfs_verbose
  MENU LABEL LFS System - Verbose Mode
  KERNEL /boot/vmlinuz
  APPEND initrd=/boot/initrd.img root=live:CDLABEL=$ISO_LABEL
EOF

  # Create placeholder kernel and initramfs if they don't exist
  mkdir -p "$SOURCE_DIR/boot"
  if [ ! -f "$SOURCE_DIR/boot/vmlinuz" ]; then
    echo "Warning: No kernel found, creating placeholder"
    dd if=/dev/zero of="$SOURCE_DIR/boot/vmlinuz" bs=1M count=4
  fi
  
  if [ ! -f "$SOURCE_DIR/boot/initrd.img" ]; then
    echo "Warning: No initramfs found, creating placeholder"
    dd if=/dev/zero of="$SOURCE_DIR/boot/initrd.img" bs=1M count=8
  fi
  
  echo "ISOLINUX bootloader preparation complete"
}

# Main execution
if [ "$BOOTLOADER_TYPE" = "grub" ]; then
  prepare_grub
elif [ "$BOOTLOADER_TYPE" = "isolinux" ]; then
  prepare_isolinux
else
  echo "Error: Unknown bootloader type '$BOOTLOADER_TYPE'"
  exit 1
fi

exit 0
