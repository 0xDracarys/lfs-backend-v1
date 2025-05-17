# LFS Builder

LFS Builder is an advanced automation tool designed to streamline the Linux From Scratch (LFS) build process. This application provides a robust graphical user interface for managing the complex steps involved in creating a Linux system from source, with Docker integration for reproducible builds.

## Features

- **Docker-Powered Builds**: Ensure consistent and reproducible LFS builds across different environments
- **ISO Generation**: Create bootable ISO images from successful LFS builds
- **Phased Build Process**: Organizes the LFS build into clear, logical phases
- **Visual Command Execution**: Converts complex shell commands into simple button clicks
- **Context-Aware Interface**: Shows the current user context (root, lfs, chroot)
- **Progress Tracking**: Monitors build progress with visual indicators
- **Test Framework**: Validate your LFS build configurations and ISO generation

## Architecture

The application follows a modular architecture:

### Backend Components

- **DockerService**: Manages Docker operations for ISO generation and LFS building
- **IsoGenerator**: Creates bootable or data-only ISO images from LFS builds
- **TestRunner**: Executes test cases for LFS builds with specific configurations

### Frontend Components

- **LFSBuilder**: Main component for the LFS build process
- **TestRunner UI**: Interface for running tests and viewing results
- **ISO Generation UI**: Controls for ISO creation and configuration

## Docker Integration

LFS Builder uses Docker to ensure reproducible builds and isolate the build environment:

1. **Docker Image**: A custom Docker image (`lfs-iso-builder`) containing all necessary tools for ISO generation
2. **Build Process**: LFS builds run within Docker containers to ensure consistency
3. **Volume Mounting**: Source files and outputs are shared via Docker volumes
4. **Error Handling**: Comprehensive Docker operation error handling and logging

## ISO Generation

ISO generation supports multiple bootloaders and configurations:

- **GRUB**: The default bootloader for maximum compatibility
- **ISOLINUX**: Alternative bootloader option
- **Non-bootable**: Data-only ISO option

The process leverages industry-standard tools like `xorriso` within Docker containers.

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Docker - [installation instructions](https://docs.docker.com/get-docker/)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

### Docker Setup

Ensure Docker is installed and running on your system. The application will automatically:

1. Check for Docker availability
2. Build the required Docker image if not present
3. Use Docker for ISO generation when enabled

## Usage

### Running LFS Builds

1. Navigate to the main LFS Builder page
2. Select the desired build configuration
3. Follow the step-by-step process through each phase
4. Monitor progress in the real-time log viewer

### Generating ISO Images

1. Go to the Testing page
2. Enable Docker mode if available
3. Select or create a test configuration with ISO generation enabled
4. Run the test to build LFS and generate an ISO
5. Download the ISO when complete

### Test Configurations

Predefined test configurations are available, or create custom ones with:
- Target disk specification
- Source paths
- ISO generation options (bootable, bootloader type)
- Expected outcomes

## Development

### Key Files

- `src/lib/testing/docker-service.ts`: Docker integration
- `src/lib/testing/iso-generator.ts`: ISO creation logic
- `src/lib/testing/test-runner.ts`: Test execution system
- `src/components/TestRunner.tsx`: Test UI component
- `src/lib/testing/test-configurations.ts`: Test configuration definitions

### Adding New Test Configurations

Extend the `TEST_CONFIGURATIONS` array in `src/lib/testing/test-configurations.ts`:

```typescript
export const TEST_CONFIGURATIONS: LFSTestConfiguration[] = [
  {
    name: "Your Test Name",
    description: "Description of your test",
    target_disk: "/dev/sdX",
    sources_path: "/path/to/sources",
    scripts_path: "/path/to/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "your-iso.iso",
      bootable: true,
      bootloader: "grub"
    }
  },
  // ...other configurations
];
```

## Troubleshooting

### Docker Issues

- Ensure Docker daemon is running
- Check Docker permissions (user may need to be in the docker group)
- Verify Docker API access with `docker info`

### ISO Generation Failures

- Check Docker logs for detailed error information
- Verify source directory contains valid LFS build files
- Ensure output directory is writable

### Build Process Errors

- Review log output for specific error messages
- Verify all dependencies are installed
- Check if target disk has sufficient space and permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
