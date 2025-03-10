export interface TftChampion {
  name: string;
  character_record: CharacterRecord;
}

export interface CharacterRecord {
  path: string;
  character_id: string;
  rarity: number;
  display_name: string;
  traits: Trait[];
  squareIconPath: string;
}

export interface Trait {
  name: string;
  id: string;
}
