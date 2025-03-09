import * as cheerio from "cheerio";
import { createFetch } from "../api/fetchClient.ts";
import { LOL_WIKI_URL } from "../constants.ts";
import { WikiSkinData } from "./types.ts";

const skinDataUrl = `${LOL_WIKI_URL}/Module:SkinData/data?action=render`;

function parseLuaTable(luaCode: string): WikiSkinData {
  const cleanedLuaCode = luaCode
    .replace(/^-- <pre>\s*return\s*/, "")
    .replace(/\s*-- <\/pre>$/, "");

  // 先处理nil值和注释
  let jsCode = cleanedLuaCode
    .replace(/\bnil\b/g, "null")
    .replace(/--[^\n]*\n/g, "\n")
    // 移除Lua文件末尾的标记
    .replace(/-- \[\[Category:Lua\]\]/g, "");

  // 基本语法转换
  jsCode = jsCode
    .replace(/\["([^"]+)"\]\s*=/g, '"$1":')
    .replace(/\btrue\b/g, "true")
    .replace(/\bfalse\b/g, "false");

  // 处理set字段
  jsCode = jsCode.replace(/"set"\s*:\s*{([^{}]*)}/g, (_match, content) => {
    return `"set": [${content}]`;
  });

  // 处理其他花括号表示的数组
  jsCode = jsCode.replace(/{([^{}]*)}/g, (match, content) => {
    if (content.includes('"') && !content.includes(":")) {
      return `[${content}]`;
    }
    return match;
  });

  // 处理尾随逗号
  jsCode = jsCode.replace(/,(\s*[}\]])/g, "$1");

  // 处理未闭合的字符串
  jsCode = jsCode.replace(/("lore"\s*:\s*"[^"]*?)(?=\n\s*[}\]])/g, '$1"');

  // 保存中间结果以便调试
  Deno.writeTextFileSync("wikiSkinData.json", jsCode);

  try {
    // 尝试解析JSON - 注意这里不再添加额外的花括号
    const result = JSON.parse(jsCode);
    return result;
  } catch (error) {
    // 如果解析失败，输出错误信息和错误位置附近的代码
    console.error("解析失败:", error);
    
    if (error instanceof SyntaxError) {
      const errorMessage = error.message;
      const match = errorMessage.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const start = Math.max(0, position - 50);
        const end = Math.min(jsCode.length, position + 50);
        console.error("错误位置附近的代码:", jsCode.substring(start, end));
      }
    }
    
    return {};
  }
}

export async function getWikiSkinData(): Promise<WikiSkinData> {
  const fetch = createFetch(skinDataUrl);
  const { data, error } = await fetch<string>(skinDataUrl);
  if (error) {
    throw error;
  }

  const $ = cheerio.load(data);
  const luaCode = $(".mw-code.mw-script").text();
  const wikiSkinData = parseLuaTable(luaCode);

  return wikiSkinData;
}

// 测试运行函数
if (import.meta.main) {
  const wikiSkinData = await getWikiSkinData();
  console.log(JSON.stringify(wikiSkinData, null, 2));
}
