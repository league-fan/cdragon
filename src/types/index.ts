import { ResourceJsonPath } from '../constants.ts';
import { Champion } from './champion.ts';
import { Skinline } from './skinline.ts';
import { Skins } from './skins.ts';
import { Universe } from './universe.ts';

/**
 * 资源路径与其对应类型的映射
 */
export interface ResourceTypeMap {
    'v1/champion-summary.json': Champion[];
    'v1/universes.json': Universe[];
    'v1/skinlines.json': Skinline[];
    'v1/skins.json': Skins;
    // 其他资源类型可以根据实际需求添加
    'v1/summoner-emotes.json': any;
    'v1/summoner-icons.json': any;
    'v1/summoner-icon-sets.json': any;
    'v1/tftchampions.json': any;
    'v1/tftmapskins.json': any;
    'v1/ward-skins.json': any;
    'v1/ward-skin-sets.json': any;
}

/**
 * 获取对应资源路径的类型
 * 类型帮助函数，用于在类型系统中获取对应路径的类型
 */
export type ResourceTypeOf<P extends ResourceJsonPath> = ResourceTypeMap[P];

export function skinIdToChampionId(skinId: number) {
    return Math.floor(skinId / 1000)
}