export interface TftMapSkin {
  contentId: string;
  itemId: number;
  name: string;
  description: string;
  loadoutsIcon: string;
  groupId: number;
  groupName: string;
  rarity: Rarity;
  rarityValue: number;
  tftRarity: TFTRarity;
}

export enum Rarity {
  Default = "Default",
  Legendary = "Legendary",
  Mythic = "Mythic",
}

export enum TFTRarity {
  KStandard = "kStandard",
}
