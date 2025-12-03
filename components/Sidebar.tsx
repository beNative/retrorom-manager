import React, { useState, useMemo } from 'react';
import { System } from '../types';
import { Gamepad2, AlertTriangle, CheckCircle2, Info, Settings, Copy, Cpu, Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { Tooltip } from './Tooltip';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface SidebarProps {
  systems: System[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInfoClick: () => void;
  onSettingsClick: () => void;
  onDuplicatesClick: () => void;
  onBiosClick: () => void;
  activeView: 'dashboard' | 'info' | 'settings' | 'duplicates' | 'bios';
}

export const Sidebar: React.FC<SidebarProps> = ({ systems, selectedId, onSelect, onInfoClick, onSettingsClick, onDuplicatesClick, onBiosClick, activeView }) => {
  const [filterText, setFilterText] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);

  const filteredSystems = useMemo(() => {
    return systems.filter(sys => {
      const matchesText = sys.name.toLowerCase().includes(filterText.toLowerCase());
      const matchesEmpty = hideEmpty ? sys.stats.totalRoms > 0 : true;
      return matchesText && matchesEmpty;
    });
  }, [systems, filterText, hideEmpty]);

  const { handleKeyDown, setRef } = useKeyboardNavigation<HTMLButtonElement>(
    filteredSystems.length,
    (index) => onSelect(filteredSystems[index].id),
    { loop: true, selectOnFocus: true }
  );

  return (
    <div className="w-64 flex flex-col flex-shrink-0 border-r transition-colors duration-200 bg-white border-gray-200 dark:bg-retro-800 dark:border-retro-700">
      <div className="p-4 border-b transition-colors duration-200 border-gray-200 bg-gray-50 dark:border-retro-700 dark:bg-retro-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-blue-600 dark:text-retro-accent">
            <Gamepad2 /> Systems
          </h2>
          <Tooltip content={hideEmpty ? "Show All Systems" : "Hide Empty Systems"} position="bottom">
            <button
              onClick={() => setHideEmpty(!hideEmpty)}
              className={clsx(
                "p-1 rounded transition-colors",
                hideEmpty ? "bg-blue-100 text-blue-600 dark:bg-retro-accent/20 dark:text-retro-accent" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              )}
            >
              <Filter size={16} />
            </button>
          </Tooltip>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter systems..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-200 dark:border-retro-600 rounded bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-retro-accent"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredSystems.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-500 italic">
            No systems found
          </div>
        ) : (
          filteredSystems.map((sys, index) => {
            const hasIssues = sys.stats.romsWithoutEntry > 0 || sys.stats.entriesWithoutRom > 0;

            return (
              <button
                key={sys.id}
                ref={setRef(index)}
                onClick={() => onSelect(sys.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={clsx(
                  "w-full text-left p-3 border-b transition-colors flex justify-between items-center group focus:outline-none focus:ring-1 focus:ring-inset",
                  "border-gray-100 hover:bg-gray-100 focus:bg-gray-100 focus:ring-retro-accent",
                  "dark:border-retro-700/50 dark:hover:bg-retro-700 dark:focus:bg-retro-700 dark:focus:ring-retro-accent",
                  selectedId === sys.id && activeView === 'dashboard'
                    ? "bg-blue-50 border-l-4 border-l-blue-600 dark:bg-retro-700 dark:border-l-retro-accent"
                    : "border-l-4 border-l-transparent"
                )}
              >
                <div>
                  <div className="font-semibold text-sm transition-colors text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
                    {sys.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {sys.stats.totalRoms} ROMs
                  </div>
                </div>
                {hasIssues ? (
                  <AlertTriangle size={16} className="text-retro-warning" />
                ) : (
                  <CheckCircle2 size={16} className="text-retro-success opacity-50" />
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="p-2 border-t transition-colors duration-200 flex flex-col gap-1 border-gray-200 bg-gray-50 dark:border-retro-700 dark:bg-retro-900/30">
        <Tooltip content="Documentation" position="right">
          <button
            onClick={onInfoClick}
            className={clsx(
              "w-full flex items-center gap-2 p-2 rounded transition-colors text-sm font-medium",
              "hover:bg-gray-200 dark:hover:bg-retro-700",
              activeView === 'info'
                ? "text-blue-600 bg-blue-50 dark:text-white dark:bg-retro-700"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <Info size={16} />
            Information
          </button>
        </Tooltip>
        <Tooltip content="Find Duplicate ROMs" position="right">
          <button
            onClick={onDuplicatesClick}
            className={clsx(
              "w-full flex items-center gap-2 p-2 rounded transition-colors text-sm font-medium",
              "hover:bg-gray-200 dark:hover:bg-retro-700",
              activeView === 'duplicates'
                ? "text-blue-600 bg-blue-50 dark:text-white dark:bg-retro-700"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <Copy size={16} />
            Duplicates
          </button>
        </Tooltip>
        <Tooltip content="Check for Missing BIOS" position="right">
          <button
            onClick={onBiosClick}
            className={clsx(
              "w-full flex items-center gap-2 p-2 rounded transition-colors text-sm font-medium",
              "hover:bg-gray-200 dark:hover:bg-retro-700",
              activeView === 'bios'
                ? "text-blue-600 bg-blue-50 dark:text-white dark:bg-retro-700"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <Cpu size={16} />
            BIOS
          </button>
        </Tooltip>
        <Tooltip content="Application Settings" position="right">
          <button
            onClick={onSettingsClick}
            className={clsx(
              "w-full flex items-center gap-2 p-2 rounded transition-colors text-sm font-medium",
              "hover:bg-gray-200 dark:hover:bg-retro-700",
              activeView === 'settings'
                ? "text-blue-600 bg-blue-50 dark:text-white dark:bg-retro-700"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <Settings size={16} />
            Settings
          </button>
        </Tooltip>
      </div>
    </div>
  );
};