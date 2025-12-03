export interface ScrapedGameInfo {
    title: string;
    description: string;
    releaseDate?: string;
    developer?: string;
    publisher?: string;
    genre?: string;
    players?: string;
    rating?: string;
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
}

export interface ScraperRequest {
    gamePath: string;
    md5?: string;
    name: string;
    platform: string;
}

export interface ScraperProvider {
    name: string;
    search(request: ScraperRequest): Promise<ScrapedGameInfo | null>;
    testConnection(): Promise<{ success: boolean; message: string }>;
}
