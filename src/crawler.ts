import { ApiConfig, CdragonApi } from "./api/cdragon.ts";
import { ensureDir } from "@std/fs";
import { dirname, join } from "@std/path";
import { skinIdToChampionId } from "./helpers.ts";
import { Skin } from "./types/skins.ts";
import { Skinline } from "./types/skinline.ts";
import { Language } from "./constants.ts";
import { getChampionSkins, SkinInfo } from "./api/wiki.ts";

const SAVE_DIR = ".data";

const skinsResolvedMap = (skins: Skin[]) => {
    return skins.map((skin) => ({
        id: skin.id,
        name: skin.name,
        rarity: skin.rarity,
        isBase: skin.isBase,
    }));
};

const skinlinesResolvedMap = (skinlines: Skinline[]) => {
    return skinlines.map((skinline) => ({
        id: skinline.id,
        name: skinline.name,
        description: skinline.description,
    }));
};

class Crawler {
    private api: CdragonApi;
    private saveDir: string;
    private dirCache: Set<string> = new Set();

    constructor(config: ApiConfig, saveDir: string) {
        this.api = new CdragonApi(config);
        this.saveDir = join(Deno.cwd(), `./${saveDir}`);
    }

    async saveDataToFile(data: any, filename: string) {
        const filePath = join(this.saveDir, filename);
        const dir = dirname(filePath);

        if (!this.dirCache.has(dir)) {
            await ensureDir(dir);
            this.dirCache.add(dir);
        }
        await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2));
    }

    async readDataFromFile<T>(filename: string): Promise<T | null> {
        const filePath = join(this.saveDir, filename);
        try {
            return JSON.parse(await Deno.readTextFile(filePath));
        } catch (_error) {
            return null;
        }
    }

    updateConfig(config: Partial<ApiConfig>) {
        this.api.config = { ...this.api.config, ...config };
    }

    async checkIfNeedCrawling() {
        const originalVersion = await this.readDataFromFile<{
            version: string;
            crawledAt: Date;
        }>("version.json");

        const version = await this.api.fetchBase<{
            version: string;
        }>("content-metadata.json");

        console.log(`originalVersion: ${originalVersion?.version}, version: ${version.version}`);

        if (originalVersion?.version === version.version) {
            return false;
        } else {
            await this.saveDataToFile({
                version: version.version,
                crawledAt: new Date().toISOString(),
            }, "version.json");
            return true;
        }
    }

    async crawling() {
        // 并行获取基础数据
        const [champions, skinsObj, universesRaw, skinlines] = await Promise.all([
            this.api.fetchAsset("v1/champion-summary.json"),
            this.api.fetchAsset("v1/skins.json"),
            this.api.fetchAsset("v1/universes.json"),
            this.api.fetchAsset("v1/skinlines.json"),
        ]);

        // 数据预处理
        const universes = universesRaw.filter(
            (universe) => universe.skinSets !== undefined,
        );
        const skins = Object.values(skinsObj).sort((a, b) => a.id - b.id);

        // 创建一个并发控制函数，限制并发数
        const concurrentLimit = async <T, R>(
            items: T[],
            fn: (item: T) => Promise<R>,
            concurrency: number = 10
        ): Promise<R[]> => {
            const results: R[] = [];
            const executing: Promise<void>[] = [];

            for (const item of items) {
                const p = Promise.resolve().then(() => fn(item));
                results.push(p as unknown as R);

                if (concurrency <= items.length) {
                    const e: Promise<void> = p.then(() => {
                        executing.splice(executing.indexOf(e), 1);
                    });
                    executing.push(e);
                    if (executing.length >= concurrency) {
                        await Promise.race(executing);
                    }
                }
            }
            await Promise.all(executing);
            return Promise.all(results);
        };

        // 并行处理不同类型的数据，但保持各类型处理的依赖顺序
        await Promise.all([
            // 1. Champions相关数据处理
            (async () => {
                // Champion详细数据
                await concurrentLimit(champions, async (champion) => {
                    const skinsOfChampion = skins.filter((skin) =>
                        skinIdToChampionId(skin.id) === champion.id
                    ).sort((a, b) => a.id - b.id);
                    const skinsResolved = skinsResolvedMap(skinsOfChampion);
                    await this.saveDataToFile({
                        ...champion,
                        skins: skinsResolved,
                    }, `champion/${champion.alias}.json`);
                });

                // Champion汇总数据
                await this.saveDataToFile({
                    champions: champions.map((champion) => ({
                        id: champion.id,
                        name: champion.name,
                        alias: champion.alias,
                    })),
                }, "champion/index.json");
            })(),

            // 2. Universe相关数据处理
            (async () => {
                // Universe详细数据
                await concurrentLimit(universes, async (universe) => {
                    const skinlinesOfUniverse = universe.skinSets
                        .map((id) => skinlines.find((skinline) => skinline.id === id))
                        .filter((skinline) => skinline !== undefined)
                        .sort((a, b) => (a.name > b.name ? 1 : -1));
                    const skinlinesResolved = skinlinesResolvedMap(skinlinesOfUniverse);
                    await this.saveDataToFile({
                        ...universe,
                        skinlines: skinlinesResolved,
                    }, `universe/${universe.id}.json`);
                });

                // Universe汇总数据
                await this.saveDataToFile({
                    total: universes.length,
                    universes: universes.map((universe) => ({
                        id: universe.id,
                        name: universe.name,
                    })),
                }, "universe/index.json");
            })(),

            // 3. Skinline相关数据处理
            (async () => {
                // Skinline详细数据
                await concurrentLimit(skinlines, async (skinline) => {
                    const skinsOfSkinline = skins.filter((skin) =>
                        skin.skinLines?.map((id) => id.id).includes(skinline.id)
                    ).sort((a, b) => a.id - b.id);
                    const skinsResolved = skinsResolvedMap(skinsOfSkinline);
                    await this.saveDataToFile({
                        ...skinline,
                        skins: skinsResolved,
                    }, `skinline/${skinline.id}.json`);
                });

                // Skinline汇总数据
                await this.saveDataToFile({
                    total: skinlines.length,
                    skinlines: skinlines.map((skinline) => ({
                        id: skinline.id,
                        name: skinline.name,
                    })),
                }, "skinline/index.json");
            })(),

            // 4. Skin相关数据处理
            (async () => {
                // Skin详细数据
                await concurrentLimit(skins, async (skin) => {
                    await this.saveDataToFile(skin, `skin/${skin.id}.json`);
                });

                // Skin汇总数据
                await this.saveDataToFile({
                    total: skins.length,
                    skins: skinsResolvedMap(skins),
                }, "skin/index.json");
            })()
        ]);
    }
}

