import { RarityElement, RegionalDescription } from "./common.ts";

export interface SummonerIcon {
  id: number;
  contentId: string;
  title: string;
  yearReleased: number;
  isLegacy: boolean;
  imagePath?: string;
  descriptions: RegionalDescription[];
  rarities: RarityElement[];
  disabledRegions: string[];
  esportsTeam?: string;
  esportsRegion?: EsportsRegion;
  esportsEvent?: string;
}

export enum EsportsRegion {
  Br = "BR",
  Ch = "CH",
  Cis = "CIS",
  Eu = "EU",
  GPL = "GPL",
  Jp = "JP",
  Kr = "KR",
  LAN = "LAN",
  LANLas = "LAN/LAS",
  Las = "LAS",
  Lms = "LMS",
  Na = "NA",
  Oce = "OCE",
  Pcs = "PCS",
  Ru = "RU",
  Sea = "SEA",
  Tr = "TR",
  Vn = "VN",
}
