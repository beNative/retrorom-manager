import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { ScanService } from './services/scanService';
import { FixService } from './services/fixService';
import { SettingsService } from './services/settingsService';
import { DuplicateService } from './services/duplicateService';
import { BiosService } from './services/biosService';
import { ScraperService } from './services/scraperService';

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
    //       dist-electron/electron/main.js
    //       dist/index.html
    // We are in dist-electron/electron, so we need to go up two levels to get to dist
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
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

  if (action === 'SCRAPE_MISSING') {
    const scanner = new ScanService(globalBasePath);
    const scanResult = await scanner.scanAll();
    const system = scanResult.systems.find(s => s.id === systemId);

    if (!system) {
      return { logs: [`System ${systemId} not found.`], success: false };
    }

    const scraper = new ScraperService(settingsService);
    const result = await scraper.scrapeMissing(system.path, system.games);

    if (result.updated > 0) {
      // Auto-link the new media
      const fixService = new FixService(globalBasePath);
      await fixService.performAction(systemId, 'LINK_MEDIA', false); // Live run to update XML
      result.logs.push("Automatically linked new media to gamelist.xml");
    }

    return { logs: result.logs, success: result.updated > 0 };
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
  // In both dev and prod (asar), the structure relative to main.js (in dist-electron/electron)
  // places docs at ../../docs
  // Dev: root/dist-electron/electron/main.js -> root/docs
  // Prod: app.asar/dist-electron/electron/main.js -> app.asar/docs

  const docPath = path.join(__dirname, '../../docs', filename);

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

ipcMain.handle('find-duplicates', async (_, systems) => {
  const duplicateService = new DuplicateService();
  return duplicateService.findDuplicates(systems);
});

ipcMain.handle('delete-files', async (_, filePaths: string[]) => {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        deleted.push(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete ${filePath}:`, error);
      failed.push(filePath);
    }
  }

  return { deleted, failed };
});

ipcMain.handle('check-bios', async (_, basePath: string) => {
  const biosService = new BiosService();
  return biosService.checkBios(basePath);
});

ipcMain.handle('test-scraper-connection', async () => {
  const scraper = new ScraperService(settingsService);
  return await scraper.testConnection();
});

ipcMain.handle('open-external', async (_, url: string) => {
  await import('electron').then(({ shell }) => shell.openExternal(url));
});