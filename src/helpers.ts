import { CDRAGON_URL, Language, LOL_WIKI_URL, Patch } from "./constants.ts";

export function skinIdToChampionId(skinId: number) {
  return Math.floor(skinId / 1000);
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
