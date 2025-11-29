import React from 'react';
import { System, FixActionType } from '../types';
import { RefreshCw, Link, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SystemHeaderProps {
  system: System;
  onFix: (action: FixActionType, dryRun: boolean) => void;
  loading: boolean;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({ system, onFix, loading }) => {
  return (
    <div className="p-6 border-b border-retro-700 bg-retro-800/50 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{system.name}</h1>
        <p className="text-sm text-gray-400 font-mono">{system.path}</p>
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
    className="flex items-center gap-2 px-3 py-2 bg-retro-700 hover:bg-retro-accent hover:text-retro-900 disabled:opacity-50 disabled:hover:bg-retro-700 disabled:hover:text-white transition rounded text-sm font-semibold border border-retro-600"
  >
    <Icon size={16} />
    {label}
  </button>
);