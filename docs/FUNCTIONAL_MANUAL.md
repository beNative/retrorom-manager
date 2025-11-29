# Functional Manual

## Getting Started

### 1. Select ROMs Folder
Upon launching the application, you will be prompted to select your root ROMs folder. This is typically the directory containing subfolders for each system (e.g., `nes`, `snes`, `psx`).

### 2. The Dashboard
Once a folder is selected, the main dashboard appears.
- **Sidebar**: Lists all detected systems. Icons indicate if a system has issues (Warning icon) or is healthy (Check icon).
- **Main Area**: Displays statistics and the game list for the selected system.
- **Status Bar**: Shows application status and notifications at the bottom.

## Features

### Scanning
The application automatically scans the selected folder on startup. You can re-scan at any time by restarting the app or re-selecting the folder.

### Fixing Issues
For each system, you can perform the following actions:

#### Sync Gamelist
This action scans the `gamelist.xml` file and adds entries for any ROM files that are present in the directory but missing from the XML.

#### Link Media
This action looks for image and video files that match the ROM filenames and updates the `gamelist.xml` to link them.

#### Clean Media
This action identifies media files (images/videos) that do not have a corresponding ROM file and deletes them to save space.

**Note**: You can run these actions in "Dry Run" mode first to see what changes will be made without actually modifying any files.

## Keyboard Navigation
- **Sidebar**: Use `Arrow Up`/`Arrow Down` to navigate systems. Press `Enter` to select.
- **Game List**: Use `Arrow Up`/`Arrow Down` to navigate games. `Page Up`/`Page Down` to scroll faster. `Home`/`End` to jump to the start/end.
