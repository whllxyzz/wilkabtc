
import { GoogleGenAI } from "@google/genai";

// Always use a named parameter for the API key from process.env.API_KEY
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateNewsContent = async (topic: string): Promise<string> => {
  try {
    const ai = getAIClient();
    // Use gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tulis artikel berita sekolah singkat (maksimal 150 kata) tentang topik berikut: ${topic}. Gunakan gaya bahasa profesional dan informatif.`,
      config: {
        temperature: 0.7,
      }
    });
    // Access response.text as a property, not a method
    return response.text || "Gagal menghasilkan konten.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};
