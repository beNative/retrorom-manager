import React from 'react';
import { SystemStats } from '../types';
import { FileQuestion, ImageOff, Link2Off, FileX } from 'lucide-react';

interface DashboardProps {
  stats: SystemStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const Card = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-retro-800 p-4 rounded-lg border border-retro-700 flex items-center gap-4">
      <div className={`p-3 rounded-full bg-retro-900 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs uppercase text-gray-500 font-semibold tracking-wide">{title}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <Card 
        title="Unlinked ROMs" 
        value={stats.romsWithoutEntry} 
        icon={FileQuestion} 
        colorClass="text-retro-warning" 
      />
      <Card 
        title="Missing ROMs" 
        value={stats.entriesWithoutRom} 
        icon={Link2Off} 
        colorClass="text-retro-error" 
      />
      <Card 
        title="Missing Media" 
        value={stats.missingImages + stats.missingVideos} 
        icon={ImageOff} 
        colorClass="text-blue-400" 
      />
      <Card 
        title="Orphan Media" 
        value={stats.orphanedMedia} 
        icon={FileX} 
        colorClass="text-gray-400" 
      />
    </div>
  );
};