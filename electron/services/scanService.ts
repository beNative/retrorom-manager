import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

// Duplicate interfaces here to avoid TS path mapping complexity in this single-block format
// In a real repo, we would import from a shared workspace package.
interface System {
  id: string;
  name: string;
  path: string;
  gamelistPath: string;
  games: any[];
  stats: any;
  scanTime: number;
}

export class ScanService {
  private basePath: string;
  private parser: XMLParser;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => name === "game" // Force 'game' to always be an array
    });
  }

  async scanAll() {
    const systems: System[] = [];

    // 1. Identify System Folders
    // Logic: Look for directories in base path.
    const entries = await fs.promises.readdir(this.basePath, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());

    for (const dir of dirs) {
      const systemPath = path.join(this.basePath, dir.name);

      // Simple heuristic: It's a system if it has a gamelist.xml OR typical ROM extensions
      const gamelistPath = path.join(systemPath, 'gamelist.xml');
      const hasGamelist = fs.existsSync(gamelistPath);

      // Skip if likely not a rom folder (e.g. 'images' folder at root)
      if (['media', 'images', 'bios'].includes(dir.name)) continue;

      // 2. Scan Files
      const allFiles = await this.recursiveReaddir(systemPath);
      const romFiles = allFiles.filter(f => this.isRomExtension(f));
      const mediaFiles = allFiles.filter(f => this.isMediaExtension(f));

      // 3. Parse XML
      let xmlGames: any[] = [];
      if (hasGamelist) {
        try {
          const xmlContent = await fs.promises.readFile(gamelistPath, 'utf-8');
          const parsed = this.parser.parse(xmlContent);
          if (parsed.gameList && parsed.gameList.game) {
            xmlGames = parsed.gameList.game;
          }
        } catch (e) {
          console.error(`Error parsing ${gamelistPath}`, e);
        }
      }

      // 4. Correlate Data
      const games = this.buildGameEntries(systemPath, romFiles, xmlGames, mediaFiles);

      const stats = {
        totalRoms: romFiles.length,
        totalGamelistEntries: xmlGames.length,
        missingImages: games.filter(g => g.romExists && !g.imageExists).length,
        missingVideos: games.filter(g => g.romExists && !g.videoExists).length,
        orphanedMedia: 0, // Simplified for this demo
        romsWithoutEntry: games.filter(g => g.romExists && !g.inGamelist).length,
        entriesWithoutRom: games.filter(g => !g.romExists && g.inGamelist).length
      };

      systems.push({
        id: dir.name,
        name: dir.name.toUpperCase(),
        path: systemPath,
        gamelistPath: hasGamelist ? gamelistPath : '',
        games,
        stats,
        scanTime: Date.now()
      });
    }

    return { systems };
  }

  private buildGameEntries(systemPath: string, romFiles: string[], xmlGames: any[], mediaFiles: string[]) {
    const entries: any[] = [];
    const processedRoms = new Set<string>();

    // 1. Process XML Entries
    xmlGames.forEach(xmlGame => {
      // Resolve path relative to system folder. XML usually has "./Game.zip"
      const rawPath = xmlGame.path;
      let normalizedPath = rawPath;
      if (rawPath.startsWith('./')) normalizedPath = rawPath.substring(2);

      // Check if ROM exists
      // Note: romFiles are absolute paths in recursive scan? No, recursiveReaddir returns absolute.
      // Let's normalize everything to absolute for comparison.
      const absoluteRomPath = path.resolve(systemPath, normalizedPath);
      const romExists = fs.existsSync(absoluteRomPath);

      if (romExists) {
        processedRoms.add(absoluteRomPath);
      }

      // Check Media
      const getMediaPath = (xmlPath: string | undefined): string | undefined => {
        if (!xmlPath) return undefined;
        let p = xmlPath;
        if (p.startsWith('./')) p = p.substring(2);
        const absPath = path.resolve(systemPath, p);
        return fs.existsSync(absPath) ? `file://${absPath.replace(/\\/g, '/')}` : undefined;
      };

      const imagePath = getMediaPath(xmlGame.image);
      const videoPath = getMediaPath(xmlGame.video);
      const marqueePath = getMediaPath(xmlGame.marquee);
      const manualPath = getMediaPath(xmlGame.manual);

      entries.push({
        id: path.basename(normalizedPath, path.extname(normalizedPath)),
        path: normalizedPath,
        name: xmlGame.name,
        desc: xmlGame.desc,
        image: xmlGame.image,
        video: xmlGame.video,
        marquee: xmlGame.marquee,
        manual: xmlGame.manual,
        romExists,
        inGamelist: true,
        imageExists: !!imagePath,
        videoExists: !!videoPath,
        marqueeExists: !!marqueePath,
        manualExists: !!manualPath,
        imagePath,
        videoPath,
        marqueePath,
        manualPath,
        systemId: path.basename(systemPath)
      });
    });

    // 2. Process ROMs not in XML
    romFiles.forEach(romAbsPath => {
      if (!processedRoms.has(romAbsPath)) {
        const relPath = path.relative(systemPath, romAbsPath);
        entries.push({
          id: path.basename(relPath, path.extname(relPath)),
          path: relPath,
          name: path.basename(relPath, path.extname(relPath)), // Default name
          romExists: true,
          inGamelist: false,
          imageExists: false,
          videoExists: false,
          marqueeExists: false,
          manualExists: false,
          systemId: path.basename(systemPath)
        });
      }
    });

    return entries;
  }

  private async recursiveReaddir(dir: string): Promise<string[]> {
    let results: string[] = [];
    try {
      const list = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Optimization: Don't dive deep into obviously non-rom folders if needed
          if (!['media', 'images', 'videos'].includes(entry.name)) {
            const res = await this.recursiveReaddir(fullPath);
            results = results.concat(res);
          } else {
            // But wait, user might have media, we need to list it for Orphan detection
            // For now, let's just collect files in root and immediate subdirs
            const subList = await fs.promises.readdir(fullPath);
            results = results.concat(subList.map(s => path.join(fullPath, s)));
          }
        } else {
          results.push(fullPath);
        }
      }
    } catch (e) {
      // Permission denied or other errors
    }
    return results;
  }

  private isRomExtension(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.zip', '.7z', '.nes', '.sfc', '.smc', '.iso', '.bin', '.cue', '.gba', '.gb', '.md'].includes(ext);
  }

  private isMediaExtension(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.mp4', '.gif'].includes(ext);
  }
}