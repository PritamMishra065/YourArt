import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Note: API_KEY is handled by the environment and should not be managed in the code.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const improvePrompt = async (prompt: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve this image generation prompt for clarity, detail, and creative potential. Return only the improved prompt, without any preamble or explanation. Original prompt: "${prompt}"`,
    });
    return result.text.trim();
  } catch (error) {
    console.error("Error improving prompt:", error);
    throw new Error("Failed to improve prompt. Please try again.");
  }
};

export const getPromptVariations = async (basePrompt: string): Promise<string[]> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Based on the following image generation prompt, create two more distinct and creative variations. Return a JSON array of three prompts in total (the original improved, and two new ones). The prompts should be detailed and imaginative. Base Prompt: "${basePrompt}". Return ONLY the JSON array of strings.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: 'A creative and detailed prompt for an image generation model.'
                    }
                }
            }
        });

        const textResponse = result.text.trim();
        const variations = JSON.parse(textResponse);
        if (Array.isArray(variations) && variations.length > 0) {
            return variations.slice(0, 3);
        }
        throw new Error("Could not parse prompt variations.");

    } catch (error) {
        console.error("Error getting prompt variations:", error);
        // Fallback if the structured response fails
        console.warn("Falling back to simpler prompt improvement.");
        const improved = await improvePrompt(basePrompt);
        return [improved, `${improved}, cinematic lighting`, `${improved}, in the style of vaporwave`];
    }
}


export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64Image = response.generatedImages[0]?.image?.imageBytes;
    if (!base64Image) {
        throw new Error("API did not return an image.");
    }
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error(`Error generating image for prompt "${prompt}":`, error);
    throw new Error("Failed to generate an image. Please try again.");
  }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
    }
    
    throw new Error("No image was generated in the response.");

  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image. Please try again.");
  }
};

// Fix: Add getChatResponse function for the chatbot component.
export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history,
    });
    return result.text.trim();
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw new Error("Failed to get chat response. Please try again.");
  }
};
