
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse, AspectRatio } from "../types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateBackground(prompt: string, aspectRatio: AspectRatio, brandingImages: (string | null)[]): Promise<string | null> {
    try {
      const ai = this.getAI();
      const validImages = brandingImages.filter(img => img !== null);
      
      // Specialized Face-Swap / Subject Integration Prompt
      let basePrompt = `Generate a cinematic, high-impact YouTube thumbnail background for the topic: "${prompt}". `;
      basePrompt += `Style: High-saturation, professional lighting, sharp focus, vibrant colors, ${aspectRatio} aspect ratio. `;
      
      if (validImages.length > 0) {
        basePrompt += `\n\nCRITICAL INSTRUCTION: Perform a professional face-swap. Use the provided reference image(s) as the source for the main character's face, identity, and features. `;
        basePrompt += `The generated subject in the scene must have the EXACT facial structure, expression, and likeness of the person in the images. `;
        basePrompt += `Seamlessly integrate the face into the ${prompt} environment. Do not include any text in the generated image itself.`;
      } else {
        basePrompt += "Include a main character that looks like a generic viral YouTube creator. No text in image.";
      }

      const parts: any[] = [{ text: basePrompt }];

      validImages.forEach((img) => {
        const mimeTypeParts = img!.split(';');
        if (mimeTypeParts.length > 0) {
          const mimeType = mimeTypeParts[0].split(':')[1];
          const base64Data = img!.split(',')[1];
          
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) return null;

      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating background:", error);
      return null;
    }
  }

  async getViralSuggestions(topic: string): Promise<SuggestionResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am creating a YouTube thumbnail about "${topic}". Suggest 5 viral, high-CTR titles and 3 specific design tips.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              viralTitles: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              designTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["viralTitles", "designTips"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response text");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : text;
      
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return { 
        viralTitles: ["AMAZING Result!", "Don't Miss This!", "I Tried It..."], 
        designTips: ["Use bright colors", "Add a shocked face"] 
      };
    }
  }
}

export const geminiService = new GeminiService();
