import React from 'react';
import { System } from '../types';
import { Gamepad2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  systems: System[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ systems, selectedId, onSelect }) => {
  return (
    <div className="w-64 bg-retro-800 border-r border-retro-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-retro-700 bg-retro-900/50">
        <h2 className="font-bold text-retro-accent flex items-center gap-2">
          <Gamepad2 /> Systems
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {systems.map((sys) => {
          const hasIssues = sys.stats.romsWithoutEntry > 0 || sys.stats.entriesWithoutRom > 0;
          
          return (
            <button
              key={sys.id}
              onClick={() => onSelect(sys.id)}
              className={clsx(
                "w-full text-left p-3 border-b border-retro-700/50 hover:bg-retro-700 transition-colors flex justify-between items-center group",
                selectedId === sys.id ? "bg-retro-700 border-l-4 border-l-retro-accent" : "border-l-4 border-l-transparent"
              )}
            >
              <div>
                <div className="font-semibold text-sm group-hover:text-white text-gray-300">
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
    </div>
  );
};