interface Chroma {
  id: number; // Internal unique id of the chroma
  availability?: string; // Store (Unspecified), Bundle, Partner, Loot, Reward
  source?: string; // Store (Unspecified), Bundle, Partner, Loot, Reward
}

export interface WikiSkin {
  id: number; // Internal unique id of the skin (classic skin is ALWAYS 0)
  variant?: number; // If the entry is a variant, note the id of the skin that it is an alternate version of (do NOT note it in the base version; skins can have any number of variants noted)
  formatname?: string; // Due to certain special characters not being allowed in files, note the real name of the skin here INCLUDING the champion's name
  availability: string; // Available, Legacy, Rare, Limited, Partner, Upcoming, Removed or Canceled
  looteligible?: boolean; // Set to "true" if the skin is obtained from loot chests/rerolls; omit otherwise
  distribution?: string; // Distribution rules, if the skin is limited-edition
  cost?: number; // Store RP price
  release?: string; // Release date (YYYY-MM-DD or N/A)
  earlysale?: string; // Month of Early Sale (YYYY-MM)
  set?: string[]; // Skin set(s) in which the skin is officially categorized under
  neweffects?: boolean; // New VFX or SFX
  newanimations?: boolean; // New animations beyond a new Recall
  newrecall?: boolean; // New Recall animation specifically
  transforming?: boolean; // Manual model transformations
  newvoice?: boolean; // Has a unique voice-over (does not use classic skin's)
  newquotes?: boolean; // Has additional quotes (any amount is applicable)
  filter?: boolean; // Voice-over filter on top of the classic skin's voicelines (regardless of additional quotes)
  chromas?: Record<string, Chroma>; // attributes of all released chromas, including unavailable ones
  voiceactor?: string[]; // Voice actor(s)
  splashartist?: string[]; // Splash artist(s)
  lore?: string; // Lore blurb
}

interface Champion {
  id: number;
  skins: Record<string, WikiSkin>;
}

export type WikiSkinData = Record<string, Champion>;
