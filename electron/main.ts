import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScanService } from './services/scanService';
import { FixService } from './services/fixService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let globalBasePath = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1b26',
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

app.whenReady().then(createWindow);

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
  return result.filePaths[0];
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