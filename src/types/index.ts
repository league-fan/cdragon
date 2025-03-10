import { ResourceJsonPath } from "../constants.ts";
import { Champion } from "./champion.ts";
import { Item } from "./item.ts";
import { Skinline } from "./skinline.ts";
import { Skins } from "./skins.ts";
import { SummonerEmote } from "./summoner-emote.ts";
import { SummonerIconSet } from "./summoner-icon-set.ts";
import { SummonerIcon } from "./summoner-icon.ts";
import { TftChampion } from "./tftchampion.ts";
import { TftItem } from "./tftitem.ts";
import { TftMapSkin } from "./tftmapskin.ts";
import { Universe } from "./universe.ts";
import { WardSkin } from "./wardskin.ts";
import { WardSkinSet } from "./ward-skin-set.ts";

/**
 * 资源路径与其对应类型的映射
 */
export interface ResourceTypeMap {
  "v1/champion-summary.json": Champion[];
  "v1/universes.json": Universe[];
  "v1/skinlines.json": Skinline[];
  "v1/skins.json": Skins;
  "v1/items.json": Item[];
  "v1/tftitems.json": TftItem[];
  "v1/summoner-emotes.json": SummonerEmote[];
  "v1/summoner-icons.json": SummonerIcon[];
  "v1/summoner-icon-sets.json": SummonerIconSet[];
  "v1/tftchampions.json": TftChampion[];
  "v1/tftmapskins.json": TftMapSkin[];
  "v1/ward-skins.json": WardSkin[];
  "v1/ward-skin-sets.json": WardSkinSet[];
}

/**
 * 获取对应资源路径的类型
 * 类型帮助函数，用于在类型系统中获取对应路径的类型
 */
export type ResourceTypeOf<P extends ResourceJsonPath> = ResourceTypeMap[P];

export type {
  Champion,
  Item,
  Skinline,
  Skins,
  SummonerEmote,
  SummonerIcon,
  SummonerIconSet,
  TftChampion,
  TftItem,
  TftMapSkin,
  Universe,
  WardSkin,
  WardSkinSet,
};
