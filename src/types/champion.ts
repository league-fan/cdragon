export interface Champion {
  id: number;
  name: string;
  alias: string;
  squarePortraitPath: string;
  roles: ChampionRole[];
  key: string;
}

export enum ChampionRole {
  Assassin = "assassin",
  Fighter = "fighter",
  Mage = "mage",
  Marksman = "marksman",
  Support = "support",
  Tank = "tank",
}
