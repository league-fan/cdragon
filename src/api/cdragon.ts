
import { CDRAGON_URL, Language, ResourceJsonPath } from "../constants.ts";
import { ResourceTypeOf } from "../types/index.ts";
import { createFetch } from "./fetchClient.ts";

export interface ApiConfig {
    patch: string;
    language: Language;
    fallbackLanguage: Language;
}

export class CdragonApi {
    config: ApiConfig;
    private $fetch: ReturnType<typeof createFetch>;

    constructor(config: ApiConfig) {
        this.config = config;
        this.$fetch = createFetch(CDRAGON_URL);
    }

    /**
     * 获取基础API URL
     */
    getBaseUrl(): string {
        return `${CDRAGON_URL}/${this.config.patch}`;
    }

    /**
     * 获取资源API URL列表（主语言和备用语言）
     */
    getAssetUrls(path: ResourceJsonPath): [string, string] {
        return [
            `${this.getBaseUrl()}/plugins/rcp-be-lol-game-data/global/${this.config.language}/${path}`,
            `${this.getBaseUrl()}/plugins/rcp-be-lol-game-data/global/${this.config.fallbackLanguage}/${path}`,
        ];
    }

    /**
     * 获取数据，如果主语言失败则使用备用语言
     *
     * @param path - 资源路径. 例如v1/champion.json
     */
    async fetchAsset<P extends ResourceJsonPath>(
        path: P,
    ): Promise<ResourceTypeOf<P>> {
        const [url, fallbackUrl] = this.getAssetUrls(path);

        const { data, error } = await this.$fetch<ResourceTypeOf<P>>(url);
        if (error) {
            const { data, error } = await this.$fetch<ResourceTypeOf<P>>(fallbackUrl);
            if (error) {
                throw error;
            }
            return data;
        }
        return data;
    }

    /**
     * 获取基础数据
     *
     * @param path - 资源路径. 例如content-metadata.json
     */
    async fetchBase<T>(path: string): Promise<T> {
        const url = `${this.getBaseUrl()}/${path}`;
        const { data, error } = await this.$fetch<T>(url);
        if (error) {
            throw error;
        }
        return data;
    }

    /**
     * 更新API配置
     */
    updateConfig(config: Partial<ApiConfig>): void {
        this.config = { ...this.config, ...config };
    }
}
