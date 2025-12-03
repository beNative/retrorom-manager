import React, { useState, useEffect } from 'react';
import { System, ScanResult, FixResult } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { GameTable } from './components/GameTable';
import { SystemHeader } from './components/SystemHeader';
import TitleBar from './components/TitleBar';
import StatusBar from './components/StatusBar';
import { InfoTab } from './components/InfoTab';
import { SettingsTab } from './components/SettingsTab';
import { DuplicateFinder } from './components/DuplicateFinder';
import { BiosChecker } from './components/BiosChecker';
import { FolderOpen, Terminal } from 'lucide-react';

// Mock Electron Bridge for type safety if window.electron is missing (dev mode in browser)
const electron = (window as any).electron || {
  selectFolder: async () => null,
  scanRoms: async () => ({ systems: [] }),
  fixIssues: async () => ({ logs: ['Electron not found - dev mode'], success: false }),
  getSettings: async () => ({}),
  getDocContent: async () => '# No Electron',
  saveSetting: async () => { },
  findDuplicates: async () => ({}),
  deleteFiles: async () => ({ deleted: [], failed: [] }),
  checkBios: async () => []
};

const App: React.FC = () => {
  const [basePath, setBasePath] = useState<string | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'info' | 'settings' | 'duplicates' | 'bios'>('dashboard');
  const [dryRunMode, setDryRunMode] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await electron.getSettings();
      if (settings?.lastOpenedPath) {
        setBasePath(settings.lastOpenedPath);
        performScan(settings.lastOpenedPath);
      }
      if (settings?.dryRunMode !== undefined) {
        setDryRunMode(settings.dryRunMode);
      }
    };
    loadSettings();
  }, []);

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
    setLogs(prev => [...prev, `Starting ${action} on ${selectedSystemId} (${dryRunMode ? 'Dry Run' : 'Live'})...`]);

    try {
      const result: FixResult = await electron.fixIssues({
        systemId: selectedSystemId,
        action,
        dryRun: dryRunMode
      });
      setLogs(prev => [...prev, ...result.logs]);

      if (!dryRunMode && result.success && basePath) {
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

  const handleSystemSelect = (id: string) => {
    setSelectedSystemId(id);
    setActiveView('dashboard');
  };

  if (!basePath) {
    return (
      <div className="h-screen w-screen flex flex-col bg-retro-900 text-white overflow-hidden">
        <TitleBar />
        <div className="flex-1 flex flex-col items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-retro-900 text-gray-100 overflow-hidden font-sans transition-colors duration-200 dark:bg-retro-900 dark:text-gray-100 bg-gray-50 text-gray-900">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          systems={systems}
          selectedId={selectedSystemId}
          onSelect={handleSystemSelect}
          onInfoClick={() => setActiveView('info')}
          onSettingsClick={() => setActiveView('settings')}
          onDuplicatesClick={() => setActiveView('duplicates')}
          onBiosClick={() => setActiveView('bios')}
          activeView={activeView}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-retro-900 transition-colors duration-200">
          {activeView === 'info' ? (
            <InfoTab />
          ) : activeView === 'settings' ? (
            <SettingsTab
              dryRunMode={dryRunMode}
              setDryRunMode={setDryRunMode}
              currentPath={basePath}
              onSelectFolder={handleSelectFolder}
            />
          ) : activeView === 'duplicates' ? (
            <DuplicateFinder systems={systems} />
          ) : activeView === 'bios' ? (
            <BiosChecker basePath={basePath} />
          ) : selectedSystem ? (
            <>
              <SystemHeader
                system={selectedSystem}
                onFix={(action) => handleFix(action, dryRunMode)} // Pass global dryRunMode
                loading={loading}
              />

              <div className="flex-1 overflow-auto lg:overflow-hidden p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_1fr] gap-4 h-auto lg:h-full">

                  {/* Dashboard / Stats */}
                  <div className="lg:col-span-3">
                    <Dashboard stats={selectedSystem.stats} />
                  </div>

                  {/* Game List - Seamless Layout (Removed Card Styling) */}
                  <div className="lg:col-span-2 flex flex-col h-full min-h-0 border-r border-gray-200 dark:border-retro-700 pr-2 transition-colors duration-200">
                    <GameTable
                      games={selectedSystem.games}
                      selectedId={selectedGameId}
                      onSelect={setSelectedGameId}
                    />
                  </div>

                  {/* Logs / Console - Seamless Layout */}
                  <div className="lg:col-span-1 flex flex-col h-full min-h-0 pl-2 overflow-hidden">
                    <div className="p-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-retro-700 mb-2 flex-shrink-0 transition-colors duration-200">
                      <Terminal size={14} /> Operation Logs
                    </div>
                    <div className="flex-1 overflow-auto font-mono text-xs text-green-600 dark:text-green-400 space-y-1">
                      {logs.length === 0 && <span className="text-gray-500 dark:text-gray-600">Ready...</span>}
                      {logs.map((log, i) => (
                        <div key={i} className="break-all border-b border-gray-200 dark:border-gray-800/50 pb-1 mb-1 last:border-0 transition-colors duration-200">
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
      <StatusBar />
    </div>
  );
};

export default App;