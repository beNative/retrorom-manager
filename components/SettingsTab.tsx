import React, { useState, useEffect } from 'react';
import { Settings, FolderOpen } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsTabProps {
    dryRunMode: boolean;
    setDryRunMode: (enabled: boolean) => void;
    currentPath: string | null;
    onSelectFolder: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ dryRunMode, setDryRunMode, currentPath, onSelectFolder }) => {
    const [settings, setSettings] = useState<AppSettings>({});

    useEffect(() => {
        const loadSettings = async () => {
            if ((window as any).electron && (window as any).electron.getSettings) {
                const loaded = await (window as any).electron.getSettings();
                setSettings(loaded);
            }
        };
        loadSettings();
    }, []);

    const handleDryRunChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setDryRunMode(newValue);
        // Persist setting
        if ((window as any).electron && (window as any).electron.saveSetting) {
            await (window as any).electron.saveSetting('dryRunMode', newValue);
        }
    };

    const handleSettingChange = (key: keyof AppSettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if ((window as any).electron && (window as any).electron.saveSetting) {
            (window as any).electron.saveSetting(key, value);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-retro-900 text-gray-900 dark:text-gray-300 p-8 transition-colors duration-200 overflow-y-auto">
            <div className="mb-8 border-b border-gray-200 dark:border-retro-700 pb-4 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-retro-accent flex items-center gap-2 transition-colors duration-200">
                    <Settings /> Settings
                </h2>
                <p className="text-gray-500 mt-2">Configure application behavior.</p>
            </div>

            <div className="space-y-6 max-w-2xl">

                {/* ROMs Location Setting */}
                <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">ROMs Location</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200 break-all">
                                {currentPath || "No folder selected"}
                            </p>
                        </div>
                        <button
                            onClick={onSelectFolder}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-retro-700 hover:bg-gray-300 dark:hover:bg-retro-600 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                        >
                            <FolderOpen size={16} />
                            Change Folder
                        </button>
                    </div>
                </div>

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

                {/* Scraper Selection */}
                <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Scraping Service</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active Scraper</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                            value={settings.activeScraper || 'screenscraper'}
                            onChange={(e) => handleSettingChange('activeScraper', e.target.value)}
                        >
                            <option value="screenscraper">ScreenScraper.fr (Best Metadata)</option>
                            <option value="thegamesdb">TheGamesDB (Free)</option>
                            <option value="mobygames">MobyGames (Non-Commercial)</option>
                        </select>
                    </div>
                </div>

                {/* ScreenScraper Settings */}
                {(!settings.activeScraper || settings.activeScraper === 'screenscraper') && (
                    <>
                        <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">ScreenScraper Credentials</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                                        placeholder="Username"
                                        value={settings.screenScraperUser || ''}
                                        onChange={(e) => handleSettingChange('screenScraperUser', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                                        placeholder="Password"
                                        value={settings.screenScraperPass || ''}
                                        onChange={(e) => handleSettingChange('screenScraperPass', e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Credentials are saved automatically. A free account is required to use the API.
                                </p>
                                <div className="mt-2">
                                    <button
                                        onClick={async () => {
                                            if ((window as any).electron && (window as any).electron.testScraperConnection) {
                                                const btn = document.getElementById('test-conn-btn');
                                                const status = document.getElementById('test-conn-status');
                                                if (btn) btn.setAttribute('disabled', 'true');
                                                if (status) status.textContent = 'Testing...';

                                                try {
                                                    const result = await (window as any).electron.testScraperConnection();
                                                    if (status) {
                                                        status.textContent = result.message;
                                                        status.className = result.success ? "text-sm text-green-600 dark:text-green-400 font-medium" : "text-sm text-red-600 dark:text-red-400 font-medium";
                                                    }
                                                } catch (e) {
                                                    if (status) {
                                                        status.textContent = "Error invoking test";
                                                        status.className = "text-sm text-red-600 dark:text-red-400 font-medium";
                                                    }
                                                } finally {
                                                    if (btn) btn.removeAttribute('disabled');
                                                }
                                            }
                                        }}
                                        id="test-conn-btn"
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Test Connection
                                    </button>
                                    <span id="test-conn-status" className="ml-3 text-sm"></span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Developer Credentials (Required)</h3>
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
                                <p className="mb-2">
                                    <strong>Important:</strong> A valid Developer ID and Password are required to use the ScreenScraper API.
                                    These are <strong>different</strong> from your regular login.
                                </p>
                                <p>
                                    You must request a Developer Key (DevID) from the ScreenScraper team.
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if ((window as any).electron && (window as any).electron.openExternal) {
                                                (window as any).electron.openExternal("https://screenscraper.fr/");
                                            }
                                        }}
                                        className="ml-1 underline hover:text-blue-800 dark:hover:text-blue-200 bg-transparent border-none p-0 cursor-pointer inline"
                                    >
                                        Visit ScreenScraper.fr
                                    </button>
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Developer ID (devid)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                                        placeholder="Enter your Developer ID"
                                        value={settings.screenScraperDevId || ''}
                                        onChange={(e) => handleSettingChange('screenScraperDevId', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Developer Password (devpassword)</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                                        placeholder="Enter your Developer Password"
                                        value={settings.screenScraperDevPass || ''}
                                        onChange={(e) => handleSettingChange('screenScraperDevPass', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* TheGamesDB Settings */}
                {settings.activeScraper === 'thegamesdb' && (
                    <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">TheGamesDB Settings</h3>
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
                            <p>
                                Get an API Key from <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if ((window as any).electron && (window as any).electron.openExternal) {
                                            (window as any).electron.openExternal("https://thegamesdb.net/");
                                        }
                                    }}
                                    className="underline hover:text-blue-800 dark:hover:text-blue-200 bg-transparent border-none p-0 cursor-pointer inline"
                                >TheGamesDB.net</button>.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                                placeholder="Enter your TheGamesDB API Key"
                                value={settings.theGamesDbApiKey || ''}
                                onChange={(e) => handleSettingChange('theGamesDbApiKey', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* MobyGames Settings */}
                {settings.activeScraper === 'mobygames' && (
                    <div className="bg-white dark:bg-retro-800 p-6 rounded-lg border border-gray-200 dark:border-retro-700 shadow-sm dark:shadow-none transition-colors duration-200">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">MobyGames Settings</h3>
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
                            <p>
                                Get an API Key from <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if ((window as any).electron && (window as any).electron.openExternal) {
                                            (window as any).electron.openExternal("https://www.mobygames.com/info/api");
                                        }
                                    }}
                                    className="underline hover:text-blue-800 dark:hover:text-blue-200 bg-transparent border-none p-0 cursor-pointer inline"
                                >MobyGames.com</button>.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-retro-accent"
                                placeholder="Enter your MobyGames API Key"
                                value={settings.mobyGamesApiKey || ''}
                                onChange={(e) => handleSettingChange('mobyGamesApiKey', e.target.value)}
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
