# LFS Builder

LFS Builder is an advanced automation tool designed to streamline the Linux From Scratch (LFS) build process. This application provides a robust graphical user interface for managing the complex steps involved in creating a custom Linux system from source. It features Docker integration for reproducible builds, ISO generation, a comprehensive testing framework, and Supabase integration for data persistence and user authentication.

## Features

- **Phased LFS Build Process**: Organizes the LFS build (currently targeting LFS version 11.2) into clear, logical phases.
- **Visual Command Execution**: Converts complex shell commands into simple button clicks, guiding the user through each step.
- **Context-Aware Interface**: Displays the current user context (root, lfs, chroot) during the build.
- **Progress Tracking & Log Viewing**: Monitors build progress with visual indicators and provides real-time display of command output and build logs.
- **Docker-Powered Builds**: Ensures consistent and reproducible LFS builds across different environments using Docker containers.
- **ISO Generation**: Creates bootable ISO images from successful LFS builds, with options for different bootloaders (GRUB/ISOLINUX).
- **Test Framework**: Validates LFS build configurations and ISO generation processes.
- **Supabase Integration**:
    - **User Authentication**: Secure user registration, login, and logout functionality.
    - **Data Persistence**: Saves build configurations, build status, logs, and potentially other user-specific data (future enhancement).
- **Configuration Management**: (Future Enhancement) Ability to save, load, and manage different build configurations.
- **Build History**: (Future Enhancement) Track past builds and their outcomes.

## Architecture

The application follows a modular architecture:

- **Frontend**: React with TypeScript, Vite, and Tailwind CSS. UI components are a mix of custom elements and shadcn/ui.
- **State Management**: Primarily uses React hooks (`useState`, `useEffect`, `useContext`). React Query is integrated but its usage can be expanded.
- **Backend Services**:
    - **Supabase**: Handles user authentication and data persistence.
    - **Docker**: Used locally for ensuring reproducible builds and for the ISO generation process.

### Key Backend Components (Conceptual & Docker-related)

- **DockerService**: Manages Docker operations for ISO generation and potentially future LFS building within containers.
  - Handles Docker availability checking, image building, and command execution within containers.
- **IsoGenerator**: Creates bootable or data-only ISO images from LFS builds, leveraging Docker when available.
- **TestRunner**: Executes test cases for LFS builds with specific configurations, coordinating Docker and ISO generation.

## Getting Started

### Prerequisites

