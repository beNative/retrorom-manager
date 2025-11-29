import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { ScanService } from './services/scanService';
import { FixService } from './services/fixService';
import { SettingsService } from './services/settingsService';

let mainWindow: BrowserWindow | null = null;
let globalBasePath = '';
let settingsService: SettingsService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1b26',
    frame: false, // Frameless window
    titleBarStyle: 'hidden', // Hide default title bar but keep traffic lights on macOS (optional, but good for cross-platform)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In production, load the built html
  // In dev, load localhost
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // When built, the file structure is:
    // root/
    //   resources/
    //     app/
    //       dist-electron/main.js
    //       dist/index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  settingsService = new SettingsService();
  const lastPath = settingsService.get('lastOpenedPath');
  if (lastPath) {
    globalBasePath = lastPath;
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if ((process as any).platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- IPC Handlers ---

ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;

  const selectedPath = result.filePaths[0];
  settingsService.set('lastOpenedPath', selectedPath);
  return selectedPath;
});

ipcMain.handle('scan-roms', async (_, basePath: string) => {
  globalBasePath = basePath;
  const scanner = new ScanService(basePath);
  return await scanner.scanAll();
});

ipcMain.handle('fix-issues', async (_, args) => {
  const { systemId, action, dryRun } = args;

  if (!globalBasePath) {
    return { logs: ['Error: No base path set.'], success: false };
  }

  const fixService = new FixService(globalBasePath);
  return await fixService.performAction(systemId, action, dryRun);
});

ipcMain.handle('set-base-path', (_, path) => {
  globalBasePath = path;
});

ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('get-settings', () => {
  return settingsService.getAll();
});

ipcMain.handle('get-doc-content', async (_, filename: string) => {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  // In dev, docs are in ../docs relative to electron/main.ts
  // In prod, docs are in resources/app/docs, and main.js is in resources/app/dist-electron
  // So relative path might need adjustment or use process.resourcesPath

  let docPath = '';
  if (isDev) {
    // In dev, main.js is in dist-electron/main.js
    // Docs are in docs/
    // So we need to go up one level from dist-electron to root, then into docs
    docPath = path.join(__dirname, '../docs', filename);
  } else {
    // In prod, resources/app/dist-electron/main.js (usually)
    // Docs are in resources/app/docs
    docPath = path.join(process.resourcesPath, 'app', 'docs', filename);
  }

  console.log(`[get-doc-content] Request: ${filename}, Resolved: ${docPath}`); // Debug log

  try {
    if (fs.existsSync(docPath)) {
      return fs.readFileSync(docPath, 'utf-8');
    }
    return '# Document not found';
  } catch (error) {
    console.error('Error reading doc:', error);
    return '# Error loading document';
  }
});

ipcMain.handle('save-setting', (_, args) => {
  const { key, value } = args;
  settingsService.set(key, value);
});