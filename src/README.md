
# LFS Builder

LFS Builder is a visual automation tool for streamlining the Linux From Scratch (LFS) build process. This React application provides an intuitive graphical user interface for managing complex command-line operations, tracking build progress, and organizing the many steps involved in creating a Linux system from source.

## Features

- **Phased Build Process**: Organizes the LFS build into clear, logical phases
- **Visual Command Execution**: Converts complex shell commands into simple button clicks
- **Context-Aware Interface**: Shows the current user context (root, lfs, chroot)
- **Progress Tracking**: Monitors build progress with visual indicators
- **Log Viewing**: Real-time display of command output and build logs
- **Configuration Management**: Save and load build configurations
- **Build History**: Track past builds and their outcomes
- **Supabase Integration**: Backend persistence for configurations, build status, and logs

## Technical Overview

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Supabase for data storage and user authentication
- **State Management**: React Query and React Context
- **UI Components**: Custom components and shadcn/ui

## Architecture

The application follows a modular architecture:

- **Components**: UI elements for displaying and interacting with the build process
- **Lib**: Core logic for LFS automation
- **Supabase Integration**: Database operations for persisting build data
- **Hooks**: Custom React hooks for shared functionality

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure your Supabase credentials
4. Start the development server with `npm run dev`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
