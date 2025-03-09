interface Chroma {
  id: number;
  availability?: string;
  source?: string;
}

interface Skin {
  id: number;
  variant?: number;
  formatname?: string;
  availability: string;
  looteligible?: boolean;
  distribution?: string;
  cost?: number;
  release?: string;
  earlysale?: string;
  set?: string[];
  neweffects?: boolean;
  newanimations?: boolean;
  newrecall?: boolean;
  transforming?: boolean;
  newvoice?: boolean;
  newquotes?: boolean;
  filter?: boolean;
  chromas?: Record<string, Chroma>;
  voiceactor?: string[];
  splashartist?: string[];
  lore?: string;
}

interface Champion {
  id: number;
  skins: Record<string, Skin>;
}

export type WikiSkinData = Record<string, Champion>;
