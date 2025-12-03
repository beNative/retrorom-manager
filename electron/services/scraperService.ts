import { SettingsService } from './settingsService';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ScraperProvider, ScrapedGameInfo } from './providers/scraperProvider';
import { ScreenScraperProvider } from './providers/screenScraper';
import { TheGamesDBProvider } from './providers/theGamesDb';
import { MobyGamesProvider } from './providers/mobyGames';

export class ScraperService {
    constructor(private settingsService: SettingsService) { }

    private getProvider(): ScraperProvider {
        const settings = this.settingsService.getAll();
        const active = settings.activeScraper || 'screenscraper';

        switch (active) {
            case 'thegamesdb':
                return new TheGamesDBProvider(this.settingsService);
            case 'mobygames':
                return new MobyGamesProvider(this.settingsService);
            case 'screenscraper':
            default:
                return new ScreenScraperProvider(this.settingsService);
        }
    }

    async scrapeMissing(systemPath: string, games: any[]): Promise<{ logs: string[], updated: number }> {
        const logs: string[] = [];
        let updated = 0;
        const provider = this.getProvider();

        logs.push(`Using Scraper: ${provider.name}`);

        for (const game of games) {
            // Check if media exists (simplified check, assumes box-2d)
            const mediaPath = path.join(systemPath, 'media', 'box-2d', `${game.name}.png`);
            if (fs.existsSync(mediaPath)) {
                continue;
            }

            logs.push(`Scraping "${game.name}"...`);

            try {
                const romPath = path.join(systemPath, game.path);
                if (!fs.existsSync(romPath)) {
                    logs.push(`  -> ROM not found: ${game.path}`);
                    continue;
                }

                // Calculate MD5 (always useful)
                const md5 = await this.calculateMD5(romPath);

                // Search
                const info = await provider.search({
                    gamePath: romPath,
                    md5: md5,
                    name: game.name,
                    platform: 'unknown' // TODO: Pass platform from system info
                });

                if (!info) {
                    logs.push(`  -> No match found.`);
                    continue;
                }

                logs.push(`  -> Found: ${info.title}`);

                // Download Media
                if (info.imageUrl) {
                    const mediaDir = path.join(systemPath, 'media', 'box-2d');
                    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

                    const dest = path.join(mediaDir, `${game.name}.png`);
                    await this.downloadMedia(info.imageUrl, dest);
                    logs.push(`  -> Downloaded boxart.`);
                    updated++;
                }

                // TODO: Update gamelist.xml or return data to be updated by FixService
                // For now, we rely on FixService 'LINK_MEDIA' to pick up the files we downloaded.

            } catch (e: any) {
                logs.push(`  -> Error: ${e.message}`);
            }
        }

        logs.push(`Scrape complete. Updated ${updated} games.`);
        return { logs, updated };
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        return this.getProvider().testConnection();
    }

    private async calculateMD5(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    private async downloadMedia(url: string, dest: string): Promise<void> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        await fs.promises.writeFile(dest, Buffer.from(arrayBuffer));
    }
}
