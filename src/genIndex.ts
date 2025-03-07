import { join } from "@std/path";

const dataDir = join(Deno.cwd(), ".data");
const savePath = join(dataDir, "index.html");

let versionInfo = { version: "未知", crawledAt: new Date().toISOString() };
try {
  const versionPath = join(dataDir, "version.json");
  const versionContent = Deno.readTextFileSync(versionPath);
  versionInfo = JSON.parse(versionContent);
} catch (error) {
  console.error("读取版本信息失败:", error);
}

let formattedDate = "未知";
try {
  if (versionInfo.crawledAt) {
    const date = new Date(versionInfo.crawledAt);
    formattedDate = date.toISOString().split('T')[0];
  }
} catch (error) {
  console.error("处理日期失败:", error);
  formattedDate = new Date().toISOString().split('T')[0];
}

// 获取可用的语言
const languages: string[] = [];
for await (const entry of Deno.readDir(dataDir)) {
  if (entry.isDirectory) {
    languages.push(entry.name);
  }
}

// 获取资产类型
const assetTypes: string[] = [];
for await (const entry of Deno.readDir(join(dataDir, languages[0]))) {
  if (entry.isDirectory) {
    assetTypes.push(entry.name);
  }
}

// 生成资产类型描述
const assetDescriptions: Record<string, string> = {
  champion: "英雄/角色相关的数据，包括属性、技能和背景故事",
  skin: "皮肤相关数据，包括皮肤名称、价格和描述",
  skinline: "皮肤系列相关数据，包括主题和关联皮肤",
  universe: "宇宙观设定相关数据，包括地区和角色故事"
};

// 语言名称映射
const languageNames: Record<string, string> = {
  "default": "默认",
  "zh_cn": "简体中文",
  "zh_tw": "繁体中文",
  "ja_jp": "日语",
  "ko_kr": "韩语"
};

const template = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CDragon Assets - ${versionInfo.version}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 30px;
      margin-bottom: 30px;
    }
    h1, h2, h3 {
      color: #1a73e8;
    }
    h1 {
      border-bottom: 2px solid #eaecef;
      padding-bottom: 10px;
      margin-top: 0;
    }
    .version {
      font-size: 1rem;
      color: #666;
      font-weight: normal;
      margin-left: 10px;
    }
    .card-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .card {
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      padding: 16px;
      transition: all 0.3s ease;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
    .card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 8px;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
    }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.9em;
    }
    .endpoint {
      background-color: #f1f8ff;
      border-left: 4px solid #1a73e8;
      padding: 12px;
      margin: 12px 0;
      border-radius: 0 4px 4px 0;
    }
    .language-label {
      display: inline-block;
      background-color: #e1e4e8;
      border-radius: 4px;
      padding: 2px 8px;
      margin-right: 8px;
      margin-bottom: 8px;
      font-size: 0.85em;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e1e4e8;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f6f8fa;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>CDragon Assets <span class="version">v${versionInfo.version}</span></h1>
    <p>这是一个数据收集项目，主要功能是定期抓取communitydragon.org的最新数据，如PBE服务器的Champion、Skin等相关数据。经过数据清洗、分类后归档。</p>
    
    <h2>可用语言</h2>
    <div>
      ${languages.map(lang => `<span class="language-label">${languageNames[lang] || lang} (${lang})</span>`).join('')}
    </div>

    <h2>资产类型</h2>
    <div class="card-container">
      ${assetTypes.map(type => `
      <div class="card">
        <h3>${type}</h3>
        <p>${assetDescriptions[type] || `${type}相关的游戏资源数据`}</p>
      </div>
      `).join('')}
    </div>
  </div>

  <div class="container">
    <h2>API 端点</h2>
    <p>以下是可用的API端点，您可以通过这些端点获取相关数据：</p>
    
    <div class="endpoint">
      <strong>获取版本信息</strong>
      <pre><code>GET /version.json</code></pre>
    </div>

    <div class="endpoint">
      <strong>获取特定语言的英雄列表</strong>
      <pre><code>GET /:language/champion/index.json</code></pre>
    </div>

    <div class="endpoint">
      <strong>获取特定语言的英雄详情</strong>
      <pre><code>GET /:language/champion/:championId.json</code></pre>
    </div>

    <div class="endpoint">
      <strong>获取特定语言的皮肤列表</strong>
      <pre><code>GET /:language/skin/index.json</code></pre>
    </div>

    <div class="endpoint">
      <strong>获取特定语言的皮肤详情</strong>
      <pre><code>GET /:language/skin/:skinId.json</code></pre>
    </div>

    <div class="endpoint">
      <strong>获取特定语言的皮肤系列列表</strong>
      <pre><code>GET /:language/skinline/index.json</code></pre>
    </div>

    <div class="endpoint">
      <strong>获取特定语言的宇宙内容</strong>
      <pre><code>GET /:language/universe/index.json</code></pre>
    </div>

    <h3>使用示例</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>用途</th>
            <th>URL示例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>获取简体中文英雄列表</td>
            <td><code>/zh_cn/champion/index.json</code></td>
          </tr>
          <tr>
            <td>获取默认语言版本特定英雄详情</td>
            <td><code>/default/champion/266.json</code></td>
          </tr>
          <tr>
            <td>获取韩文皮肤列表</td>
            <td><code>/ko_kr/skin/index.json</code></td>
          </tr>
          <tr>
            <td>获取日文特定皮肤系列</td>
            <td><code>/ja_jp/skinline/19.json</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="container">
    <h2>数据更新周期</h2>
    <p>数据会定期从communitydragon.org获取更新，通常在游戏版本更新后的24小时内完成。</p>
    <p>最后更新时间: ${formattedDate}</p>
  </div>

  <footer style="text-align: center; margin-top: 50px; color: #666; font-size: 0.9em;">
    <p>© ${new Date().getFullYear()} CDragon Assets. 数据来源于communitydragon.org</p>
  </footer>
</body>
</html>
`;

const finalHtml = template;

Deno.writeTextFileSync(savePath, finalHtml);
console.log(`索引页面已生成: ${savePath}`);