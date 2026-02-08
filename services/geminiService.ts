
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse, AspectRatio } from "../types";

export class GeminiService {
  private getAI() {
    // Note: Veo models will use the key from process.env.API_KEY which is injected
    // after user selects via window.aistudio.openSelectKey()
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateBackground(prompt: string, aspectRatio: AspectRatio, brandingImages: (string | null)[]): Promise<string | null> {
    try {
      const ai = this.getAI();
      const identityReference = brandingImages[0];
      const styleSource = brandingImages[1];
      
      let systemInstruction = `You are an expert UGC (User Generated Content) and YouTube Thumbnail Strategist. 
      Your goal is to create images that look like high-end vlogger photography. 
      Focus on authentic skin textures and natural but polished facial features.
      IMPORTANT: STRICTLY NO TEXT, GRAPHICS, OR WATERMARKS.`;

      const parts: any[] = [];
      let userPrompt = "";

      if (identityReference && styleSource) {
        userPrompt = `UGC FUSION TASK: Create a unified thumbnail for: "${prompt}". 
        Base Identity (Image 1) must be preserved. 
        Aesthetic Vibe (Image 2) must be applied (colors, lighting). 
        Seamlessly place creator 1 into environment 2.`;
        parts.push(this.createImagePart(identityReference));
        parts.push(this.createImagePart(styleSource));
      } else if (identityReference) {
        userPrompt = `UGC CREATOR SCENE: Topic "${prompt}". Use face from Image 1. Professional cinematic lighting.`;
        parts.push(this.createImagePart(identityReference));
      } else {
        userPrompt = `AUTHENTIC UGC THUMBNAIL: Topic "${prompt}". High-quality camera look, vivid colors, natural.`;
      }

      parts.push({ text: userPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          systemInstruction,
          imageConfig: { aspectRatio }
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error) {
      console.error("UGC Generation Error:", error);
      return null;
    }
  }

  async generateVideo(
    prompt: string, 
    aspectRatio: AspectRatio, 
    resolution: '720p' | '1080p',
    startImage: string | null,
    endImage: string | null,
    onStatusUpdate: (msg: string) => void
  ): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      onStatusUpdate("Initializing video generation engine...");

      const videoConfig: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution,
          aspectRatio
        }
      };

      if (startImage) {
        const { data, mimeType } = this.parseImageData(startImage);
        videoConfig.image = { imageBytes: data, mimeType };
      }

      if (endImage) {
        const { data, mimeType } = this.parseImageData(endImage);
        videoConfig.config.lastFrame = { imageBytes: data, mimeType };
      }

      let operation = await ai.models.generateVideos(videoConfig);
      
      onStatusUpdate("Model is dreaming up your content... (This usually takes 1-3 minutes)");
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onStatusUpdate("Adding final touches to the pixels...");
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed - no URI returned");

      onStatusUpdate("Downloading your cinematic masterpiece...");
      const fetchResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await fetchResponse.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Video Generation Error:", error);
      throw error;
    }
  }

  private parseImageData(dataUrl: string) {
    const [mimePart, base64Part] = dataUrl.split(',');
    const mimeType = mimePart.split(':')[1].split(';')[0];
    return { data: base64Part, mimeType };
  }

  private createImagePart(dataUrl: string) {
    const { data, mimeType } = this.parseImageData(dataUrl);
    return { inlineData: { data, mimeType } };
  }

  async getViralSuggestions(topic: string): Promise<SuggestionResponse> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Topic: "${topic}". Suggest 5 viral UGC-style YouTube titles and 3 framing tips.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              viralTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
              designTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["viralTitles", "designTips"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      return { viralTitles: [], designTips: [] };
    }
  }
}

export const geminiService = new GeminiService();
