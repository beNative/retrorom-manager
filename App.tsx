import React, { useState, useEffect } from 'react';
import { System, GameEntry, ScanResult, FixResult } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { GameTable } from './components/GameTable';
import { SystemHeader } from './components/SystemHeader';
import { FolderOpen, Terminal } from 'lucide-react';

// Mock Electron Bridge for type safety if window.electron is missing (dev mode in browser)
const electron = (window as any).electron || {
  selectFolder: async () => null,
  scanRoms: async () => ({ systems: [] }),
  fixIssues: async () => ({ logs: ['Electron not found - dev mode'], success: false })
};

const App: React.FC = () => {
  const [basePath, setBasePath] = useState<string | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const handleSelectFolder = async () => {
    const path = await electron.selectFolder();
    if (path) {
      setBasePath(path);
      performScan(path);
    }
  };

  const performScan = async (path: string) => {
    setLoading(true);
    try {
      const result: ScanResult = await electron.scanRoms(path);
      setSystems(result.systems);
      if (result.systems.length > 0 && !selectedSystemId) {
        setSelectedSystemId(result.systems[0].id);
      }
    } catch (error) {
      console.error("Scan failed", error);
      setLogs(prev => [...prev, `Error: Scan failed - ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async (action: 'SYNC_GAMELIST' | 'LINK_MEDIA' | 'CLEAN_MEDIA', dryRun: boolean) => {
    if (!selectedSystemId) return;
    
    setLoading(true);
    setLogs(prev => [...prev, `Starting ${action} on ${selectedSystemId} (${dryRun ? 'Dry Run' : 'Live'})...`]);
    
    try {
      const result: FixResult = await electron.fixIssues({
        systemId: selectedSystemId,
        action,
        dryRun
      });
      setLogs(prev => [...prev, ...result.logs]);
      
      if (!dryRun && result.success && basePath) {
         // Re-scan to show updated state
         await performScan(basePath);
      }
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, "Critical error during operation."]);
    } finally {
      setLoading(false);
    }
  };

  const selectedSystem = systems.find(s => s.id === selectedSystemId);

  if (!basePath) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-retro-900 text-white">
        <h1 className="text-4xl font-bold mb-6 text-retro-accent">RetroRom Manager</h1>
        <p className="mb-8 text-gray-400 max-w-md text-center">
          A tool to manage your EmulationStation ROMs. 
          Select your root ROMs folder (e.g., /home/pi/RetroPie/roms) to begin.
        </p>
        <button 
          onClick={handleSelectFolder}
          className="flex items-center gap-2 px-6 py-3 bg-retro-700 hover:bg-retro-accent transition rounded-lg text-lg font-semibold"
        >
          <FolderOpen size={24} />
          Select ROMs Folder
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-retro-900 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar 
        systems={systems} 
        selectedId={selectedSystemId} 
        onSelect={setSelectedSystemId} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedSystem ? (
          <>
            <SystemHeader 
              system={selectedSystem} 
              onFix={handleFix}
              loading={loading}
            />
            
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                
                {/* Dashboard / Stats */}
                <div className="lg:col-span-3">
                   <Dashboard stats={selectedSystem.stats} />
                </div>

                {/* Game List */}
                <div className="lg:col-span-2 bg-retro-800 rounded-lg border border-retro-700 overflow-hidden flex flex-col h-[500px] lg:h-auto">
                   <GameTable games={selectedSystem.games} />
                </div>

                {/* Logs / Console */}
                <div className="lg:col-span-1 bg-black/30 rounded-lg border border-retro-700 flex flex-col overflow-hidden h-64 lg:h-auto">
                   <div className="p-2 bg-retro-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Terminal size={14} /> Operation Logs
                   </div>
                   <div className="flex-1 overflow-auto p-2 font-mono text-xs text-green-400 space-y-1">
                      {logs.length === 0 && <span className="text-gray-600">Ready...</span>}
                      {logs.map((log, i) => (
                        <div key={i} className="break-all border-b border-gray-800/50 pb-1 mb-1 last:border-0">
                          {log}
                        </div>
                      ))}
                      <div id="log-end" />
                   </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a system from the sidebar
          </div>
        )}
      </div>
    </div>
  );
};

export default App;