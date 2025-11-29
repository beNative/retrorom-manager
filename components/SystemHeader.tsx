import React from 'react';
import { System, FixActionType } from '../types';
import { RefreshCw, Link, Trash2, ShieldCheck } from 'lucide-react';

interface SystemHeaderProps {
  system: System;
  onFix: (action: FixActionType, dryRun: boolean) => void;
  loading: boolean;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({ system, onFix, loading }) => {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-retro-700 bg-white dark:bg-retro-800/50 flex justify-between items-start transition-colors duration-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{system.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{system.path}</p>
      </div>

      <div className="flex flex-col gap-2 items-end">
        <div className="flex gap-2">
          {/* Actions - Dry Run first usually */}
          <ActionButton
            icon={RefreshCw}
            label="Sync XML"
            onClick={() => onFix('SYNC_GAMELIST', true)}
            disabled={loading}
          />
          <ActionButton
            icon={Link}
            label="Link Media"
            onClick={() => onFix('LINK_MEDIA', true)}
            disabled={loading}
          />
          <ActionButton
            icon={Trash2}
            label="Clean Media"
            onClick={() => onFix('CLEAN_MEDIA', true)}
            disabled={loading}
          />
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <ShieldCheck size={12} />
          Actions default to <span className="text-retro-accent font-bold">Dry-Run</span> mode.
          (Actual write mode not fully exposed in UI for safety demo)
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-retro-700 dark:hover:bg-retro-accent dark:hover:text-retro-900 dark:text-white dark:border-retro-600 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-retro-700 transition rounded text-sm font-semibold"
  >
    <Icon size={16} />
    {label}
  </button>
);