import { RarityElement, RegionalDescription } from "./common.ts";

export interface Skins {
  [key: string]: Skin;
}

export interface Skin {
  id: number;
  isBase: boolean;
  name: string;
  splashPath: string;
  uncenteredSplashPath: string;
  tilePath: string;
  loadScreenPath: string;
  skinType: SkinType;
  rarity: RarityType;
  isLegacy: boolean;
  splashVideoPath: null | string;
  collectionSplashVideoPath: null | string;
  collectionCardHoverVideoPath: null | string;
  featuresText: null | string;
  chromaPath?: null | string;
  emblems: Emblem[] | null;
  regionRarityId: number;
  rarityGemPath: string | null;
  skinLines: SkinlineId[] | null;
  description: null | string;
  loadScreenVintagePath?: string;
  chromas?: Chroma[];
  skinAugments?: SkinAugments;
  questSkinInfo?: QuestSkinInfo;
}

export interface Emblem {
  name: string;
  emblemPath: {
    large: string;
    small: string;
  };
  positions: object;
}

export interface Chroma {
  id: number;
  name: string;
  chromaPath: string;
  colors: string[];
  descriptions: RegionalDescription[];
  rarities: RarityElement[];
  skinAugments?: SkinAugments;
}

export interface SkinAugments {
  borders: Borders;
  augments?: Augment[];
}

export interface Augment {
  contentId: string;
  overlays: Overlay[];
}

export interface Overlay {
  centeredLCOverlayPath: string;
  uncenteredLCOverlayPath: string;
  socialCardLCOverlayPath: string;
  tileLCOverlayPath: string;
}

export interface Borders {
  layer0: Layer[];
  layer1?: Layer[];
}

export interface Layer {
  contentId: string;
  layer: number;
  priority: number;
  borderPath: string;
}

export interface QuestSkinInfo {
  name: string;
  productType: string;
  collectionDescription: string;
  descriptionInfo: DescriptionInfo[];
  splashPath: string;
  uncenteredSplashPath: string;
  tilePath: string;
  collectionCardPath: string;
  tiers: Tier[];
}

export interface DescriptionInfo {
  title: string;
  description: string;
  iconPath: string;
}

export interface Tier {
  id: number;
  name: string;
  stage: number;
  description: string;
  splashPath: string;
  uncenteredSplashPath: string;
  tilePath: string;
  loadScreenPath: string;
  shortName: string;
  splashVideoPath: null | string;
  collectionSplashVideoPath: null | string;
  collectionCardHoverVideoPath: null | string;
  skinAugments?: SkinAugments;
  loadScreenVintagePath?: string;
}

export enum RarityType {
  KEpic = "kEpic",
  KLegendary = "kLegendary",
  KMythic = "kMythic",
  KNoRarity = "kNoRarity",
  KRare = "kRare",
  KTranscendent = "kTranscendent",
  KUltimate = "kUltimate",
}

export interface SkinlineId {
  id: number;
}

export enum SkinType {
  Empty = "",
  Ultimate = "Ultimate",
}
