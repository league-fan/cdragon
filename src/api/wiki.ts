import * as cheerio from "https://esm.sh/cheerio@1.0.0";
import { wikiChampionUrl } from "../helpers.ts";
import { createFetch } from "./fetchClient.ts";
import { LOL_WIKI_URL } from "../constants.ts";

// 定义皮肤信息的接口
export interface SkinInfo {
  id: number;
  releaseDate?: Date;
  price?: string;
}

const championAliasToWiki = (championName: string) => {
  return championName.replace(/ /g, "_");
};

export async function getChampionSkins(
  championName: string,
): Promise<SkinInfo[]> {
  const fetch = createFetch(LOL_WIKI_URL);
  championName = championAliasToWiki(championName);

  const url = wikiChampionUrl(championName);

  const { data, error } = await fetch<string>(url);
  if (error) {
    throw error;
  }

  const $ = cheerio.load(data);
  const skins: SkinInfo[] = [];
  const $skins = $("div.skin-icon").parent();
  for (const element of $skins) {
    const modelLink = $(element).find("a.external.text").attr("href") || "";
    const idMatch = modelLink.match(/id=(\d+)/);
    const id = idMatch ? parseInt(idMatch[1]) : 0;

    const priceAndDateDiv = $(element).find("div > div").filter(function () {
      return $(this).css("float") === "right";
    });
    const priceAndDateText = priceAndDateDiv.text().trim();
    const [price, date] = priceAndDateText.split(" / ");
    const releaseDate = date ? new Date(date) : undefined;
    skins.push({
      id,
      releaseDate,
      price,
    });
  }

  return skins;
}

// 测试运行函数
if (import.meta.main) {
  const championName = Deno.args[0] || "Kog'Maw";
  const skins = await getChampionSkins(championName);
  console.log(JSON.stringify(skins, null, 2));
}
