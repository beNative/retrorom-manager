import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GameEntry, AppSettings } from '../../types';
import { SettingsService } from './settingsService';

// Simple CRC32 implementation or use a library if available.
// Since we don't want to add dependencies if possible, let's use a simple table-based one or just MD5 which is built-in to node crypto.
// ScreenScraper supports MD5.

export class ScraperService {
    private settingsService: SettingsService;

    constructor(settingsService?: SettingsService) {
        this.settingsService = settingsService || new SettingsService();
    }

    async scrapeMissing(systemPath: string, games: GameEntry[]): Promise<{ logs: string[], updated: number }> {
        const logs: string[] = [];
        let updated = 0;
        const settings = this.settingsService.getAll();
        const { screenScraperUser, screenScraperPass } = settings;

        if (!screenScraperUser || !screenScraperPass) {
            logs.push("Error: ScreenScraper credentials not found in settings.");
            return { logs, updated };
        }

        const usingCustomDev = !!settings.screenScraperDevId;
        logs.push(`Credentials: User=${screenScraperUser}, CustomDev=${usingCustomDev}`);

        logs.push(`Starting scrape for ${games.length} games in ${systemPath}...`);

        // Filter for games missing media
        const missingMediaGames = games.filter(g => !g.imageExists || !g.videoExists);

        if (missingMediaGames.length === 0) {
            logs.push("No games missing media.");
            return { logs, updated };
        }

        logs.push(`Found ${missingMediaGames.length} games with missing media.`);

        // Create media directories if they don't exist
        const mediaDir = path.join(systemPath, 'media');
        const imagesDir = path.join(mediaDir, 'images');
        const videosDir = path.join(mediaDir, 'videos');
        const marqueesDir = path.join(mediaDir, 'marquees');
        const manualsDir = path.join(mediaDir, 'manuals');

        [imagesDir, videosDir, marqueesDir, manualsDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        for (const game of missingMediaGames) {
            logs.push(`Scraping "${game.name}"...`);

            try {
                // 1. Calculate Hash (MD5)
                const romPath = path.join(systemPath, game.path);
                if (!fs.existsSync(romPath)) {
                    logs.push(`  -> ROM not found: ${game.path}`);
                    continue;
                }

                const md5 = await this.calculateMD5(romPath);
                logs.push(`  -> MD5: ${md5}`);

                // 2. Call API
                const info = await this.fetchGameInfo(md5, screenScraperUser, screenScraperPass);

                if (!info || !info.response || !info.response.jeu) {
                    logs.push(`  -> No match found.`);
                    continue;
                }

                const gameInfo = info.response.jeu;
                logs.push(`  -> Found: ${gameInfo.noms?.[0]?.text || 'Unknown Title'} (ID: ${gameInfo.id})`);

                // 3. Download Media
                let gameUpdated = false;

                // Helper to download if missing
                const downloadIfMissing = async (mediaType: string, targetDir: string, url: string | undefined) => {
                    if (!url) return false;
                    const ext = path.extname(url);
                    const targetPath = path.join(targetDir, `${game.id}${ext}`);

                    if (!fs.existsSync(targetPath)) {
                        logs.push(`  -> Downloading ${mediaType}...`);
                        try {
                            await this.downloadMedia(url, targetPath);
                            return true;
                        } catch (e) {
                            logs.push(`  -> Failed to download ${mediaType}: ${e}`);
                            return false;
                        }
                    }
                    return false;
                };

                // Parse medias
                const medias = gameInfo.medias;
                if (medias && Array.isArray(medias)) {
                    // ScreenScraper Media Types:
                    // ss = screenshot (gameplay)
                    // box-2d = boxart
                    // video = video
                    // wheel = marquee
                    // manual = manual

                    const findMedia = (type: string) => medias.find((m: any) => m.type === type)?.url;

                    // Prioritize box-2d, then ss for image
                    const imageUrl = findMedia('box-2d') || findMedia('ss');
                    if (!game.imageExists && await downloadIfMissing('image', imagesDir, imageUrl)) gameUpdated = true;

                    const videoUrl = findMedia('video');
                    if (!game.videoExists && await downloadIfMissing('video', videosDir, videoUrl)) gameUpdated = true;

                    const marqueeUrl = findMedia('wheel');
                    if (!game.marqueeExists && await downloadIfMissing('marquee', marqueesDir, marqueeUrl)) gameUpdated = true;

                    const manualUrl = findMedia('manual');
                    if (!game.manualExists && await downloadIfMissing('manual', manualsDir, manualUrl)) gameUpdated = true;
                }

                if (gameUpdated) updated++;

            } catch (error) {
                logs.push(`  -> Error: ${error}`);
            }

            // Rate limiting (basic)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        logs.push(`Scrape complete. Updated ${updated} games.`);
        return { logs, updated };
    }

    private calculateMD5(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    private async fetchGameInfo(md5: string, user: string, pass: string): Promise<any> {
        const settings = this.settingsService.getAll();

        const devId = settings.screenScraperDevId;
        const devPass = settings.screenScraperDevPass;

        if (!devId || !devPass) {
            throw new Error("Developer Credentials missing. Please configure them in Settings.");
        }

        const softName = 'RetroRomManager';

        // Construct URL
        const url = `https://www.screenscraper.fr/api2/jeuInfos.php?devid=${devId}&devpassword=${devPass}&softname=${softName}&ssid=${user}&sspassword=${pass}&md5=${md5}&output=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(`API Error: Forbidden (403). Check your Developer ID/Password in Settings.`);
                }
                throw new Error(`API Error: ${response.statusText}`);
            }
            return await response.json();
        } catch (e) {
            // Fallback or specific error handling
            throw e;
        }
    }

    private async downloadMedia(url: string, dest: string): Promise<void> {
        // Append credentials to download URL if not present
        const settings = this.settingsService.getAll();
        if (settings.screenScraperUser && settings.screenScraperPass) {
            const separator = url.includes('?') ? '&' : '?';
            if (!url.includes('ssid=')) {
                url += `${separator}ssid=${settings.screenScraperUser}&sspassword=${settings.screenScraperPass}`;
            }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        await fs.promises.writeFile(dest, Buffer.from(arrayBuffer));
    }
    async testConnection(): Promise<{ success: boolean; message: string }> {
        const settings = this.settingsService.getAll();
        const { screenScraperUser, screenScraperPass, screenScraperDevId, screenScraperDevPass } = settings;

        if (!screenScraperUser || !screenScraperPass) {
            return { success: false, message: 'Missing User credentials' };
        }

        if (!screenScraperDevId || !screenScraperDevPass) {
            return { success: false, message: 'Missing Developer credentials' };
        }

        const softName = 'RetroRomManager';

        // Use userInfos.php to test credentials
        const url = `https://www.screenscraper.fr/api2/userInfos.php?devid=${screenScraperDevId}&devpassword=${screenScraperDevPass}&softname=${softName}&ssid=${screenScraperUser}&sspassword=${screenScraperPass}&output=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                return { success: false, message: `HTTP Error: ${response.status} ${response.statusText}` };
            }

            const text = await response.text();
            // ScreenScraper sometimes returns text/html for errors even if json requested, or malformed json
            try {
                const data = JSON.parse(text);
                // Check for API level error inside JSON
                // Usually if successful, it returns the user object.
                // If error, it might have an error field or just be empty/different.
                // A successful userInfos call has a 'ssuser' root object.
                if (data.ssuser) {
                    return { success: true, message: `Connected as ${data.ssuser.id} (Level: ${data.ssuser.niveau})` };
                } else {
                    return { success: false, message: 'Invalid response format from API' };
                }
            } catch (e) {
                // If it's not JSON, it's likely an error message in plain text/html
                return { success: false, message: `API Error: ${text.substring(0, 100)}` };
            }

        } catch (error) {
            return { success: false, message: `Connection failed: ${error}` };
        }
    }
}
