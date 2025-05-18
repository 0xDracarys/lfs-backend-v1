
# Base image with necessary ISO generation tools
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install ISO generation tools and dependencies
RUN apt-get update && apt-get install -y \
    xorriso \
    isolinux \
    syslinux \
    grub-pc-bin \
    grub-efi-amd64-bin \
    mtools \
    dosfstools \
    squashfs-tools \
    cpio \
    genisoimage \
    curl \
    wget \
    python3 \
    python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create working directories
WORKDIR /iso-build

# Create directories for build process
RUN mkdir -p /iso-build/input \
    /iso-build/output \
    /iso-build/temp \
    /iso-build/scripts

# Copy ISO generation scripts
COPY scripts/generate-iso.sh /iso-build/scripts/
COPY scripts/prepare-bootloader.sh /iso-build/scripts/
COPY scripts/verify-iso.sh /iso-build/scripts/

# Make scripts executable
RUN chmod +x /iso-build/scripts/*.sh

# Default command to generate an ISO
ENTRYPOINT ["/iso-build/scripts/generate-iso.sh"]
