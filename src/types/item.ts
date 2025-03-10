export interface Item {
  id: number;
  name: string;
  description: string;
  active: boolean;
  inStore: boolean;
  from: number[];
  to: number[];
  categories: Category[];
  maxStacks: number;
  requiredChampion: RequiredChampion;
  requiredAlly: string;
  requiredBuffCurrencyName: RequiredBuffCurrencyName;
  requiredBuffCurrencyCost: number;
  specialRecipe: number;
  isEnchantment: boolean;
  price: number;
  priceTotal: number;
  displayInItemSets: boolean;
  iconPath: string;
}

export enum Category {
  AbilityHaste = "AbilityHaste",
  Active = "Active",
  Armor = "Armor",
  ArmorPenetration = "ArmorPenetration",
  AttackSpeed = "AttackSpeed",
  Aura = "Aura",
  Boots = "Boots",
  Consumable = "Consumable",
  CooldownReduction = "CooldownReduction",
  CriticalStrike = "CriticalStrike",
  Damage = "Damage",
  GoldPer = "GoldPer",
  Health = "Health",
  HealthRegen = "HealthRegen",
  Jungle = "Jungle",
  Lane = "Lane",
  LifeSteal = "LifeSteal",
  MagicPenetration = "MagicPenetration",
  MagicResist = "MagicResist",
  Mana = "Mana",
  ManaRegen = "ManaRegen",
  NonbootsMovement = "NonbootsMovement",
  OnHit = "OnHit",
  Slow = "Slow",
  SpellBlock = "SpellBlock",
  SpellDamage = "SpellDamage",
  SpellVamp = "SpellVamp",
  Stealth = "Stealth",
  Tenacity = "Tenacity",
  Trinket = "Trinket",
  Vision = "Vision",
}

export enum RequiredBuffCurrencyName {
  Empty = "",
  FeatsNoxianBootPurchaseBuff = "Feats_NoxianBootPurchaseBuff",
  FeatsSpecialQuestBootBuff = "Feats_SpecialQuestBootBuff",
  GangplankBilgewaterToken = "GangplankBilgewaterToken",
  S11SupportQuestCompletionBuff = "S11Support_Quest_Completion_Buff",
  UltbookSmitePassive = "UltbookSmitePassive",
}

export enum RequiredChampion {
  Empty = "",
  FiddleSticks = "FiddleSticks",
  Gangplank = "Gangplank",
  Kalista = "Kalista",
  Sylas = "Sylas",
}
