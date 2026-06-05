export type WorldCupCategory = 'all' | 'dessert' | 'korean' | 'night';

export type WorldCupRoundSize = number;

export type WorldCupEntryKind = 'chicken-brand' | 'dessert-menu' | 'menu';

export type WorldCupEntry = {
  category: Exclude<WorldCupCategory, 'all'>;
  id: string;
  imageUri?: string;
  kind: WorldCupEntryKind;
  subtitle?: string;
  title: string;
};

export type WorldCupMatch = {
  left: WorldCupEntry;
  right: WorldCupEntry;
};

export type WorldCupBracketState = {
  currentMatchIndex: number;
  matches: WorldCupMatch[];
  roundLabel: string;
  roundSize: WorldCupRoundSize;
  winners: WorldCupEntry[];
};