async function main() {
    const desiredLanguages = [
        "zh_cn",
        "default",
        "zh_tw",
        "ja_jp",
        "ko_kr",
    ] as Language[];

    const defaultCrawler = new Crawler({
        language: "default",
        patch: "pbe",
        fallbackLanguage: "default",
    }, SAVE_DIR);

    const needCrawling = await defaultCrawler.checkIfNeedCrawling();
    if (!needCrawling) {
        console.log("no need to crawl");
        return;
    }

    console.log(`start crawling ${desiredLanguages.length} languages`);
    const timeStart = Date.now();

    // 并行抓取多种语言的数据
    await Promise.all(desiredLanguages.map(async (language) => {
        const crawler = new Crawler({
            language,
            patch: "pbe",
            fallbackLanguage: "default",
        }, `${SAVE_DIR}/${language}`);

        console.log(`${language} start crawling`);
        const langTimeStart = Date.now();
        await crawler.crawling();
        const langTimeEnd = Date.now();
        console.log(`${language} crawling finished, cost ${langTimeEnd - langTimeStart}ms`);
    }));

    const timeEnd = Date.now();
    console.log(`all languages crawling finished, cost ${timeEnd - timeStart}ms`);
}

main().then(() => {
    console.log("all crawling tasks finished");
}).catch(console.error);
