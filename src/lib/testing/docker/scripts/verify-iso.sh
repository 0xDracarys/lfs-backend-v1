
#!/bin/bash
# Script to verify the generated ISO file

# Default values
ISO_FILE=""
BOOTABLE="false"

# Parse command line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --iso=*)
      ISO_FILE="${1#*=}"
      ;;
    --bootable=*)
      BOOTABLE="${1#*=}"
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

if [ ! -f "$ISO_FILE" ]; then
  echo "Error: ISO file not found: $ISO_FILE"
  exit 1
fi

echo "Verifying ISO file: $ISO_FILE"

# Check file size
FILE_SIZE=$(stat -c%s "$ISO_FILE")
if [ "$FILE_SIZE" -lt 10000000 ]; then
  echo "Warning: ISO file size is suspiciously small: $FILE_SIZE bytes"
else
  echo "ISO file size: $FILE_SIZE bytes ($(echo "scale=2; $FILE_SIZE/1048576" | bc) MB)"
fi

# Check ISO file format using file command
ISO_TYPE=$(file "$ISO_FILE")
echo "ISO file type: $ISO_TYPE"

# Run additional checks if the ISO is supposed to be bootable
if [ "$BOOTABLE" = "true" ]; then
  echo "Verifying bootable ISO..."
  
  # Check for boot catalog
  xorriso -indev "$ISO_FILE" -find / -name "*.cat" -print || echo "Warning: No boot catalog found"
  
  # Check for bootloader files
  xorriso -indev "$ISO_FILE" -find / -name "isolinux.bin" -print || echo "ISOLINUX not found"
  xorriso -indev "$ISO_FILE" -find / -name "bios.img" -print || echo "GRUB BIOS image not found"
  xorriso -indev "$ISO_FILE" -find / -name "bootx64.efi" -print || echo "EFI boot file not found"
  
  # Check for kernel and initramfs
  xorriso -indev "$ISO_FILE" -find / -name "vmlinuz" -print || echo "Warning: Linux kernel not found"
  xorriso -indev "$ISO_FILE" -find / -name "initrd.img" -print || echo "Warning: initramfs not found"
fi

# List top-level directories
echo "ISO contents (top level):"
xorriso -indev "$ISO_FILE" -ls / || echo "Failed to list ISO contents"

echo "ISO verification complete"
