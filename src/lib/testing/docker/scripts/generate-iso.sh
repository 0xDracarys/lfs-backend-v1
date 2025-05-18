
#!/bin/bash
# This script generates an ISO image from an LFS build directory

# Exit on error
set -e

# Default values
SOURCE_DIR="/input"
OUTPUT_DIR="/output"
ISO_NAME="lfs-custom.iso"
ISO_LABEL="LFS_CUSTOM"
BOOTABLE="true"
BOOTLOADER="grub"

# Parse command line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --source=*)
      SOURCE_DIR="${1#*=}"
      ;;
    --output=*)
      OUTPUT_DIR="${1#*=}"
      ;;
    --iso-name=*)
      ISO_NAME="${1#*=}"
      ;;
    --label=*)
      ISO_LABEL="${1#*=}"
      ;;
    --bootable=*)
      BOOTABLE="${1#*=}"
      ;;
    --bootloader=*)
      BOOTLOADER="${1#*=}"
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

# Ensure source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory '$SOURCE_DIR' does not exist."
  exit 1
fi

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Create a temporary working directory
TEMP_DIR="/iso-build/temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/iso"

# Copy source files to temporary directory
echo "Copying source files to temporary directory..."
cp -a "$SOURCE_DIR/." "$TEMP_DIR/iso/"

# Create necessary directories for ISO structure
mkdir -p "$TEMP_DIR/iso/boot"
mkdir -p "$TEMP_DIR/iso/isolinux"
mkdir -p "$TEMP_DIR/iso/EFI/BOOT" 2>/dev/null || true

# Generate ISO metadata
echo "Generating ISO metadata..."
echo "LFS CUSTOM BUILD" > "$TEMP_DIR/iso/README.md"
echo "Build Date: $(date)" >> "$TEMP_DIR/iso/README.md"
echo "ISO Label: $ISO_LABEL" >> "$TEMP_DIR/iso/README.md"

# Handle bootloader configuration if bootable
if [ "$BOOTABLE" = "true" ]; then
  echo "Configuring bootloader: $BOOTLOADER"
  
  if [ "$BOOTLOADER" = "grub" ]; then
    # Configure GRUB bootloader
    # Call the prepare-bootloader script with GRUB option
    /iso-build/scripts/prepare-bootloader.sh --type=grub --source="$TEMP_DIR/iso" --label="$ISO_LABEL"
  elif [ "$BOOTLOADER" = "isolinux" ]; then
    # Configure ISOLINUX bootloader
    # Call the prepare-bootloader script with ISOLINUX option
    /iso-build/scripts/prepare-bootloader.sh --type=isolinux --source="$TEMP_DIR/iso" --label="$ISO_LABEL"
  else
    echo "Warning: Unknown bootloader type '$BOOTLOADER', creating non-bootable ISO"
    BOOTABLE="false"
  fi
fi

# Generate the ISO image
echo "Generating ISO image: $ISO_NAME"

if [ "$BOOTABLE" = "true" ]; then
  if [ "$BOOTLOADER" = "grub" ]; then
    # Generate bootable ISO with GRUB
    xorriso -as mkisofs \
      -iso-level 3 \
      -full-iso9660-filenames \
      -volid "$ISO_LABEL" \
      -eltorito-boot boot/grub/bios.img \
      -no-emul-boot \
      -boot-load-size 4 \
      -boot-info-table \
      --eltorito-catalog boot/grub/boot.cat \
      --grub2-boot-info \
      --grub2-mbr /usr/lib/grub/i386-pc/boot_hybrid.img \
      -eltorito-alt-boot \
      -e EFI/boot/efiboot.img \
      -no-emul-boot \
      -append_partition 2 C12A7328-F81F-11D2-BA4B-00A0C93EC93B "$TEMP_DIR/iso/EFI/boot/efiboot.img" \
      -output "$OUTPUT_DIR/$ISO_NAME" \
      -graft-points \
      "$TEMP_DIR/iso"
  elif [ "$BOOTLOADER" = "isolinux" ]; then
    # Generate bootable ISO with ISOLINUX
    xorriso -as mkisofs \
      -iso-level 3 \
      -full-iso9660-filenames \
      -volid "$ISO_LABEL" \
      -eltorito-boot isolinux/isolinux.bin \
      -eltorito-catalog isolinux/boot.cat \
      -no-emul-boot -boot-load-size 4 -boot-info-table \
      -output "$OUTPUT_DIR/$ISO_NAME" \
      "$TEMP_DIR/iso"
  fi
else
  # Generate non-bootable ISO
  xorriso -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "$ISO_LABEL" \
    -output "$OUTPUT_DIR/$ISO_NAME" \
    "$TEMP_DIR/iso"
fi

# Verify the generated ISO
echo "Verifying ISO image..."
if [ -f "$OUTPUT_DIR/$ISO_NAME" ]; then
  ISO_SIZE=$(du -h "$OUTPUT_DIR/$ISO_NAME" | cut -f1)
  echo "ISO generation successful: $ISO_NAME (Size: $ISO_SIZE)"
  
  # Run verification script
  /iso-build/scripts/verify-iso.sh --iso="$OUTPUT_DIR/$ISO_NAME" --bootable="$BOOTABLE"
  
  # Calculate checksum
  md5sum "$OUTPUT_DIR/$ISO_NAME" > "$OUTPUT_DIR/${ISO_NAME}.md5"
  sha256sum "$OUTPUT_DIR/$ISO_NAME" > "$OUTPUT_DIR/${ISO_NAME}.sha256"
  
  echo "Checksums generated:"
  cat "$OUTPUT_DIR/${ISO_NAME}.md5"
  cat "$OUTPUT_DIR/${ISO_NAME}.sha256"
else
  echo "Error: ISO generation failed, no output file found."
  exit 1
fi

# Clean up
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "ISO generation completed: $OUTPUT_DIR/$ISO_NAME"
