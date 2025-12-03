import { ScraperProvider, ScraperRequest, ScrapedGameInfo } from './scraperProvider';
import { SettingsService } from '../settingsService';

export class ScreenScraperProvider implements ScraperProvider {
    name = 'ScreenScraper';

    constructor(private settingsService: SettingsService) { }

    async search(request: ScraperRequest): Promise<ScrapedGameInfo | null> {
        const { md5, name, platform } = request;

        // ScreenScraper relies heavily on MD5, but can fallback to name (though MD5 is preferred)
        // For this implementation, we'll stick to the existing MD5 logic if available, 
        // but we could expand to name search if MD5 fails.

        if (!md5) {
            console.warn('ScreenScraper provider requires MD5 for best results.');
            return null;
        }

        const settings = this.settingsService.getAll();
        const user = settings.screenScraperUser;
        const pass = settings.screenScraperPass;
        const devId = settings.screenScraperDevId;
        const devPass = settings.screenScraperDevPass;

        if (!devId || !devPass) {
            throw new Error("Developer Credentials missing.");
        }

        const softName = 'RetroRomManager';
        const url = `https://www.screenscraper.fr/api2/jeuInfos.php?devid=${devId}&devpassword=${devPass}&softname=${softName}&ssid=${user}&sspassword=${pass}&md5=${md5}&output=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("API Error: Forbidden (403). Check your Developer ID/Password.");
                }
                // 404 means not found, usually
                return null;
            }

            const data = await response.json();
            if (!data.response || !data.response.jeu) {
                return null;
            }

            const jeu = data.response.jeu;

            // Helper to get region specific text
            const getText = (list: any[], region: string = 'us') => {
                if (!list) return '';
                const item = list.find((x: any) => x.region === region) || list.find((x: any) => x.region === 'en') || list[0];
                return item ? item.text : '';
            };

            return {
                title: getText(jeu.noms),
                description: getText(jeu.synopsis),
                releaseDate: jeu.dates ? jeu.dates[0]?.text : undefined,
                developer: jeu.developpeur ? jeu.developpeur.text : undefined,
                publisher: jeu.editeur ? jeu.editeur.text : undefined,
                genre: jeu.genres ? jeu.genres[0]?.noms?.find((x: any) => x.langue === 'en')?.text : undefined,
                players: jeu.joueurs ? jeu.joueurs.text : undefined,
                rating: jeu.note ? (parseInt(jeu.note.text) / 20 * 5).toString() : undefined, // Convert 20 scale to 5
                imageUrl: this.findMedia(jeu.medias, 'box-2d') || this.findMedia(jeu.medias, 'ss'),
                videoUrl: this.findMedia(jeu.medias, 'video'),
                thumbnailUrl: this.findMedia(jeu.medias, 'box-2d')
            };

        } catch (error) {
            console.error("ScreenScraper error:", error);
            throw error;
        }
    }

    private findMedia(medias: any[], type: string): string | undefined {
        if (!medias) return undefined;
        // ScreenScraper media types: 
        // ss = screenshot, box-2d = boxart, video = video
        const media = medias.find((m: any) => m.type === type);
        if (media) {
            // Append credentials to URL for download authorization
            const settings = this.settingsService.getAll();
            return `${media.url}&ssid=${settings.screenScraperUser}&sspassword=${settings.screenScraperPass}`;
        }
        return undefined;
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const settings = this.settingsService.getAll();
        const { screenScraperUser, screenScraperPass, screenScraperDevId, screenScraperDevPass } = settings;

        if (!screenScraperUser || !screenScraperPass) return { success: false, message: 'Missing User credentials' };
        if (!screenScraperDevId || !screenScraperDevPass) return { success: false, message: 'Missing Developer credentials' };

        const softName = 'RetroRomManager';
        const url = `https://www.screenscraper.fr/api2/userInfos.php?devid=${screenScraperDevId}&devpassword=${screenScraperDevPass}&softname=${softName}&ssid=${screenScraperUser}&sspassword=${screenScraperPass}&output=json`;

        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.response && data.response.user) {
                    return { success: true, message: `Connected as ${data.response.user.id}` };
                }
            }
            return { success: false, message: `Failed: ${response.statusText}` };
        } catch (e: any) {
            return { success: false, message: `Error: ${e.message}` };
        }
    }
}
