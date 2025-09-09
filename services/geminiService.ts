
import { GoogleGenAI, Part, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EditImagePayload {
  prompt: string;
  image: string; // base64 string
  mimeType: string;
}

export const editImageAPI = async (payload: EditImagePayload): Promise<Part[]> => {
  const parts: (Part | { text: string })[] = [{
    inlineData: {
      data: payload.image,
      mimeType: payload.mimeType,
    },
  }];

  if (payload.prompt) {
    parts.push({ text: payload.prompt });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: parts },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (response.candidates && response.candidates.length > 0) {
      return response.candidates[0].content.parts;
  }
  return [];
};

export const generateImageAPI = async (prompt: string): Promise<Part[]> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const part: Part = {
      inlineData: {
        data: base64ImageBytes,
        mimeType: 'image/png',
      },
    };
    return [part];
  }
  return [];
};

export const chatAPI = async (prompt: string): Promise<Part[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text;
  if (text) {
    return [{ text }];
  }
  return [];
};
