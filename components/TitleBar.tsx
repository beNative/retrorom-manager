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
        <div className="h-8 flex items-center justify-between select-none z-50 border-b transition-colors duration-200 bg-gray-100 border-gray-300 dark:bg-[#1a1b26] dark:border-gray-800">
            {/* Drag Region */}
            <div className="flex-1 h-full flex items-center pl-4 app-drag-region">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">RetroRom Manager</span>
            </div>

            {/* Window Controls - No Drag */}
            <div className="flex items-center h-full app-no-drag">
                <button
                    onClick={toggleTheme}
                    className="h-full px-4 flex items-center justify-center transition-colors text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button
                    onClick={handleMinimize}
                    className="h-full w-12 flex items-center justify-center transition-colors focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Minimize"
                >
                    <Minus size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="h-full w-12 flex items-center justify-center transition-colors focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <Copy size={14} className="transform rotate-180 text-gray-600 dark:text-gray-400" />
                    ) : (
                        <Square size={14} className="text-gray-600 dark:text-gray-400" />
                    )}
                </button>
                <button
                    onClick={handleClose}
                    className="h-full w-12 flex items-center justify-center transition-colors focus:outline-none group hover:bg-red-600 hover:text-white"
                    title="Close"
                >
                    <X size={16} className="text-gray-600 group-hover:text-white dark:text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
