# Technical Manual

## Architecture Overview
RetroRom Manager is built using **Electron**, **React**, and **TypeScript**.

### Core Technologies
- **Electron**: Provides the cross-platform desktop runtime.
- **React**: Used for the user interface (Renderer process).
- **TypeScript**: Ensures type safety across both Main and Renderer processes.
- **Vite**: Used as the build tool for fast development and optimized production builds.
- **Tailwind CSS**: Used for styling.

### Process Model
The application follows Electron's multi-process architecture:

1. **Main Process** (`electron/main.ts`):
   - Manages the application lifecycle and window creation.
   - Handles native OS interactions (file system, dialogs).
   - Exposes functionality to the Renderer via IPC (Inter-Process Communication).
   - **Services**:
     - `ScanService`: Handles scanning of directories and parsing `gamelist.xml`.
     - `FixService`: Implements logic for fixing issues (sync, link, clean).
     - `SettingsService`: Manages persistence of user settings (`settings.json`).

2. **Renderer Process** (`src/**/*`):
   - Runs the React application.
   - Communicates with the Main process via `window.electron` (exposed in `preload.ts`).
   - **Components**:
     - `App`: Main layout and state management.
     - `Sidebar`: System navigation.
     - `GameTable`: Displays game lists.
     - `TitleBar` & `StatusBar`: Custom UI elements.

### Data Storage
- **Settings**: Stored in `settings.json` in the user's application data directory (`%APPDATA%` on Windows).
- **Gamelists**: Reads and modifies standard EmulationStation `gamelist.xml` files in each system directory.

### Build System
- `npm run dev`: Starts Vite dev server and Electron in development mode.
- `npm run build`: Compiles TypeScript and builds the React app using Vite.
- `npm run electron:build`: Packages the application for distribution using `electron-builder`.
