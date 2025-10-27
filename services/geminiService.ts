
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { ReferenceImage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (image: ReferenceImage) => {
  return {
    inlineData: {
      data: image.base64,
      mimeType: image.mimeType,
    },
  };
};

export const generateWallpapers = async (prompt: string, images: (ReferenceImage | null)[]): Promise<string[]> => {
  const imageParts = images.filter(img => img !== null).map(img => fileToGenerativePart(img!));
  
  const contents = {
    parts: [
      { text: prompt },
      ...imageParts
    ],
  };

  const generationPromises = Array(4).fill(0).map(() => 
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    })
  );

  const responses = await Promise.all(generationPromises);

  const generatedImages = responses.map(response => {
    const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);
    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }
    throw new Error('Image data not found in response');
  });

  return generatedImages;
};

export const remixImage = async (prompt: string, base64Image: string, useThinkingMode: boolean): Promise<string> => {
  let finalPrompt = prompt;

  if (useThinkingMode) {
      try {
          const proModel = ai.models;
          const thinkingResponse = await proModel.generateContent({
              model: 'gemini-2.5-pro',
              contents: {
                  parts: [{
                      text: `You are an expert prompt engineer for an image generation AI. A user wants to edit an image. Their request is: "${prompt}". Expand this simple request into a rich, detailed, and descriptive prompt that will guide the image generation model to fulfill the user's intent with high artistic quality. Do not add any conversational text, just output the refined prompt.`
                  }]
              },
              config: {
                  thinkingConfig: { thinkingBudget: 32768 }
              }
          });
          finalPrompt = thinkingResponse.text.trim();
          console.log("Refined prompt with Thinking Mode:", finalPrompt);
      } catch (error) {
          console.error("Thinking mode failed, using original prompt.", error);
      }
  }
  
  const contents = {
    parts: [
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/png', // Assume png, could be improved to detect type
        },
      },
      {
        text: `Edit this image based on the following instruction: ${finalPrompt}`,
      },
    ],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);
  if (imagePart && imagePart.inlineData) {
    return imagePart.inlineData.data;
  }

  throw new Error('Failed to remix image. No image data received.');
};
