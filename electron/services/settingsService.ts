import fs from 'fs';
import path from 'path';
import { app } from 'electron';

import { AppSettings } from '../../types';

// interface AppSettings removed as it is imported

export class SettingsService {
    private settingsPath: string;
    private settings: AppSettings;

    constructor() {
        this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
        this.settings = this.loadSettings();
    }

    private loadSettings(): AppSettings {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        return {};
    }

    private saveSettings() {
        try {
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    get<K extends keyof AppSettings>(key: K): AppSettings[K] {
        return this.settings[key];
    }

    set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        this.settings[key] = value;
        this.saveSettings();
    }

    getAll(): AppSettings {
        return { ...this.settings };
    }
}
