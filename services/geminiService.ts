
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse, AspectRatio } from "../types";

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateBackground(prompt: string, aspectRatio: AspectRatio, brandingImages: (string | null)[]): Promise<string | null> {
    try {
      const ai = this.getAI();
      const styleSource = brandingImages[0];
      const identityReference = brandingImages[1];
      
      let systemPrompt = `Generate a viral YouTube thumbnail for the topic: "${prompt}". `;
      systemPrompt += `Style: High energy, high saturation, professional clickbait aesthetic. `;

      const parts: any[] = [];

      if (styleSource && identityReference) {
        // STYLE FUSION + IDENTITY SWAP
        systemPrompt += `\n\nCRITICAL INSTRUCTION: IMAGE 1 is the source for STYLE, COLOR PALETTE, and SCENE CONTENT. IMAGE 2 is the BRANDING REFERENCE (the subject's identity). `;
        systemPrompt += `You MUST generate a result that adopts the exact visual style, lighting, and composition of IMAGE 1, but integrates the identity from IMAGE 2 as the main character. `;
        systemPrompt += `The person in the final image must have the EXACT facial features and recognizable likeness of the person in IMAGE 2. `;
        systemPrompt += `The background and general content should remain consistent with the theme shown in IMAGE 1 and the prompt: "${prompt}". No text in image.`;
        
        parts.push({ text: systemPrompt });
        parts.push(this.createImagePart(styleSource));
        parts.push(this.createImagePart(identityReference));
      } else if (identityReference) {
        // GENERATE SCENE FROM PROMPT + IDENTITY
        systemPrompt += `\n\nCRITICAL INSTRUCTION: Generate a new scene based on "${prompt}". Use the provided image (IDENTITY REFERENCE) to define the main character. `;
        systemPrompt += `The main subject MUST look exactly like the person in the provided image. `;
        systemPrompt += `Integrate their likeness into a cinematic YouTube-style environment. No text in image.`;
        
        parts.push({ text: systemPrompt });
        parts.push(this.createImagePart(identityReference));
      } else if (styleSource) {
        // STYLE SOURCE ONLY
        systemPrompt += `\n\nCRITICAL INSTRUCTION: Use IMAGE 1 as your visual template. Enhance the content based on the topic: "${prompt}". `;
        systemPrompt += `Apply viral YouTube grading and lighting. No text in image.`;
        
        parts.push({ text: systemPrompt });
        parts.push(this.createImagePart(styleSource));
      } else {
        // PURE PROMPT GENERATION
        systemPrompt += `\n\nGenerate a brand new high-impact thumbnail scene based on "${prompt}". No text in image.`;
        parts.push({ text: systemPrompt });
      }

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

  private createImagePart(dataUrl: string) {
    const [mimePart, base64Part] = dataUrl.split(',');
    const mimeType = mimePart.split(':')[1].split(';')[0];
    return {
      inlineData: {
        data: base64Part,
        mimeType: mimeType
      }
    };
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
