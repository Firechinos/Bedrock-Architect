
import { GoogleGenAI, Type } from "@google/genai";
import { ModificationResult, MinecraftStats, AnalysisData, EncyclopediaData, ComponentConfigInfo, MinecraftFileType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function modifyMinecraftJson(
  currentJson: string,
  instruction: string
): Promise<ModificationResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Current Minecraft Bedrock JSON:
      \`\`\`json
      ${currentJson}
      \`\`\`

      User Instruction: ${instruction}

      Context Rules:
      1. This could be an entity behavior, loot table, or recipe.
      2. If it's a Loot Table: Modify pools, entries, conditions, or functions.
      3. If it's a Recipe: Modify tags, pattern, keys, or results (shaped/shapeless).
      4. If it's an Entity: Modify components or events.
      5. Return the full updated JSON and a brief explanation.
      6. Extract key metrics (0-100) based on type: 
         - Entity: health, speed, attack.
         - Loot: richness (drop count/rarity), efficiency.
         - Recipe: complexity, power.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          updatedJson: { type: Type.STRING },
          explanation: { type: Type.STRING },
          detectedType: { type: Type.STRING, enum: ['entity', 'loot_table', 'recipe', 'block', 'item', 'unknown'] },
          stats: {
            type: Type.OBJECT,
            properties: {
              health: { type: Type.NUMBER },
              speed: { type: Type.NUMBER },
              attack: { type: Type.NUMBER },
              richness: { type: Type.NUMBER },
              complexity: { type: Type.NUMBER },
              efficiency: { type: Type.NUMBER }
            }
          }
        },
        required: ["updatedJson", "explanation"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return {
      updatedJson: result.updatedJson,
      explanation: result.explanation || "Modified the Minecraft JSON.",
      stats: result.stats,
      detectedType: result.detectedType
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to process the AI modification.");
  }
}

export async function getDetailedAnalysis(json: string): Promise<AnalysisData> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this Minecraft Bedrock JSON (Behavior, Loot Table, or Recipe).\n\nJSON:\n${json}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          detectedType: { type: Type.STRING, enum: ['entity', 'loot_table', 'recipe', 'block', 'item', 'unknown'] },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                icon: { type: Type.STRING }
              },
              required: ["header", "items"]
            }
          }
        },
        required: ["overview", "sections", "detectedType"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"overview": "No analysis available.", "sections": [], "detectedType": "unknown"}');
  } catch (e) {
    return { overview: "Failed to parse analysis data.", sections: [], detectedType: 'unknown' };
  }
}

export async function extractStats(json: string): Promise<MinecraftStats> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract performance/utility stats (0-100) from this Minecraft JSON.
    For Loot Tables: Extract 'richness' (variety/quantity) and 'efficiency'.
    For Recipes: Extract 'complexity' and 'power'.
    For Entities: Extract 'health', 'speed', 'attack'.\n\n${json}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          health: { type: Type.NUMBER },
          speed: { type: Type.NUMBER },
          attack: { type: Type.NUMBER },
          richness: { type: Type.NUMBER },
          complexity: { type: Type.NUMBER },
          efficiency: { type: Type.NUMBER },
          power: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
}

export async function getEncyclopediaSuggestions(json: string): Promise<EncyclopediaData> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 12-16 technical additions for this Minecraft JSON.
    If Loot Table: Suggest new entries, functions (set_count, enchant_with_levels), or conditions.
    If Recipe: Suggest alternative ingredients, unlock conditions, or result modifications.
    If Entity: Suggest behaviors/components.
    
    Current JSON:
    ${json}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                example: { type: Type.STRING }
              },
              required: ["name", "description", "category"]
            }
          }
        },
        required: ["items"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"items": []}');
  } catch (e) {
    return { items: [] };
  }
}

export async function getComponentConfigInfo(componentName: string): Promise<ComponentConfigInfo> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide configuration presets for the Minecraft Bedrock element "${componentName}". This could be a component, loot function, or recipe attribute.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          presets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING }
              },
              required: ["label", "value"]
            }
          },
          suggestedPrompt: { type: Type.STRING }
        },
        required: ["presets", "suggestedPrompt"]
      }
    }
  });

  return JSON.parse(response.text || '{"presets": [], "suggestedPrompt": "Configure this element..."}');
}
