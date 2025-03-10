export enum Region {
  Empty = "",
  ID = "ID",
  Ph = "PH",
  RegionTencent = "tencent",
  Riot = "riot",
  Sg = "SG",
  Tencent = "TENCENT",
  Th = "TH",
  Tw = "TW",
  Vn = "VN",
}

export interface RegionalDescription {
  region: Region;
  description: string;
}

export interface RarityElement {
  region: Region;
  rarity: number;
}
