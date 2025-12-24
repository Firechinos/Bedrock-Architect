
export interface MinecraftBehavior {
  format_version: string;
  "minecraft:entity"?: any;
  "minecraft:item"?: any;
  "minecraft:block"?: any;
}

export interface ModificationResult {
  updatedJson: string;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
