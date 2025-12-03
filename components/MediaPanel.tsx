import React, { useState, useEffect } from 'react';
import { GameEntry } from '../types';
import { Image, Film, Book, FileQuestion } from 'lucide-react';
import { clsx } from 'clsx';

interface MediaPanelProps {
    game: GameEntry | null;
}

type TabType = 'image' | 'video' | 'marquee' | 'manual';

export const MediaPanel: React.FC<MediaPanelProps> = ({ game }) => {
    const [activeTab, setActiveTab] = useState<TabType>('image');

    // Reset tab when game changes, or keep it? Keeping it is usually better UX.
    // But if the new game doesn't have that media, maybe switch?
    // For now, let's keep it simple.

    if (!game) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-retro-800/50 rounded-lg border border-gray-200 dark:border-retro-700 p-6">
                <Image size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Select a game to view media</p>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: React.ReactNode; exists: boolean }[] = [
        { id: 'image', label: 'Image', icon: <Image size={16} />, exists: game.imageExists },
        { id: 'video', label: 'Video', icon: <Film size={16} />, exists: game.videoExists },
        { id: 'marquee', label: 'Marquee', icon: <Image size={16} />, exists: game.marqueeExists },
        { id: 'manual', label: 'Manual', icon: <Book size={16} />, exists: game.manualExists },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'image':
                return game.imagePath ? (
                    <img src={game.imagePath} alt={game.name} className="max-w-full max-h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400"><FileQuestion size={32} /><span className="mt-2 text-xs">No Image Available</span></div>
                );
            case 'video':
                return game.videoPath ? (
                    <video key={game.videoPath} src={game.videoPath} controls autoPlay className="max-w-full max-h-full" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400"><FileQuestion size={32} /><span className="mt-2 text-xs">No Video Available</span></div>
                );
            case 'marquee':
                return game.marqueePath ? (
                    <img src={game.marqueePath} alt="Marquee" className="max-w-full max-h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400"><FileQuestion size={32} /><span className="mt-2 text-xs">No Marquee Available</span></div>
                );
            case 'manual':
                return game.manualPath ? (
                    // Simple iframe for PDF or image for manual pages if they are images. 
                    // Assuming PDF or single image for now based on previous context.
                    <iframe src={game.manualPath} className="w-full h-full bg-white" title="Manual" />
                ) : (
                    <div className="flex flex-col items-center text-gray-400"><FileQuestion size={32} /><span className="mt-2 text-xs">No Manual Available</span></div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-retro-800 rounded-lg border border-gray-200 dark:border-retro-700 overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-retro-700 bg-gray-50 dark:bg-retro-900">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-colors outline-none focus:bg-gray-100 dark:focus:bg-retro-700",
                            activeTab === tab.id
                                ? "bg-white dark:bg-retro-800 text-blue-600 dark:text-retro-accent border-b-2 border-blue-600 dark:border-retro-accent"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-retro-700",
                            !tab.exists && "opacity-50"
                        )}
                        title={!tab.exists ? "Media missing" : ""}
                    >
                        {tab.icon}
                        <span className="hidden xl:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex items-center justify-center bg-gray-100 dark:bg-black/20 overflow-hidden relative">
                {renderContent()}
            </div>

            {/* Footer Info */}
            <div className="p-2 bg-gray-50 dark:bg-retro-900 border-t border-gray-200 dark:border-retro-700 text-xs text-center text-gray-500 truncate">
                {activeTab === 'image' && game.imagePath}
                {activeTab === 'video' && game.videoPath}
                {activeTab === 'marquee' && game.marqueePath}
                {activeTab === 'manual' && game.manualPath}
                {!game[`${activeTab}Path` as keyof GameEntry] && "No file path"}
            </div>
        </div>
    );
};
