
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  async generateDescription(productName: string, category: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, professional e-commerce product description for a "${productName}" in the "${category}" category. Keep it under 150 words. Focus on benefits and quality.`,
      });
      return response.text || "Failed to generate description.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to generate description at this time.";
    }
  }

  async suggestSKU(productName: string, category: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a concise, standard 8-character SKU (Stock Keeping Unit) for a product named "${productName}" in the "${category}" category. Just return the SKU string, no extra text.`,
      });
      return response.text?.trim().toUpperCase() || "SKU-ERROR";
    } catch (error) {
      return "SKU-" + Math.random().toString(36).substring(7).toUpperCase();
    }
  }

  /**
   * Generates lifestyle/on-model images based on an uploaded product image.
   * Takes a base64 image (without prefix) and returns two new base64 images.
   */
  async generateLifestyleImages(base64Image: string, category: string): Promise<string[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompts = [
        `High-quality professional lifestyle photography. A male fashion model wearing this exactly depicted ${category} in an urban outdoor city background. Sharp focus, cinematic lighting, 8k resolution.`,
        `High-quality professional lifestyle photography. A female fashion model wearing this exactly depicted ${category} in a minimalist high-end studio background. Sharp focus, soft fashion lighting, 8k resolution.`
      ];

      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      };

      const results: string[] = [];

      // Generate two distinct variants
      for (const prompt of prompts) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [imagePart, { text: prompt }] },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            results.push(part.inlineData.data);
          }
        }
      }

      return results;
    } catch (error) {
      console.error("Image Generation Error:", error);
      // Return empty or fallback if needed, but the form will handle the logic
      return [];
    }
  }
}

export const gemini = new GeminiService();
