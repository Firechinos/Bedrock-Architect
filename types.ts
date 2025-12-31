
export type MinecraftFileType = 'entity' | 'loot_table' | 'recipe' | 'block' | 'item' | 'unknown';

export interface MinecraftStats {
  health?: number;
  speed?: number;
  attack?: number;
  hardness?: number;
  rarity?: string;
  // Loot/Recipe specific stats
  richness?: number; // For loot tables
  complexity?: number; // For recipes
  efficiency?: number;
  power?: number;
}

export interface ModificationResult {
  updatedJson: string;
  explanation: string;
  stats?: MinecraftStats;
  detectedType?: MinecraftFileType;
}

export interface HistoryEntry {
  timestamp: string;
  label: string;
  content: string;
}

export interface AnalysisSection {
  header: string;
  items: string[];
  icon?: string;
}

export interface AnalysisData {
  overview: string;
  sections: AnalysisSection[];
  detectedType: MinecraftFileType;
}

export interface EncyclopediaItem {
  name: string;
  description: string;
  category: 'Component' | 'Behavior' | 'Event' | 'Property' | 'LootEntry' | 'RecipePattern';
  example?: string;
}

export interface EncyclopediaData {
  items: EncyclopediaItem[];
}

export interface ConfigPreset {
  label: string;
  value: string;
}

export interface ComponentConfigInfo {
  presets: ConfigPreset[];
  suggestedPrompt: string;
}
