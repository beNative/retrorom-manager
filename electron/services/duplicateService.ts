import path from 'path';
import { System } from '../../types';

export interface DuplicateGroup {
    name: string; // The normalized name
    files: {
        path: string; // Absolute path
        filename: string;
        systemId: string;
        size: number; // Optional, for future use
    }[];
}

export class DuplicateService {
    findDuplicates(systems: System[]): Record<string, DuplicateGroup[]> {
        const results: Record<string, DuplicateGroup[]> = {};

        for (const system of systems) {
            const groups: Record<string, DuplicateGroup> = {};

            // We need to look at all ROMs, not just those in gamelist
            // The system object has 'games' which includes both (if scanned correctly)
            // But wait, ScanService puts everything in 'games'.

            for (const game of system.games) {
                if (!game.romExists) continue;

                // We need the absolute path. 'game.path' is relative to system path.
                const absPath = path.join(system.path, game.path);
                const filename = path.basename(absPath);
                const normalized = this.normalizeName(filename);

                if (!groups[normalized]) {
                    groups[normalized] = {
                        name: normalized,
                        files: []
                    };
                }

                groups[normalized].files.push({
                    path: absPath,
                    filename: filename,
                    systemId: system.id,
                    size: 0 // We'd need fs.stat for this, maybe later
                });
            }

            // Filter out groups with only 1 file
            const duplicates = Object.values(groups).filter(g => g.files.length > 1);

            if (duplicates.length > 0) {
                results[system.id] = duplicates;
            }
        }

        return results;
    }

    private normalizeName(filename: string): string {
        // Remove extension
        let name = path.basename(filename, path.extname(filename));

        // Remove content in brackets [] and parentheses ()
        // e.g. "Super Mario World (USA) [!]" -> "Super Mario World"
        name = name.replace(/\[.*?\]/g, '');
        name = name.replace(/\(.*?\)/g, '');

        // Remove version numbers like v1.0, v1.1
        name = name.replace(/v\d+(\.\d+)?/gi, '');

        // Trim whitespace and special chars
        name = name.trim();

        return name.toLowerCase();
    }
}
