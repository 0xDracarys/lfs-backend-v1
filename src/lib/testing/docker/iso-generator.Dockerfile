
# Base image with necessary ISO generation and LFS build tools
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install ISO generation tools and dependencies
RUN apt-get update && apt-get install -y \
    # ISO generation tools
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
    # LFS build essential tools
    binutils \
    gcc \
    g++ \
    make \
    bison \
    flex \
    gawk \
    texinfo \
    gettext \
    patch \
    # Utilities
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    rsync \
    file \
    vim \
    sudo \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up LFS user for building
RUN groupadd lfs && \
    useradd -m -s /bin/bash -g lfs lfs && \
    echo "lfs:lfs" | chpasswd && \
    echo "lfs ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/lfs

# Create working directories
WORKDIR /iso-build

# Create directories for build process
RUN mkdir -p /iso-build/input \
    /iso-build/output \
    /iso-build/temp \
    /iso-build/scripts \
    /iso-build/lfs-sources

# Copy ISO generation scripts
COPY scripts/generate-iso.sh /iso-build/scripts/
COPY scripts/prepare-bootloader.sh /iso-build/scripts/
COPY scripts/verify-iso.sh /iso-build/scripts/

# Make scripts executable
RUN chmod +x /iso-build/scripts/*.sh

# Set volume mount points
VOLUME ["/iso-build/input", "/iso-build/output", "/iso-build/lfs-sources"]

# Default command to generate an ISO
ENTRYPOINT ["/iso-build/scripts/generate-iso.sh"]

# Create a healthcheck to verify the container is working correctly
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD [ "test", "-e", "/iso-build" ]
