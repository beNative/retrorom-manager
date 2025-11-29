import React from 'react';
import { GameEntry } from '../types';
import { Image, Film, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface GameTableProps {
  games: GameEntry[];
}

export const GameTable: React.FC<GameTableProps> = ({ games }) => {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-retro-900 sticky top-0 z-10 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-3 border-b border-retro-700">Name / ROM</th>
            <th className="p-3 border-b border-retro-700 text-center">Media</th>
            <th className="p-3 border-b border-retro-700 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id} className="hover:bg-retro-700/30 border-b border-retro-700/50 last:border-0 group">
              <td className="p-3">
                <div className="font-medium text-gray-200">
                  {game.name || game.id}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {game.path}
                </div>
              </td>
              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <Image 
                    size={16} 
                    className={clsx(game.imageExists ? "text-retro-success" : "text-retro-700")} 
                    title={game.image ? `Path: ${game.image}` : "No Image"}
                  />
                  <Film 
                    size={16} 
                    className={clsx(game.videoExists ? "text-retro-success" : "text-retro-700")}
                    title={game.video ? `Path: ${game.video}` : "No Video"}
                  />
                </div>
              </td>
              <td className="p-3 text-center">
                 {!game.romExists && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-retro-error/20 text-retro-error text-xs font-bold">
                        <AlertCircle size={12} /> Missing File
                    </span>
                 )}
                 {game.romExists && !game.inGamelist && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-retro-warning/20 text-retro-warning text-xs font-bold">
                        <AlertCircle size={12} /> New ROM
                    </span>
                 )}
                 {game.romExists && game.inGamelist && (
                    <span className="text-xs text-gray-500">OK</span>
                 )}
              </td>
            </tr>
          ))}
          {games.length === 0 && (
             <tr>
                 <td colSpan={3} className="p-8 text-center text-gray-500">
                     No games found in this system directory.
                 </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};