import { CdragonApi, ApiConfig } from "./api.ts";
import { ensureDir } from "@std/fs";
import { join, dirname } from "@std/path";
import { skinIdToChampionId } from "./types/index.ts";
import { Skin } from "./types/skins.ts";
import { Skinline } from "./types/skinline.ts";
import { Language } from "./constants.ts";


const skinsResolvedMap = (skins: Skin[]) => {
    return skins.map(skin => ({
        id: skin.id,
        name: skin.name,
        rarity: skin.rarity,
        isBase: skin.isBase,
    }))
}

const skinlinesResolvedMap = (skinlines: Skinline[]) => {
    return skinlines.map(skinline => ({
        id: skinline.id,
        name: skinline.name,
        description: skinline.description,
    }))
}


class Crawler {
    private api: CdragonApi;
    private saveDir: string;

    constructor(config: ApiConfig, saveDir: string) {
        this.api = new CdragonApi(config);
        this.saveDir = join(Deno.cwd(), `./${saveDir}`);
    }

    async saveDataToFile(data: any, filename: string) {
        const filePath = join(this.saveDir, filename);
        await ensureDir(dirname(filePath));
        await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2));
    }

    updateConfig(config: Partial<ApiConfig>) {
        this.api.config = { ...this.api.config, ...config };
    }

    async crawlingVersion() {
        const version = await this.api.fetchBase<{
            version: string;
        }>('content-metadata.json');
        await this.saveDataToFile(version, 'version.json');
    }

    async crawling() {
        const champions = await this.api.fetchAsset('v1/champion-summary.json');
        const skinsObj = await this.api.fetchAsset('v1/skins.json');
        const universes = await this.api.fetchAsset('v1/universes.json');
        const skinlines = await this.api.fetchAsset('v1/skinlines.json');
        const skins = Object.values(skinsObj).sort((a, b) => a.id - b.id);

        // gen: champion/:alias.json
        for (const champion of champions) {
            const skinsOfChampion = skins.filter(skin => skinIdToChampionId(skin.id) === champion.id).sort((a, b) => a.id - b.id);
            const skinsResolved = skinsResolvedMap(skinsOfChampion);
            await this.saveDataToFile({
                ...champion,
                skins: skinsResolved
            }, `champion/${champion.alias}.json`);
        }

        // gen: champion/summary.json
        await this.saveDataToFile({
            champions: champions.map(champion => ({
                id: champion.id,
                name: champion.name,
                alias: champion.alias,
            })),
        }, 'champion/summary.json');

        // gen: universe/:id.json
        for (const universe of universes) {
            const skinlinesOfUniverse = universe.skinSets
                .map((id) => skinlines.find(skinline => skinline.id === id))
                .filter(skinline => skinline !== undefined)
                .sort((a, b) => (a.name > b.name ? 1 : -1));
            const skinlinesResolved = skinlinesResolvedMap(skinlinesOfUniverse);
            await this.saveDataToFile({
                ...universe,
                skinlines: skinlinesResolved
            }, `universe/${universe.id}.json`);
        }

        // gen: universe/summary.json
        await this.saveDataToFile({
            total: universes.length,
            universes: universes.map(universe => ({
                id: universe.id,
                name: universe.name,
            }))
        }, 'universe/summary.json');

        // gen: skinline/:id.json
        for (const skinline of skinlines) {
            const skinsOfSkinline = skins.filter(skin => skin.skinLines?.map(id => id.id).includes(skinline.id)).sort((a, b) => a.id - b.id);
            const skinsResolved = skinsResolvedMap(skinsOfSkinline);
            await this.saveDataToFile({
                ...skinline,
                skins: skinsResolved
            }, `skinline/${skinline.id}.json`);
        }

        // gen: skinline/summary.json
        await this.saveDataToFile({
            total: skinlines.length,
            skinlines: skinlines.map(skinline => ({
                id: skinline.id,
                name: skinline.name,
            }))
        }, 'skinline/summary.json');

        // gen: skin/:id.json
        for (const skin of skins) {
            await this.saveDataToFile(skin, `skin/${skin.id}.json`);
        }

        // gen: skin/summary.json
        await this.saveDataToFile({
            total: skins.length,
            skins: skinsResolvedMap(skins)
        }, 'skin/summary.json');
    }
}


async function main() {
    const desiredLanguages = ['zh-cn', 'default', 'zh_tw', "ja_jp", "ko_kr"] as Language[];

    for (const language of desiredLanguages) {
        const crawler = new Crawler({
            language,
            patch: 'pbe',
            fallbackLanguage: 'default'
        }, `.data/${language}`);

        console.log(`${language} crawling start`);
        const timeStart = Date.now();
        await crawler.crawling();
        const timeEnd = Date.now();
        console.log(`${language} crawling done in ${timeEnd - timeStart}ms`);
    }
}

main().then(() => {
    console.log('all crawling done');
}).catch(console.error);