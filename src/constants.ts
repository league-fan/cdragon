/* URLs */
export const CDRAGON_URL = "https://raw.communitydragon.org";

/* Languages */
export const LANGUAGES = [
  "ar_ae",
  "cs_cz",
  "de_de",
  "default",
  "el_gr",
  "en_au",
  "en_gb",
  "en_ph",
  "en_sg",
  "es_ar",
  "es_es",
  "es_mx",
  "fr_fr",
  "hu_hu",
  "id_id",
  "it_it",
  "ja_jp",
  "ko_kr",
  "pl_pl",
  "pt_br",
  "ro_ro",
  "ru_ru",
  "th_th",
  "tr_tr",
  "vi_vn",
  "zh_cn",
  "zh_my",
  "zh_tw",
] as const;

export type Language = typeof LANGUAGES[number];

export const RESOURCE_JSON_PATHS = [
  "v1/champion-summary.json",
  "v1/universes.json",
  "v1/skinlines.json",
  "v1/skins.json",
  "v1/summoner-emotes.json",
  "v1/summoner-icons.json",
  "v1/summoner-icon-sets.json",
  "v1/tftchampions.json",
  "v1/tftmapskins.json",
  "v1/ward-skins.json",
  "v1/ward-skin-sets.json",
] as const;

export type ResourceJsonPath = typeof RESOURCE_JSON_PATHS[number];

export const PATCHES = [
  "latest",
  "pbe",
] as const;

export type Patch = typeof PATCHES[number];
