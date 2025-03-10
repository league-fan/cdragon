import { ERROR, SUCCESS } from "./helpers.ts";
import { crawl } from "./crawler.ts";
import { genIndex } from "./indexPage/genIndex.ts";
import { generateOpenApiDoc } from "./indexPage/genApi.ts";
import { Language } from "./constants.ts";

const forceCrawl = Deno.args.includes("--force");
const desiredLanguages = [
  "zh_cn",
  "default",
  "zh_tw",
  "ja_jp",
  "ko_kr",
] as Language[];

try {
  const ret = await crawl(forceCrawl, desiredLanguages);
  if (ret === "No Need to Crawl") {
    Deno.exit(0);
  } else if (ret === "All Crawling Tasks Finished") {
    await genIndex();
    await generateOpenApiDoc();
    SUCCESS("All Tasks Finished");
    Deno.exit(0);
  } else {
    ERROR(ret);
    Deno.exit(1);
  }
} catch (error) {
  ERROR(error);
  Deno.exit(1);
}
