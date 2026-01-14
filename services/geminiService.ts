
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

export const generateToolVideo = async (toolName: string, description: string): Promise<string> => {
  const ai = getAIClient();
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A futuristic, high-tech cinematic commercial for an AI tool named "${toolName}". ${description}. Professional lighting, 4k resolution, sleek design aesthetics.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned from API");
    }

    // Fetch the actual video bytes using the API key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error("Failed to download video content");
    }

    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
