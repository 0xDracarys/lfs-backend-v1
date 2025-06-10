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

Real ISO image generation is handled via a GitHub Actions workflow for on-demand processing.

From the application's ISO Management interface (typically found under "ISO Management" or similar in the navigation):
*   If a live backend service for ISO generation is not configured (via the `VITE_ISO_BACKEND_URL` environment variable), the UI will guide you with instructions to use the GitHub Actions workflow. This involves:
    1.  Navigating to your project's GitHub repository.
    2.  Going to the "Actions" tab.
    3.  Selecting the "Generate LFS ISO" workflow.
    4.  Clicking "Run workflow" and providing the necessary inputs (e.g., Build ID/Name, Source Path for your LFS root filesystem, desired ISO Filename). The UI will provide suggested values for these based on the ISO you're trying to generate.
    5.  Once the workflow completes, the generated ISO can be downloaded from the "Artifacts" section of that specific workflow run.

*   **Local Development Note:** For local development, if `VITE_ISO_BACKEND_URL` is not set, the system may attempt to use local Docker as a fallback if Docker is running on your machine and is accessible. However, the GitHub Actions method is recommended for reproducible off-machine builds, especially for users of a deployed version of this application.

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

## Deployment to Netlify

This project can be deployed to Netlify for easy static hosting.

### Steps:

1.  **Connect Repository:**
    *   Sign up or log in to [Netlify](https://www.netlify.com/).
    *   Click "Add new site" > "Import an existing project".
    *   Connect to your Git provider (e.g., GitHub, GitLab, Bitbucket) and select this repository.

2.  **Build Settings:**
    *   Netlify will attempt to automatically detect your build settings.
    *   Thanks to the `netlify.toml` file included in this repository, the build command (`npm run build`) and publish directory (`dist`) should be pre-configured.
    *   If you need to set them manually or they are not detected, use `npm run build` as the build command and `dist` as the publish directory.

3.  **Environment Variables (Crucial):**
    *   Before deploying, you **must** configure the following environment variables in the Netlify UI. Navigate to your site's settings, then go to "Build & deploy" > "Environment variables":
        *   `VITE_SUPABASE_URL`: Your Supabase project URL.
        *   `VITE_SUPABASE_ANON_KEY`: Your Supabase project public anonymous key.
        *   `VITE_ISO_BACKEND_URL` (Optional): The URL for an optional, user-deployed, live ISO generation backend service.
            *   If you have deployed your own backend capable of ISO generation (e.g., a Node.js server with Docker access), set its public URL here. The application will attempt to use this service for live ISO generation requests from its UI.
            *   If this variable is not set or is empty, the application's UI will guide users to the GitHub Actions workflow for on-demand ISO generation. Features requiring this live backend will be disabled or will point to the GitHub Actions alternative.
    *   These variables are essential for the application to connect to your Supabase backend for features like user authentication and data persistence. The ISO backend URL is for specialized ISO generation features.

4.  **Deploy:**
    *   Click "Deploy site" (or "Trigger deploy" if re-deploying). Netlify will then build and deploy your application.

### Important Considerations:

*   **Supabase Row Level Security (RLS):**
    *   It is **critical** to have appropriate Row Level Security (RLS) policies enabled and configured for all your tables in Supabase. This ensures that users can only access or modify data they are permitted to. The `VITE_SUPABASE_ANON_KEY` is a public key, so RLS is your primary means of data protection.

*   **ISO Generation on Netlify:** The deployed frontend site itself cannot run Docker.
            *   "Real" ISO generation for users of the deployed site is primarily handled via the on-demand GitHub Actions workflow described in the 'Usage' section.
            *   Alternatively, if you provide a live backend URL via the `VITE_ISO_BACKEND_URL` environment variable, the site will attempt to use that service for ISO generation requests initiated from the UI.
            *   Without either of these, ISO generation features in the UI will be limited to simulations or will guide you to the GitHub Actions workflow.
```
