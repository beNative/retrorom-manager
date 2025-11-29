import React, { useRef, useEffect } from 'react';
import { System } from '../types';
import { Gamepad2, AlertTriangle, CheckCircle2, Info, Settings, Copy } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  systems: System[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInfoClick: () => void;
  onSettingsClick: () => void;
  onDuplicatesClick: () => void;
  activeView: 'dashboard' | 'info' | 'settings' | 'duplicates';
}

export const Sidebar: React.FC<SidebarProps> = ({ systems, selectedId, onSelect, onInfoClick, onSettingsClick, onDuplicatesClick, activeView }) => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, systems.length);
  }, [systems]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, id: string) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % systems.length;
      itemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + systems.length) % systems.length;
      itemRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      itemRefs.current[systems.length - 1]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className="w-64 bg-retro-800 border-r border-retro-700 flex flex-col flex-shrink-0 dark:bg-retro-800 dark:border-retro-700 bg-white border-gray-200">
      <div className="p-4 border-b border-retro-700 bg-retro-900/50 dark:border-retro-700 dark:bg-retro-900/50 border-gray-200 bg-gray-50">
        <h2 className="font-bold text-retro-accent flex items-center gap-2 dark:text-retro-accent text-blue-600">
          <Gamepad2 /> Systems
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {systems.map((sys, index) => {
          const hasIssues = sys.stats.romsWithoutEntry > 0 || sys.stats.entriesWithoutRom > 0;

          return (
            <button
              key={sys.id}
              ref={el => itemRefs.current[index] = el}
              onClick={() => onSelect(sys.id)}
              onKeyDown={(e) => handleKeyDown(e, index, sys.id)}
              className={clsx(
                "w-full text-left p-3 border-b border-retro-700/50 hover:bg-retro-700 transition-colors flex justify-between items-center group focus:outline-none focus:bg-retro-700 focus:ring-1 focus:ring-inset focus:ring-retro-accent dark:border-retro-700/50 dark:hover:bg-retro-700 dark:focus:bg-retro-700 border-gray-100 hover:bg-gray-100 focus:bg-gray-100",
                selectedId === sys.id && activeView === 'dashboard'
                  ? "bg-retro-700 border-l-4 border-l-retro-accent dark:bg-retro-700 dark:border-l-retro-accent bg-blue-50 border-l-blue-600"
                  : "border-l-4 border-l-transparent"
              )}
            >
              <div>
                <div className="font-semibold text-sm group-hover:text-white text-gray-300 dark:group-hover:text-white dark:text-gray-300 text-gray-700 group-hover:text-gray-900">
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
        })}
      </div>

      <div className="p-2 border-t border-retro-700 bg-retro-900/30 flex flex-col gap-1 dark:border-retro-700 dark:bg-retro-900/30 border-gray-200 bg-gray-50">
        <button
          onClick={onInfoClick}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded hover:bg-retro-700 transition-colors text-sm font-medium dark:hover:bg-retro-700 hover:bg-gray-200",
            activeView === 'info'
              ? "text-white bg-retro-700 dark:text-white dark:bg-retro-700 text-blue-600 bg-blue-50"
              : "text-gray-400 dark:text-gray-400 text-gray-600"
          )}
        >
          <Info size={16} />
          Information
        </button>
        <button
          onClick={onDuplicatesClick}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded hover:bg-retro-700 transition-colors text-sm font-medium dark:hover:bg-retro-700 hover:bg-gray-200",
            activeView === 'duplicates'
              ? "text-white bg-retro-700 dark:text-white dark:bg-retro-700 text-blue-600 bg-blue-50"
              : "text-gray-400 dark:text-gray-400 text-gray-600"
          )}
        >
          <Copy size={16} />
          Duplicates
        </button>
        <button
          onClick={onSettingsClick}
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded hover:bg-retro-700 transition-colors text-sm font-medium dark:hover:bg-retro-700 hover:bg-gray-200",
            activeView === 'settings'
              ? "text-white bg-retro-700 dark:text-white dark:bg-retro-700 text-blue-600 bg-blue-50"
              : "text-gray-400 dark:text-gray-400 text-gray-600"
          )}
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
};