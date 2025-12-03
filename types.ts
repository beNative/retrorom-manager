// Domain Models

export interface RomFile {
  filename: string;
  path: string; // Relative to system rom path
  extension: string;
}

export interface MediaFile {
  filename: string;
  path: string; // Absolute path
  type: 'image' | 'video' | 'marquee' | 'manual' | 'unknown';
}

export interface GameEntry {
  // XML Data
  path: string; // Path as stored in XML (usually ./Game.zip)
  name: string;
  desc?: string;
  image?: string;
  video?: string;
  marquee?: string;
  manual?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  genre?: string;
  rating?: number;

  // Computed Metadata
  id: string; // Normalized ID (e.g. filename without ext)
  systemId: string;

  // Validation Flags
  romExists: boolean;
  imageExists: boolean;
  videoExists: boolean;
  marqueeExists: boolean;
  manualExists: boolean;

  // Resolved Paths (for visualization)
  imagePath?: string;
  videoPath?: string;
  marqueePath?: string;
  manualPath?: string;

  inGamelist: boolean; // True if found in XML
  isDuplicate: boolean;
}

export interface SystemStats {
  totalRoms: number;
  totalGamelistEntries: number;
  missingImages: number;
  missingVideos: number;
  orphanedMedia: number;
  romsWithoutEntry: number;
  entriesWithoutRom: number;
}

export interface System {
  id: string;
  name: string;
  path: string;
  gamelistPath: string;
  games: GameEntry[];
  stats: SystemStats;
  scanTime: number;
}

export interface ScanResult {
  systems: System[];
}

// IPC Events
export const CHANNELS = {
  SELECT_FOLDER: 'select-folder',
  SCAN_ROMS: 'scan-roms',
  FIX_ISSUES: 'fix-issues', // Placeholder for fix logic
};

export type FixActionType = 'SYNC_GAMELIST' | 'LINK_MEDIA' | 'CLEAN_MEDIA' | 'SCRAPE_MISSING';

export interface FixRequest {
  systemId: string;
  action: FixActionType;
  dryRun: boolean;
}

export interface FixResult {
  logs: string[];
  success: boolean;
}

export interface DuplicateFile {
  path: string;
  filename: string;
  systemId: string;
  size: number;
}

export interface DuplicateGroup {
  name: string;
  files: DuplicateFile[];
}

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

export interface AppSettings {
  lastOpenedPath?: string;
  dryRunMode?: boolean;
  screenScraperUser?: string;
  screenScraperPass?: string;
  screenScraperDevId?: string;
  screenScraperDevPass?: string;
}