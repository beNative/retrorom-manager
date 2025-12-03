import { ScraperProvider, ScraperRequest, ScrapedGameInfo } from './scraperProvider';
import { SettingsService } from '../settingsService';

export class TheGamesDBProvider implements ScraperProvider {
    name = 'TheGamesDB';
    private baseUrl = 'https://api.thegamesdb.net/v1';

    constructor(private settingsService: SettingsService) { }

    async search(request: ScraperRequest): Promise<ScrapedGameInfo | null> {
        const { name } = request;
        const apiKey = this.settingsService.get('theGamesDbApiKey');

        if (!apiKey) {
            throw new Error("TheGamesDB API Key missing.");
        }

        try {
            // 1. Search for the game to get ID
            const searchUrl = `${this.baseUrl}/Games/ByGameName?apikey=${apiKey}&name=${encodeURIComponent(name)}&fields=players,publishers,genres,overview,clearlogo,rating`;
            const searchResponse = await fetch(searchUrl);

            if (!searchResponse.ok) return null;

            const searchData = await searchResponse.json();
            if (!searchData.data || !searchData.data.games || searchData.data.games.length === 0) {
                return null;
            }

            // Use the first match
            const game = searchData.data.games[0];
            const gameId = game.id;

            // 2. Get Images (TheGamesDB separates images)
            const imagesUrl = `${this.baseUrl}/Games/Images?apikey=${apiKey}&games_id=${gameId}`;
            const imagesResponse = await fetch(imagesUrl);
            const imagesData = await imagesResponse.json();

            let boxart = '';
            if (imagesData.data && imagesData.data.images && imagesData.data.images[gameId]) {
                const images = imagesData.data.images[gameId];
                const box = images.find((i: any) => i.type === 'boxart' && i.side === 'front');
                if (box) {
                    boxart = `${imagesData.include.base_url.original}${box.filename}`;
                }
            }

            // Map Genre IDs to names if needed (TheGamesDB returns genre IDs in game object, and a separate include list)
            // For simplicity, we'll skip complex mapping for now or assume the 'include' field has it if we requested it?
            // The v1 API structure is a bit complex with includes.
            // Let's try to get genre from the include data if present.
            let genreName = '';
            if (searchData.include && searchData.include.genres && game.genres) {
                const gId = game.genres[0];
                const gObj = searchData.include.genres[gId];
                if (gObj) genreName = gObj.name;
            }

            return {
                title: game.game_title,
                description: game.overview,
                releaseDate: game.release_date,
                developer: game.developers ? searchData.include.developers[game.developers[0]]?.name : undefined,
                publisher: game.publishers ? searchData.include.publishers[game.publishers[0]]?.name : undefined,
                genre: genreName,
                players: game.players?.toString(),
                rating: game.rating ? (game.rating * 5 / 10).toString() : undefined, // 10 scale to 5
                imageUrl: boxart,
                thumbnailUrl: boxart
            };

        } catch (error) {
            console.error("TheGamesDB error:", error);
            return null;
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const apiKey = this.settingsService.get('theGamesDbApiKey');
        if (!apiKey) return { success: false, message: 'Missing API Key' };

        try {
            // Simple call to check validity, e.g. list platforms
            const url = `${this.baseUrl}/Platforms?apikey=${apiKey}`;
            const response = await fetch(url);
            if (response.ok) {
                return { success: true, message: 'Connection Successful' };
            }
            return { success: false, message: `Failed: ${response.statusText}` };
        } catch (e: any) {
            return { success: false, message: `Error: ${e.message}` };
        }
    }
}
