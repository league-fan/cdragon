import * as cheerio from "https://esm.sh/cheerio@1.0.0";
import { wikiChampionUrl } from "../helpers.ts";
import { createFetch     } from "./fetchClient.ts";
import { LOL_WIKI_URL } from "../constants.ts";

// 定义皮肤信息的接口
export interface SkinInfo {
    id: number;
    releaseDate?: Date;
    price?: string;
}

export async function getChampionSkins(championAlias: string): Promise<SkinInfo[]> {
    const fetch = createFetch(LOL_WIKI_URL);
    const url = wikiChampionUrl(championAlias);

    const { data, error } = await fetch<string>(url);
    if (error) {
        throw error;
    }

    const $ = cheerio.load(data);
    const skins: SkinInfo[] = [];
    const $skins = $("body > div > div:nth-child(4)").contents();
    for (const element of $skins) {
        const modelLink = $(element).find("a.external.text").attr("href") || "";
        const idMatch = modelLink.match(/id=(\d+)/);
        const id = idMatch ? parseInt(idMatch[1]) : 0;

        const priceAndDateDiv = $(element).find("div > div").filter(function () {
            return $(this).css("float") === "right";
        });
        const priceAndDateText = priceAndDateDiv.text().trim();

        const priceMatch = priceAndDateText.match(/(\d+)/);
        const price = priceMatch ? priceMatch[1] : undefined;

        const dateMatch = priceAndDateText.match(/(\d{1,2}-[A-Za-z]{3}-\d{4})/);
        const releaseDate = dateMatch ? new Date(dateMatch[1]) : undefined;

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
    const championAlias = Deno.args[0] || "Nunu";
    const skins = await getChampionSkins(championAlias);
    console.log(JSON.stringify(skins, null, 2));
}
