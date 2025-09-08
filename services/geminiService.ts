import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image-preview';

async function dataUrlToGenerativePart(dataUrl: string) {
    const base64Data = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
}

async function callGeminiModel(
    base64ImageDataUrl: string,
    prompt: string
): Promise<string> {
    const imagePart = await dataUrlToGenerativePart(base64ImageDataUrl);
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imageParts = response.candidates?.[0]?.content?.parts.filter(part => part.inlineData);
    if (imageParts && imageParts.length > 0 && imageParts[0].inlineData) {
        const mimeType = imageParts[0].inlineData.mimeType;
        const base64Data = imageParts[0].inlineData.data;
        return `data:${mimeType};base64,${base64Data}`;
    }

    // Fallback or error handling
    const textResponse = response.text?.trim();
    if(textResponse) {
        throw new Error(`API returned text instead of an image: ${textResponse}`);
    }
    throw new Error('Failed to generate image. No image data received from API.');
}

export async function generateSolarImages(base64ImageWithPolygon: string): Promise<{ rooftopView: string, threeDView: string }> {

    const rooftopPrompt = "In this image, realistically replace the area inside the red polygon with solar panels. The final image should not contain the red line itself.";
    const threeDPrompt = "Generate a photorealistic 3D architectural rendering of the house in the image, viewed from an angled, eye-level perspective. The house should have solar panels installed on its roof. The final image should be a completely new rendering and not an edit of the original top-down view.";

    const [rooftopView, threeDView] = await Promise.all([
        callGeminiModel(base64ImageWithPolygon, rooftopPrompt),
        callGeminiModel(base64ImageWithPolygon, threeDPrompt)
    ]);
    
    return { rooftopView, threeDView };
}