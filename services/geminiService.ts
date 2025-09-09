
import { GoogleGenAI, Part, Modality } from '@google/genai';

// Función para obtener la API key de diferentes fuentes
const getApiKey = () => {
  // Intentar obtener la API key de process.env (desarrollo local)
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  // Si estamos en producción, intentar obtener de window.__ENV__
  // Esta variable se configurará en el HTML durante el despliegue
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.GEMINI_API_KEY) {
    return window.__ENV__.GEMINI_API_KEY;
  }
  
  // Fallback a una variable de entorno estática (configurada durante el build)
  return process.env.GEMINI_API_KEY || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

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
