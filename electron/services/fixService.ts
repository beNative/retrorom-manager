import fs from 'fs';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export class FixService {
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    async performAction(systemId: string, action: string, dryRun: boolean) {
        const logs: string[] = [];
        const systemPath = path.join(this.basePath, systemId);
        const gamelistPath = path.join(systemPath, 'gamelist.xml');

        logs.push(`Action: ${action}, DryRun: ${dryRun}`);
        logs.push(`Target: ${systemPath}`);

        if (action === 'SYNC_GAMELIST') {
            await this.syncGamelist(systemPath, gamelistPath, dryRun, logs);
        } else if (action === 'LINK_MEDIA') {
            await this.linkMedia(systemPath, gamelistPath, dryRun, logs);
        } else {
            logs.push("Action not implemented yet.");
        }

        return { logs, success: true };
    }

    private async syncGamelist(systemPath: string, gamelistPath: string, dryRun: boolean, logs: string[]) {
        // 1. Load existing XML
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", isArray: (name) => name === "game" });
        const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", format: true });

        let xmlData: any = { gameList: { game: [] } };

        if (fs.existsSync(gamelistPath)) {
            const content = await fs.promises.readFile(gamelistPath, 'utf-8');
            xmlData = parser.parse(content);
        }

        if (!xmlData.gameList) xmlData.gameList = {};
        if (!xmlData.gameList.game) xmlData.gameList.game = [];

        const existingGames = xmlData.gameList.game;

        // 2. Scan ROMs again to be sure
        const files = await fs.promises.readdir(systemPath);
        const roms = files.filter(f => ['.zip', '.nes', '.sfc', '.md', '.iso', '.rvz'].includes(path.extname(f).toLowerCase()));

        // 3. Find Missing Entries
        let addedCount = 0;
        roms.forEach(rom => {
            const romPathEntry = `./${rom}`;
            const exists = existingGames.find((g: any) => g.path === romPathEntry);

            if (!exists) {
                logs.push(`[+] Found unlisted ROM: ${rom}`);
                if (!dryRun) {
                    existingGames.push({
                        path: romPathEntry,
                        name: path.basename(rom, path.extname(rom)) // Simple name derivation
                    });
                }
                addedCount++;
            }
        });

        // 4. Find Orphan Entries (Entry exists, file doesn't)
        const validGames = existingGames.filter((g: any) => {
            let p = g.path;
            if (p.startsWith('./')) p = p.substring(2);
            const absPath = path.join(systemPath, p);
            if (!fs.existsSync(absPath)) {
                logs.push(`[-] Found orphan entry (ROM missing): ${g.path}`);
                return dryRun; // In dry run, we keep them to simulate. In real run, filter removes them.
            }
            return true;
        });

        if (addedCount === 0 && validGames.length === existingGames.length) {
            logs.push("No changes needed.");
            return;
        }

        if (!dryRun) {
            xmlData.gameList.game = validGames;

            // Backup
            const backupPath = `${gamelistPath}.bak-${Date.now()}`;
            if (fs.existsSync(gamelistPath)) {
                await fs.promises.copyFile(gamelistPath, backupPath);
                logs.push(`Backup created: ${path.basename(backupPath)}`);
            }

            const newXml = builder.build(xmlData);
            await fs.promises.writeFile(gamelistPath, newXml, 'utf-8');
            logs.push(`Gamelist updated. Added: ${addedCount}, Removed: ${existingGames.length - validGames.length}`);
        } else {
            logs.push(`Summary: Would add ${addedCount} entries and remove ${existingGames.length - validGames.length} orphan entries.`);
        }
    }

    private async linkMedia(systemPath: string, gamelistPath: string, dryRun: boolean, logs: string[]) {
        logs.push("Scanning for matching media files...");
        // Simplified Auto-Linker: Looks for media/images/{romName}.png/jpg/mp4

        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", isArray: (name) => name === "game" });
        const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", format: true });

        if (!fs.existsSync(gamelistPath)) {
            logs.push("No gamelist found to link.");
            return;
        }

        const content = await fs.promises.readFile(gamelistPath, 'utf-8');
        const xmlData = parser.parse(content);
        const games = xmlData.gameList.game;
        let updates = 0;

        // Common media folders
        const mediaFolders = [
            'media', 'images', 'boxart', 'videos', 'snap',
            'media/images', 'media/videos', 'media/boxart', 'media/marquees', 'media/manuals'
        ];

        for (const game of games) {
            if (game.image && game.video) continue; // Already has media

            let p = game.path;
            if (p.startsWith('./')) p = p.substring(2);
            const romName = path.basename(p, path.extname(p));

            // Search folders
            for (const folder of mediaFolders) {
                const folderPath = path.join(systemPath, folder);
                if (!fs.existsSync(folderPath)) continue;

                const files = await fs.promises.readdir(folderPath);

                // Find matching file
                const match = files.find(f => path.basename(f, path.extname(f)) === romName);
                if (match) {
                    const ext = path.extname(match).toLowerCase();
                    const relPath = `./${folder}/${match}`;

                    if (['.png', '.jpg', '.jpeg'].includes(ext) && !game.image) {
                        logs.push(`[LINK] Found Image for ${romName}: ${relPath}`);
                        if (!dryRun) game.image = relPath;
                        updates++;
                    } else if (['.mp4'].includes(ext) && !game.video) {
                        logs.push(`[LINK] Found Video for ${romName}: ${relPath}`);
                        if (!dryRun) game.video = relPath;
                        updates++;
                    }
                }
            }
        }

        if (updates > 0 && !dryRun) {
            const backupPath = `${gamelistPath}.bak-${Date.now()}`;
            await fs.promises.copyFile(gamelistPath, backupPath);
            const newXml = builder.build(xmlData);
            await fs.promises.writeFile(gamelistPath, newXml, 'utf-8');
            logs.push(`Updated ${updates} media links in gamelist.xml`);
        } else if (dryRun) {
            logs.push(`Found ${updates} potential media links.`);
        }
    }
}