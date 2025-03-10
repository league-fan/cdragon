import { ApiConfig, CdragonApi } from "./api/cdragon.ts";
import { join } from "@std/path";
import {
  ERROR,
  INFO,
  readDataFromFile,
  saveDataToFile,
  skinAbsIdToSkinId,
  skinIdToChampionId,
  SUCCESS,
} from "./helpers.ts";
import { Skin } from "./types/skins.ts";
import { Skinline } from "./types/skinline.ts";
import { Language, Patch } from "./constants.ts";
import { concurrentLimit } from "./helpers.ts";
import { getWikiSkinData } from "./wiki/index.ts";
import { WikiSkin, WikiSkinData } from "./wiki/types.ts";

const SAVE_DIR = ".data";

const skinsResolvedMap = (skins: Skin[], wikiSkins: WikiSkin[]) => {
  return skins.map((skin) => ({
    id: skin.id,
    name: skin.name,
    rarity: skin.rarity,
    isBase: skin.isBase,
    wikiSkinData: wikiSkins.find((info) => info.id === skin.id),
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
  api: CdragonApi;
  saveDir: string;

  constructor(config: ApiConfig, saveDir: string) {
    this.api = new CdragonApi(config);
    this.saveDir = join(Deno.cwd(), `./${saveDir}`);
  }

  updateConfig(config: Partial<ApiConfig>) {
    this.api.config = { ...this.api.config, ...config };
  }

  async checkIfNeedCrawling(forceCrawl: boolean = false) {
    const originalVersion = await readDataFromFile<{
      version: string;
      crawledAt: Date;
    }>("version.json", this.saveDir);

    const version = await this.api.fetchBase<{
      version: string;
    }>("content-metadata.json");

    INFO(
      `Version Changed: ${originalVersion?.version} -> ${version.version}`,
    );

    if (originalVersion?.version === version.version && !forceCrawl) {
      return false;
    } else {
      await saveDataToFile(
        {
          version: version.version,
          crawledAt: new Date().toISOString(),
        },
        "version.json",
        this.saveDir,
      );
      return true;
    }
  }

  async crawling(wikiSkinData?: WikiSkinData) {
    const wikiSkins = Object.values(wikiSkinData || {}).flatMap((champion) =>
      Object.values(champion.skins).map((skin) => ({
        ...skin,
        id: skinAbsIdToSkinId(skin.id, champion.id),
      }))
    );

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

    // 并行处理不同类型的数据，但保持各类型处理的依赖顺序
    await Promise.all([
      // 1. Champions相关数据处理
      (async () => {
        // Champion详细数据
        await concurrentLimit(champions, async (champion) => {
          const skinsOfChampion = skins.filter((skin) =>
            skinIdToChampionId(skin.id) === champion.id
          ).sort((a, b) => a.id - b.id);
          const skinsResolved = skinsResolvedMap(skinsOfChampion, wikiSkins);
          await saveDataToFile(
            {
              ...champion,
              skins: skinsResolved,
            },
            `champion/${champion.alias}.json`,
            this.saveDir,
          );
        });

        // Champion汇总数据
        await saveDataToFile(
          {
            total: champions.length,
            champions: champions.map((champion) => ({
              id: champion.id,
              name: champion.name,
              alias: champion.alias,
            })),
          },
          "champion.json",
          this.saveDir,
        );
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
          await saveDataToFile(
            {
              ...universe,
              skinlines: skinlinesResolved,
            },
            `universe/${universe.id}.json`,
            this.saveDir,
          );
        });

        // Universe汇总数据
        await saveDataToFile(
          {
            total: universes.length,
            universes: universes.map((universe) => ({
              id: universe.id,
              name: universe.name,
            })),
          },
          "universe.json",
          this.saveDir,
        );
      })(),

      // 3. Skinline相关数据处理
      (async () => {
        // Skinline详细数据
        await concurrentLimit(skinlines, async (skinline) => {
          const skinsOfSkinline = skins.filter((skin) =>
            skin.skinLines?.map((id) => id.id).includes(skinline.id)
          ).sort((a, b) => a.id - b.id);
          const skinsResolved = skinsResolvedMap(skinsOfSkinline, wikiSkins);
          await saveDataToFile(
            {
              ...skinline,
              skins: skinsResolved,
            },
            `skinline/${skinline.id}.json`,
            this.saveDir,
          );
        });

        // Skinline汇总数据
        await saveDataToFile(
          {
            total: skinlines.length,
            skinlines: skinlines.map((skinline) => ({
              id: skinline.id,
              name: skinline.name,
            })),
          },
          "skinline.json",
          this.saveDir,
        );
      })(),

      // 4. Skin相关数据处理
      (async () => {
        // Skin详细数据
        await concurrentLimit(skins, async (skin) => {
          await saveDataToFile(
            {
              ...skin,
              ...skinsResolvedMap([skin], wikiSkins)[0],
            },
            `skin/${skin.id}.json`,
            this.saveDir,
          );
        });

        // Skin汇总数据
        await saveDataToFile(
          {
            total: skins.length,
            skins: skinsResolvedMap(skins, wikiSkins),
          },
          "skin.json",
          this.saveDir,
        );
      })(),
    ]);
  }
}

export async function crawl(
  forceCrawl: boolean = false,
  desiredLanguages: Language[] = [
    "zh_cn",
    "default",
    "zh_tw",
    "ja_jp",
    "ko_kr",
  ],
  patch: Patch = "pbe",
) {
  const defaultCrawler = new Crawler({
    language: "default",
    patch: "pbe",
    fallbackLanguage: "default",
  }, SAVE_DIR);

  const needCrawling = await defaultCrawler.checkIfNeedCrawling(forceCrawl);
  if (!needCrawling) {
    INFO("No Need to Crawl");
    return "No Need to Crawl";
  }

  // 获取SkinInfo
  const wikiSkinData = await getWikiSkinData();
  await saveDataToFile(wikiSkinData, "wiki-skin-data.json", SAVE_DIR);

  INFO(`Start Crawling ${desiredLanguages.length} Languages`);
  const timeStart = Date.now();

  // 并行抓取多种语言的数据
  await Promise.all(desiredLanguages.map(async (language) => {
    const crawler = new Crawler({
      language,
      patch,
      fallbackLanguage: "default",
    }, `${SAVE_DIR}/${language}`);

    INFO(`Crawling ${language}`);
    const langTimeStart = Date.now();
    await crawler.crawling(wikiSkinData);
    const langTimeEnd = Date.now();
    SUCCESS(
      `Finished ${language}, cost ${langTimeEnd - langTimeStart}ms`,
    );
  }));

  const timeEnd = Date.now();
  INFO(`All Languages Finished, Cost ${timeEnd - timeStart}ms`);
  return "All Crawling Tasks Finished";
}

// 测试运行函数
if (import.meta.main) {
  const forceCrawl = Deno.args.includes("--force");
  crawl(forceCrawl).then(() => {
    INFO("All Crawling Tasks Finished");
  }).catch(ERROR);
}
