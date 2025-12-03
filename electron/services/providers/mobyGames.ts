import { ScraperProvider, ScraperRequest, ScrapedGameInfo } from './scraperProvider';
import { SettingsService } from '../settingsService';

export class MobyGamesProvider implements ScraperProvider {
    name = 'MobyGames';
    private baseUrl = 'https://api.mobygames.com/v1';

    constructor(private settingsService: SettingsService) { }

    async search(request: ScraperRequest): Promise<ScrapedGameInfo | null> {
        const { name } = request;
        const apiKey = this.settingsService.get('mobyGamesApiKey');

        if (!apiKey) {
            throw new Error("MobyGames API Key missing.");
        }

        try {
            // 1. Search for game
            const searchUrl = `${this.baseUrl}/games?api_key=${apiKey}&title=${encodeURIComponent(name)}`;
            const response = await fetch(searchUrl);

            if (!response.ok) return null;

            const data = await response.json();
            if (!data.games || data.games.length === 0) return null;

            const game = data.games[0]; // Take first match
            const gameId = game.game_id;

            // 2. Get more details (cover art)
            // The basic search returns sample_cover object
            let imageUrl = '';
            if (game.sample_cover && game.sample_cover.image) {
                imageUrl = game.sample_cover.image;
            }

            // MobyGames genres are in 'genres' array
            const genre = game.genres && game.genres.length > 0 ? game.genres[0].genre_name : undefined;

            return {
                title: game.title,
                description: game.description || '', // Description might need separate call or be in 'description' field depending on endpoint
                releaseDate: game.platforms && game.platforms.length > 0 ? game.platforms[0].first_release_date : undefined,
                genre: genre,
                rating: game.moby_score ? (game.moby_score / 2).toString() : undefined, // 10 scale to 5
                imageUrl: imageUrl,
                thumbnailUrl: game.sample_cover ? game.sample_cover.thumbnail_image : undefined
            };

        } catch (error) {
            console.error("MobyGames error:", error);
            return null;
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const apiKey = this.settingsService.get('mobyGamesApiKey');
        if (!apiKey) return { success: false, message: 'Missing API Key' };

        try {
            const url = `${this.baseUrl}/genres?api_key=${apiKey}`;
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
