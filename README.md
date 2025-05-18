
# LFS Builder
URL: lfs-backend-v1.lovable.app

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
  - Handles Docker availability checking
  - Manages Docker image building
  - Executes commands within Docker containers
  - Provides comprehensive error handling for Docker operations
- **IsoGenerator**: Creates bootable or data-only ISO images from LFS builds
  - Supports multiple bootloader options (GRUB/ISOLINUX)
  - Uses Docker when available for reliable ISO creation
  - Falls back to simulation mode when Docker is unavailable
  - Provides detailed logging of the ISO generation process
- **TestRunner**: Executes test cases for LFS builds with specific configurations
  - Manages test execution and reporting
  - Coordinates Docker and ISO generation operations
  - Handles test configurations and validation

### Frontend Components

- **LFSBuilder**: Main component for the LFS build process
- **TestRunner UI**: Interface for running tests and viewing results
- **ISO Generation UI**: Controls for ISO creation and configuration
- **DockerArchitecture**: Visual representation of Docker integration
  - Displays the Docker architecture diagram
  - Shows the process flow for Docker-based operations
  - Details Docker features and integration points
  - Lists Docker requirements and availability status

## Docker Integration

LFS Builder uses Docker to ensure reproducible builds and isolate the build environment:

1. **Docker Image**: A custom Docker image (`lfs-iso-builder`) containing all necessary tools for ISO generation
2. **Build Process**: LFS builds run within Docker containers to ensure consistency
3. **Volume Mounting**: Source files and outputs are shared via Docker volumes
4. **Error Handling**: Comprehensive Docker operation error handling and logging

The DockerService class provides a consistent interface for all Docker operations, handling availability checking, image building, and container execution. When Docker is not available, the application falls back to simulation mode, allowing for development and testing without Docker dependencies.

## ISO Generation

ISO generation supports multiple bootloaders and configurations:

- **GRUB**: The default bootloader for maximum compatibility
- **ISOLINUX**: Alternative bootloader option
- **Non-bootable**: Data-only ISO option

The process leverages industry-standard tools like `xorriso` within Docker containers. The IsoGenerator class coordinates this process, using Docker when available and providing a simulation mode for environments without Docker.

The ISO generation process includes:
1. Setting up the ISO directory structure
2. Copying the LFS build files
3. Installing and configuring the selected bootloader
4. Creating the ISO image using xorriso
5. Verifying the ISO integrity
6. Providing a download link for the generated ISO

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
  - Manages Docker availability checking
  - Handles Docker image building
  - Executes commands within Docker containers
  - Provides comprehensive error handling
- `src/lib/testing/iso-generator.ts`: ISO creation logic
  - Coordinates the ISO generation process
  - Uses Docker when available
  - Provides simulation mode for development
  - Handles verification and download URL generation
- `src/lib/testing/test-runner.ts`: Test execution system
  - Manages test execution and reporting
  - Coordinates Docker and ISO generation operations
  - Handles test configurations and validation
- `src/components/TestRunner.tsx`: Test UI component
  - Provides user interface for test configuration
  - Displays test results and logs
  - Handles ISO generation requests
- `src/lib/testing/test-configurations.ts`: Test configuration definitions
  - Defines predefined test configurations
  - Provides utility functions for creating custom configurations

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
- Check the Docker availability status in the Testing interface
- If Docker is not available, the application will fall back to simulation mode

### ISO Generation Failures

- Check Docker logs for detailed error information
- Verify source directory contains valid LFS build files
- Ensure output directory is writable
- Check the specified bootloader configuration
- Review the logs for specific error messages

### Build Process Errors

- Review log output for specific error messages
- Verify all dependencies are installed
- Check if target disk has sufficient space and permissions
- Verify source files are available and readable

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
