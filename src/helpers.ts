import { ensureDir } from "@std/fs";
import { dirname, join } from "@std/path";
import { CDRAGON_URL, Language, LOL_WIKI_URL, Patch } from "./constants.ts";

export function skinIdToChampionId(skinId: number) {
  return Math.floor(skinId / 1000);
}

export function skinAbsIdToSkinId(skinAbsId: number, championId: number) {
  return championId * 1000 + (skinAbsId % 1000);
}

export function assetsRealUrl(
  originalUrl: string,
  patch?: Patch,
  language?: Language,
) {
  return originalUrl
    .replace(
      "/lol-game-data/assets",
      `${CDRAGON_URL}/${patch ?? "pbe"}/plugins/rcp-be-lol-game-data/global/${
        language ?? "default"
      }`,
    )
    .toLowerCase();
}

export function wikiChampionUrl(championAlias: string) {
  return `${LOL_WIKI_URL}/${championAlias}/Cosmetics?action=render`;
}

export const concurrentLimit = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 10,
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

const dirCache: Set<string> = new Set();

export async function saveDataToFile(
  data: any,
  filename: string,
  saveDir: string,
) {
  const filePath = join(saveDir, filename);
  const dir = dirname(filePath);

  if (!dirCache.has(dir)) {
    await ensureDir(dir);
    dirCache.add(dir);
  }
  await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2));
}

export async function readDataFromFile<T>(
  filename: string,
  saveDir: string,
): Promise<T | null> {
  const filePath = join(saveDir, filename);
  try {
    return JSON.parse(await Deno.readTextFile(filePath));
  } catch (_error) {
    return null;
  }
}
