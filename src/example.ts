import { CdragonApi } from "./api.ts";

// 创建 API 实例
const api = new CdragonApi({
    patch: 'latest',
    language: 'zh_cn',
    fallbackLanguage: 'default'
});

async function fetchChampions() {
    // 使用类型推导系统，champions 会被自动推导为 Champion[] 类型
    const champions = await api.fetchData('v1/champion-summary.json');
    
    // TypeScript 能够识别 champions 的类型，因此可以安全地访问属性
    console.log(`获取到 ${champions.length} 个英雄`);
    
    // 可以使用 champions 的属性，并且有类型提示和检查
    champions.forEach(champion => {
        console.log(`英雄名称: ${champion.name}, 代号: ${champion.alias}, 角色: ${champion.roles.join(', ')}`);
    });
}

async function fetchSkins() {
    // skins 被自动推导为 Skin[] 类型
    const skins = await api.fetchData('v1/skins.json');
    
    console.log(`获取到 ${Object.keys(skins).length} 个皮肤`);
    
    // 使用皮肤数据
    const firstSkin = skins[0];
    if (firstSkin) {
        console.log(`皮肤名称: ${firstSkin.name}`);
    }
}

// 执行示例
async function runExample() {
    try {
        await fetchChampions();
        await fetchSkins();
    } catch (error) {
        console.error('获取数据时出错:', error);
    }
}

// 运行示例
runExample(); 