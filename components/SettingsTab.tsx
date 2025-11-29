import React from 'react';
import { Settings, Save } from 'lucide-react';

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
        <div className="flex flex-col h-full bg-retro-900 text-gray-300 p-8">
            <div className="mb-8 border-b border-retro-700 pb-4">
                <h2 className="text-2xl font-bold text-retro-accent flex items-center gap-2">
                    <Settings /> Settings
                </h2>
                <p className="text-gray-500 mt-2">Configure application behavior.</p>
            </div>

            <div className="space-y-6 max-w-2xl">

                {/* Dry Run Setting */}
                <div className="bg-retro-800 p-6 rounded-lg border border-retro-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Dry Run Mode</h3>
                            <p className="text-sm text-gray-400 mt-1">
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
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-retro-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-retro-accent"></div>
                        </label>
                    </div>
                </div>

                {/* Future settings can go here */}

            </div>
        </div>
    );
};
