import React from 'react';
import { GameEntry } from '../types';
import { Image, Film, AlertCircle, Book } from 'lucide-react';
import { clsx } from 'clsx';
import { Tooltip } from './Tooltip';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface GameTableProps {
  games: GameEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onViewMedia: (url: string, type: 'image' | 'video' | 'manual', title: string) => void;
}

export const GameTable: React.FC<GameTableProps> = ({ games, selectedId, onSelect, onViewMedia }) => {
  const { handleKeyDown, setRef } = useKeyboardNavigation<HTMLTableRowElement>(
    games.length,
    (index) => onSelect(games[index].id),
    { loop: false, pageStep: 10, selectOnFocus: true }
  );

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
              ref={setRef(index)}
              tabIndex={0}
              onClick={() => onSelect(game.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
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
                <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Tooltip content={game.image ? `Path: ${game.image}` : "No Image"}>
                    <button
                      onClick={() => game.imagePath && onViewMedia(game.imagePath, 'image', `Image: ${game.name}`)}
                      disabled={!game.imageExists}
                      className={clsx("p-1 rounded hover:bg-gray-200 dark:hover:bg-retro-600 transition-colors", !game.imageExists && "cursor-default opacity-50")}
                    >
                      <Image
                        size={16}
                        className={clsx(game.imageExists ? "text-retro-success" : "text-gray-300 dark:text-retro-700")}
                      />
                    </button>
                  </Tooltip>
                  <Tooltip content={game.video ? `Path: ${game.video}` : "No Video"}>
                    <button
                      onClick={() => game.videoPath && onViewMedia(game.videoPath, 'video', `Video: ${game.name}`)}
                      disabled={!game.videoExists}
                      className={clsx("p-1 rounded hover:bg-gray-200 dark:hover:bg-retro-600 transition-colors", !game.videoExists && "cursor-default opacity-50")}
                    >
                      <Film
                        size={16}
                        className={clsx(game.videoExists ? "text-retro-success" : "text-gray-300 dark:text-retro-700")}
                      />
                    </button>
                  </Tooltip>
                  <Tooltip content={game.marquee ? `Marquee: ${game.marquee}` : "No Marquee"}>
                    <button
                      onClick={() => game.marqueePath && onViewMedia(game.marqueePath, 'image', `Marquee: ${game.name}`)}
                      disabled={!game.marqueeExists}
                      className={clsx("p-1 rounded hover:bg-gray-200 dark:hover:bg-retro-600 transition-colors", !game.marqueeExists && "cursor-default opacity-50")}
                    >
                      <Image
                        size={16}
                        className={clsx(game.marqueeExists ? "text-retro-success" : "text-gray-300 dark:text-retro-700")}
                      />
                    </button>
                  </Tooltip>
                  <Tooltip content={game.manual ? `Manual: ${game.manual}` : "No Manual"}>
                    <button
                      onClick={() => game.manualPath && onViewMedia(game.manualPath, 'manual', `Manual: ${game.name}`)}
                      disabled={!game.manualExists}
                      className={clsx("p-1 rounded hover:bg-gray-200 dark:hover:bg-retro-600 transition-colors", !game.manualExists && "cursor-default opacity-50")}
                    >
                      <Book
                        size={16}
                        className={clsx(game.manualExists ? "text-retro-success" : "text-gray-300 dark:text-retro-700")}
                      />
                    </button>
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