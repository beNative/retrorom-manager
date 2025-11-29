import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanRoms: (path: string) => ipcRenderer.invoke('scan-roms', path),
  fixIssues: (args: any) => ipcRenderer.invoke('fix-issues', args),
});