import fs from 'fs';
import path from 'path';

export interface BiosDefinition {
    system: string;
    filename: string;
    description: string;
    md5?: string;
    isOptional?: boolean;
}

export interface BiosResult {
    definition: BiosDefinition;
    found: boolean;
    path?: string;
}

const BIOS_DEFINITIONS: BiosDefinition[] = [
    // PlayStation
    { system: 'PlayStation', filename: 'scph1001.bin', description: 'PSX BIOS (USA)', isOptional: false },
    { system: 'PlayStation', filename: 'scph5500.bin', description: 'PSX BIOS (JP)', isOptional: true },
    { system: 'PlayStation', filename: 'scph5502.bin', description: 'PSX BIOS (EU)', isOptional: true },

    // PlayStation 2
    { system: 'PlayStation 2', filename: 'scph39001.bin', description: 'PS2 BIOS (USA)', isOptional: false },

    // Dreamcast
    { system: 'Dreamcast', filename: 'dc_boot.bin', description: 'Dreamcast BIOS', isOptional: false },
    { system: 'Dreamcast', filename: 'dc_flash.bin', description: 'Dreamcast Flash', isOptional: false },

    // Sega CD
    { system: 'Sega CD', filename: 'bios_CD_U.bin', description: 'Sega CD BIOS (USA)', isOptional: false },
    { system: 'Sega CD', filename: 'bios_CD_E.bin', description: 'Sega CD BIOS (EU)', isOptional: true },
    { system: 'Sega CD', filename: 'bios_CD_J.bin', description: 'Sega CD BIOS (JP)', isOptional: true },

    // Saturn
    { system: 'Saturn', filename: 'sega_101.bin', description: 'Saturn BIOS (JP)', isOptional: false },
    { system: 'Saturn', filename: 'mpr-17933.bin', description: 'Saturn BIOS (USA/EU)', isOptional: false },

    // GBA
    { system: 'GBA', filename: 'gba_bios.bin', description: 'Game Boy Advance BIOS', isOptional: false },

    // Neo Geo
    { system: 'Neo Geo', filename: 'neogeo.zip', description: 'Neo Geo BIOS Pack', isOptional: false },
];

export class BiosService {
    async checkBios(basePath: string): Promise<BiosResult[]> {
        // Assumption: BIOS folder is either inside the selected folder (if it's the root roms folder)
        // or parallel to it.
        // Common setup: /home/pi/RetroPie/roms -> /home/pi/RetroPie/BIOS

        // Let's try a few common locations
        const candidates = [
            path.join(basePath, 'bios'),
            path.join(basePath, 'BIOS'),
            path.join(path.dirname(basePath), 'bios'),
            path.join(path.dirname(basePath), 'BIOS'),
            basePath // Maybe user selected the BIOS folder itself?
        ];

        let biosPath = '';
        for (const p of candidates) {
            if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
                biosPath = p;
                break;
            }
        }

        if (!biosPath) {
            // If we can't find a dedicated BIOS folder, we'll just check the base path
            // but warn the user or return all missing?
            // For now, let's treat the base path as the search target if no specific 'bios' folder found.
            biosPath = basePath;
        }

        const results: BiosResult[] = [];

        for (const def of BIOS_DEFINITIONS) {
            const filePath = path.join(biosPath, def.filename);
            const found = fs.existsSync(filePath);

            results.push({
                definition: def,
                found,
                path: found ? filePath : undefined
            });
        }

        return results;
    }
}
