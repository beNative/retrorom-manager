import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';

const TitleBar: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Optional: Listen for window state changes if we wanted to update the icon dynamically
        // based on external changes (like snapping). For now, we'll toggle local state on click.
    }, []);

    const handleMinimize = () => {
        window.electron.minimize();
    };

    const handleMaximize = () => {
        window.electron.maximize();
        setIsMaximized(!isMaximized);
    };

    const handleClose = () => {
        window.electron.close();
    };

    return (
        <div className="h-8 bg-[#1a1b26] flex items-center justify-between select-none z-50 border-b border-gray-800">
            {/* Drag Region */}
            <div className="flex-1 h-full flex items-center pl-4 app-drag-region">
                <span className="text-xs text-gray-400 font-medium">RetroRom Manager</span>
            </div>

            {/* Window Controls - No Drag */}
            <div className="flex h-full app-no-drag">
                <button
                    onClick={handleMinimize}
                    className="h-full w-12 flex items-center justify-center hover:bg-gray-700 transition-colors focus:outline-none"
                    title="Minimize"
                >
                    <Minus size={16} className="text-gray-400" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="h-full w-12 flex items-center justify-center hover:bg-gray-700 transition-colors focus:outline-none"
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <Copy size={14} className="text-gray-400 transform rotate-180" /> // Rough approximation of restore icon
                    ) : (
                        <Square size={14} className="text-gray-400" />
                    )}
                </button>
                <button
                    onClick={handleClose}
                    className="h-full w-12 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors focus:outline-none group"
                    title="Close"
                >
                    <X size={16} className="text-gray-400 group-hover:text-white" />
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
