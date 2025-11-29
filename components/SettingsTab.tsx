import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsTabProps {
    dryRunMode: boolean;
    setDryRunMode: (enabled: boolean) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ dryRunMode, setDryRunMode }) => {

    const handleDryRunChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setDryRunMode(newValue);
        // Persist setting
        // We need to expose a saveSetting method in electron/preload.ts and main.ts
        // For now, we'll assume it exists or use a generic 'set-setting' IPC if available.
        // Based on previous steps, we only had 'get-settings'. We need to add 'set-setting'.
        if ((window as any).electron && (window as any).electron.saveSetting) {
            await (window as any).electron.saveSetting('dryRunMode', newValue);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-retro-900 text-gray-900 dark:text-gray-300 p-8 transition-colors duration-200">
            <div className="mb-8 border-b border-gray-200 dark:border-retro-700 pb-4 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-retro-accent flex items-center gap-2 transition-colors duration-200">
                    <Settings /> Settings
                </h2>
                <p className="text-gray-500 mt-2">Configure application behavior.</p>
            </div>

            <div className="space-y-6 max-w-2xl">

                {/* Dry Run Setting */}
                <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Dry Run Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
                                When enabled, "Fix" actions will only simulate changes and log what would happen.
                                Disable this to actually modify files.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={dryRunMode}
                                onChange={handleDryRunChange}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-retro-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-retro-accent transition-colors duration-200"></div>
                        </label>
                    </div>
                </div>

                {/* Future settings can go here */}

            </div>
        </div>
    );
};