- **Node.js & npm**: Recommended to install using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).
- **Docker**: Required for full functionality like ISO generation and reproducible builds. [Docker Installation Instructions](https://docs.docker.com/get-docker/).
- **Git**: For cloning the repository.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL> # Replace <YOUR_GIT_URL> with the actual repository URL
    cd <YOUR_PROJECT_NAME>   # Replace <YOUR_PROJECT_NAME> with the cloned directory name
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Supabase Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add your Supabase project URL and Anon Key to the `.env` file:
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```
    *   You can find these values in your Supabase project dashboard under "Project Settings" > "API".

4.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5173`.

### Docker Setup (for ISO Generation & Reproducible Builds)

Ensure Docker is installed and the Docker daemon is running on your system. The application, particularly the ISO generation and testing features, will attempt to:
1.  Check for Docker availability.
2.  Build required Docker images if not present (e.g., `lfs-iso-builder`).
3.  Utilize Docker for operations when enabled and available.

If Docker is not available, some features like ISO generation might fall back to a simulation mode or be disabled.

## Usage

### User Authentication

1.  **Register**: Navigate to the `/register` page. Enter your email and a password to create a new account.
2.  **Login**: Navigate to the `/login` page. Enter your credentials to access your account.
3.  **Logout**: If logged in, a "Logout" button will be available in the header. Clicking this will end your session.

Authenticated users will have their build progress and configurations (in future implementations) associated with their account.

### Running LFS Builds

1.  Log in to the application.
2.  Navigate to the main LFS Builder page (usually the root `/`).
3.  The interface will guide you through the LFS build process, phase by phase.
4.  Click on steps to initiate commands. Provide input when prompted.
5.  Monitor progress and logs in the respective UI sections.

### Generating ISO Images

1.  Navigate to the "Testing" or "ISO Management" page (actual page name may vary).
2.  Ensure Docker is running and accessible if you want to perform a real build and ISO generation.
3.  Select or create a test configuration that includes ISO generation.
4.  Run the process. The system will build LFS (if part of the configuration) and then generate an ISO.
5.  Download the generated ISO image when the process is complete.

### Test Configurations

The testing framework allows for defining and running various LFS build scenarios. Predefined test configurations might be available, or you may be able to create custom ones specifying:
- Target disk.
- Source paths for packages and scripts.
- ISO generation options (bootable, bootloader type, ISO name).
- Expected outcomes for automated validation.

## Development

### Key Files & Directories

-   `src/`: Contains all the application source code.
    -   `components/`: React components, organized by feature (e.g., `auth/`, `iso-management/`, `lfs-builder/`).
        -   `LFSBuilder.tsx`: Main component for the LFS build process.
        -   `Header.tsx`: Application header, including navigation and auth controls.
        -   `auth/ProtectedRoute.tsx`: Handles route protection for authenticated users.
    -   `pages/`: Top-level page components corresponding to routes (e.g., `LoginPage.tsx`, `IsoManagement.tsx`).
    -   `lib/`: Core logic, utilities, and type definitions.
        -   `lfs-automation.ts`: Core definitions and logic for LFS build steps.
        -   `testing/`: Contains logic for Docker integration (`docker-service.ts`), ISO creation (`iso-generator.ts`), and the test execution system (`test-runner.ts`).
        -   `testing/test-configurations.ts`: Example test configuration definitions.
    -   `integrations/supabase/`: Supabase client setup (`client.ts`) and type definitions (`types.ts`).
    -   `hooks/`: Custom React hooks (e.g., `useLFSBuilder.ts`).
    -   `App.tsx`: Main application component, handles routing and global state like session management.
    -   `main.tsx`: Entry point of the React application.
-   `public/`: Static assets.
-   `.env`: Local environment variables (Supabase keys, etc.). Not committed to Git.
-   `README.md`: This file.

### Adding New Test Configurations (Example)

To add a new test configuration (if extending the existing test framework):
Modify `src/lib/testing/test-configurations.ts`:

```typescript
export const TEST_CONFIGURATIONS: LFSTestConfiguration[] = [
  // ... existing configurations
  {
    name: "My Custom LFS Test",
    description: "A test for a specific LFS setup with custom scripts.",
    target_disk: "/dev/sdb", // Example, ensure this is safe for your environment
    sources_path: "/mnt/lfs/sources",
    scripts_path: "/path/to/my/custom/scripts",
    expected_outcomes: {
      should_complete: true,
      expected_error: null
    },
    iso_generation: {
      generate: true,
      iso_name: "my-custom-lfs.iso",
      bootable: true,
      bootloader: "grub" // or "isolinux"
    }
  },
];
```

## Troubleshooting

### Common Issues

-   **Supabase Connection Problems**:
    *   Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file are correct.
    *   Ensure your Supabase project is active and accessible.
    *   Check browser console for any specific error messages from the Supabase client.
-   **Docker Issues**:
    *   Ensure the Docker daemon is running.
    *   Check Docker permissions (your user may need to be in the `docker` group on Linux).
    *   Verify Docker API access with `docker ps` or `docker info` in your terminal.
    *   The application might have a Docker status indicator; check its output.
    *   If Docker is not available, features relying on it will be limited or use simulation mode.
-   **ISO Generation Failures**:
    *   Check Docker logs for detailed error information if Docker is used.
    *   Verify that the source directory for ISO creation contains a valid LFS build.
    *   Ensure the output directory for the ISO is writable.
-   **Build Process Errors**:
    *   Carefully review the application's log output for specific error messages.
    *   Ensure all prerequisites (Node, Docker if used) are correctly installed.
    *   Verify that the target disk/partition (if applicable) has sufficient space and correct permissions.
    *   Ensure source files (LFS packages, patches) are available and readable at the expected paths.

## Contributing

Contributions are welcome! Please follow these general steps:
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Ensure your code lints and any tests pass (if applicable).
5.  Submit a Pull Request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
