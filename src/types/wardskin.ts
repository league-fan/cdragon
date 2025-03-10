import { RarityElement, RegionalDescription } from "./common.ts";

export interface WardSkin {
  id: number;
  name: string;
  description: string;
  wardImagePath: string;
  wardShadowImagePath: string;
  contentId: string;
  isLegacy: boolean;
  regionalDescriptions: RegionalDescription[];
  rarities: RarityElement[];
}
