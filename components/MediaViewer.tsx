import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    type: 'image' | 'video' | 'manual' | 'unknown';
    title: string;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ isOpen, onClose, url, type, title }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="relative max-w-5xl max-h-[90vh] bg-white dark:bg-retro-800 rounded-lg shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-retro-700 bg-gray-50 dark:bg-retro-900">
                    <h3 className="font-semibold text-lg truncate pr-4">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-retro-700 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-black/50 min-h-[300px] min-w-[500px]">
                    {type === 'video' ? (
                        <video src={url} controls autoPlay className="max-w-full max-h-[70vh] rounded shadow-lg" />
                    ) : type === 'manual' ? (
                        // For manuals, if it's a PDF we might need an embed, but for now assuming image-based or external
                        // If it is a PDF, 'embed' or 'iframe' works best.
                        <iframe src={url} className="w-full h-[70vh] rounded shadow-lg bg-white" title="Manual Viewer" />
                    ) : (
                        <img src={url} alt={title} className="max-w-full max-h-[70vh] object-contain rounded shadow-lg" />
                    )}
                </div>
            </div>
        </div>
    );
};
