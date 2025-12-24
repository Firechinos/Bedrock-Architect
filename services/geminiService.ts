
import { GoogleGenAI, Type } from "@google/genai";
import { ModificationResult } from "../types";

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

      You are a Minecraft Bedrock Edition expert. This JSON could be an entity behavior, an item definition, or a block definition.
      
      Rules:
      1. Identify the root type (minecraft:entity, minecraft:item, or minecraft:block).
      2. Modify the JSON according to the instruction while adhering to the official Minecraft Bedrock schema for that type.
      3. Maintain proper format_version.
      4. If adding components, ensure they are valid for the specific root type (e.g., don't add "minecraft:movement" to an item).
      5. Ensure logical consistency across the file.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          updatedJson: {
            type: Type.STRING,
            description: "The full modified JSON content as a string."
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of what was changed."
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
      explanation: result.explanation || "Modified the Minecraft JSON."
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to process the AI modification.");
  }
}

export async function summarizeMinecraftJson(json: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Summarize the following Minecraft Bedrock JSON file for a human developer.
      1. Identify if it is an Entity, Item, or Block.
      2. Explain its purpose and key properties (e.g., if it's an item, what are its stats? If it's a block, is it breakable? If it's an entity, what is its health/behavior?).
      Keep it professional, structured, and concise.

      \`\`\`json
      ${json}
      \`\`\`
    `
  });
  return response.text || "No summary available.";
}
