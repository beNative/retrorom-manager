import React, { useRef, useEffect } from 'react';
import { GameEntry } from '../types';
import { Image, Film, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Tooltip } from './Tooltip';

interface GameTableProps {
  games: GameEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const GameTable: React.FC<GameTableProps> = ({ games, selectedId, onSelect }) => {
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, games.length);
  }, [games]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, id: string) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, games.length - 1);
      rowRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      rowRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      rowRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      rowRefs.current[games.length - 1]?.focus();
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      const nextIndex = Math.min(index + 10, games.length - 1);
      rowRefs.current[nextIndex]?.focus();
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      const prevIndex = Math.max(index - 10, 0);
      rowRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-retro-900 sticky top-0 z-10 text-xs uppercase text-gray-500 transition-colors duration-200">
          <tr>
            <th className="p-3 border-b border-gray-200 dark:border-retro-700">Name / ROM</th>
            <th className="p-3 border-b border-gray-200 dark:border-retro-700 text-center">Media</th>
            <th className="p-3 border-b border-gray-200 dark:border-retro-700 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr
              key={game.id}
              ref={el => rowRefs.current[index] = el}
              tabIndex={0}
              onClick={() => onSelect(game.id)}
              onKeyDown={(e) => handleKeyDown(e, index, game.id)}
              className={clsx(
                "border-b border-gray-200 dark:border-retro-700/50 last:border-0 group cursor-pointer outline-none transition-colors",
                selectedId === game.id
                  ? "bg-blue-50 text-blue-900 dark:bg-retro-700 dark:text-white"
                  : "hover:bg-gray-100 dark:hover:bg-retro-700/30 text-gray-700 dark:text-gray-300",
                "focus:bg-gray-100 dark:focus:bg-retro-700 focus:ring-1 focus:ring-inset focus:ring-retro-accent"
              )}
            >
              <td className="p-3">
                <div className="font-medium">
                  {game.name || game.id}
                </div>
                <div className={clsx("text-xs font-mono", selectedId === game.id ? "text-blue-700 dark:text-gray-300" : "text-gray-500")}>
                  {game.path}
                </div>
              </td>
              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <Tooltip content={game.image ? `Path: ${game.image}` : "No Image"}>
                    <Image
                      size={16}
                      className={clsx(game.imageExists ? "text-retro-success" : "text-gray-300 dark:text-retro-700")}
                    />
                  </Tooltip>
                  <Tooltip content={game.video ? `Path: ${game.video}` : "No Video"}>
                    <Film
                      size={16}
                      className={clsx(game.videoExists ? "text-retro-success" : "text-gray-300 dark:text-retro-700")}
                    />
                  </Tooltip>
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
                  <span className={clsx("text-xs", selectedId === game.id ? "text-blue-700 dark:text-gray-300" : "text-gray-500")}>OK</span>
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