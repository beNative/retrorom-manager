import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanRoms: (path: string) => ipcRenderer.invoke('scan-roms', path),
  fixIssues: (args: any) => ipcRenderer.invoke('fix-issues', args),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getDocContent: (filename: string) => ipcRenderer.invoke('get-doc-content', filename),
  saveSetting: (key: string, value: any) => ipcRenderer.invoke('save-setting', { key, value }),
});