
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateDescription(productName: string, category: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
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
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a concise, standard 8-character SKU (Stock Keeping Unit) for a product named "${productName}" in the "${category}" category. Just return the SKU string, no extra text.`,
      });
      return response.text?.trim().toUpperCase() || "SKU-ERROR";
    } catch (error) {
      return "SKU-" + Math.random().toString(36).substring(7).toUpperCase();
    }
  }
}

export const gemini = new GeminiService();
