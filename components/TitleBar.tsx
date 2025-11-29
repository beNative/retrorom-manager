import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Copy, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TitleBar: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Optional: Listen for window state changes if we wanted to update the icon dynamically
        // based on external changes (like snapping). For now, we'll toggle local state on click.
    }, []);

    const handleMinimize = () => {
        if (window.electron) window.electron.minimize();
    };

    const handleMaximize = () => {
        if (window.electron) {
            window.electron.maximize();
            setIsMaximized(!isMaximized);
        }
    };

    const handleClose = () => {
        if (window.electron) window.electron.close();
    };

    return (
        <div className="h-8 bg-[#1a1b26] flex items-center justify-between select-none z-50 border-b border-gray-800 dark:bg-[#1a1b26] dark:border-gray-800 bg-gray-100 border-gray-300">
            {/* Drag Region */}
            <div className="flex-1 h-full flex items-center pl-4 app-drag-region">
                <span className="text-xs text-gray-400 font-medium dark:text-gray-400 text-gray-600">RetroRom Manager</span>
            </div>

            {/* Window Controls - No Drag */}
            <div className="flex items-center h-full app-no-drag">
                <button
                    onClick={toggleTheme}
                    className="h-full px-4 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-white/10"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button
                    onClick={handleMinimize}
                    className="h-full w-12 flex items-center justify-center hover:bg-gray-700 transition-colors focus:outline-none dark:hover:bg-gray-700 hover:bg-gray-200"
                    title="Minimize"
                >
                    <Minus size={16} className="text-gray-400 dark:text-gray-400 text-gray-600" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="h-full w-12 flex items-center justify-center hover:bg-gray-700 transition-colors focus:outline-none dark:hover:bg-gray-700 hover:bg-gray-200"
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <Copy size={14} className="text-gray-400 transform rotate-180 dark:text-gray-400 text-gray-600" />
                    ) : (
                        <Square size={14} className="text-gray-400 dark:text-gray-400 text-gray-600" />
                    )}
                </button>
                <button
                    onClick={handleClose}
                    className="h-full w-12 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors focus:outline-none group"
                    title="Close"
                >
                    <X size={16} className="text-gray-400 group-hover:text-white dark:text-gray-400 text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
