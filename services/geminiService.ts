import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { GAME_SYSTEM_PROMPTS } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const identifyGame = async (frame: string): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(frame, 'image/jpeg');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          { text: 'Identify the video game shown in this image. Respond with only the name of the game. If you are unsure, respond with "Unknown".' }
        ]
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error identifying game:", error);
    return "Unknown";
  }
};

export const analyzeGameplay = async (frames: string[], gameName: string): Promise<AnalysisResult> => {
  const gameKey = gameName.toLowerCase();
  const systemInstruction = GAME_SYSTEM_PROMPTS[gameKey] || GAME_SYSTEM_PROMPTS['default'];

  const imageParts = frames.map(frame => fileToGenerativePart(frame, 'image/jpeg'));

  const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      gameplaySummary: {
        type: Type.STRING,
        description: "A brief, one or two-sentence summary of the overall action or situation happening in the gameplay frames."
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List 2-3 key strengths the player demonstrated."
      },
      improvements: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List 3-4 areas where the player can improve."
      },
      tips: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Provide 3-4 specific, actionable tips for the player."
      },
      skillRatings: {
        type: Type.OBJECT,
        description: "Rate the player on core skills on a scale of 1 to 10.",
        properties: {
          Aim: { type: Type.NUMBER, description: "Player's aiming skill rating from 1 to 10." },
          Positioning: { type: Type.NUMBER, description: "Player's positioning skill rating from 1 to 10." },
          'Decision Making': { type: Type.NUMBER, description: "Player's decision making skill rating from 1 to 10." },
          'Team Play': { type: Type.NUMBER, description: "Player's team play/synergy skill rating from 1 to 10." }
        },
        required: ["Aim", "Positioning", "Decision Making", "Team Play"]
      }
    },
    required: ["gameplaySummary", "strengths", "improvements", "tips", "skillRatings"]
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        ...imageParts,
        { text: 'Analyze this gameplay. Provide a brief summary of the action, qualitative feedback, and a quantitative skill breakdown. Rate the player from 1 (Needs Improvement) to 10 (Excellent) on the required core skills based on your persona.' }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
    }
  });

  try {
    const parsed = JSON.parse(response.text);
    // Basic validation
    if (parsed.gameplaySummary && parsed.strengths && parsed.improvements && parsed.tips && parsed.skillRatings) {
       return parsed as AnalysisResult;
    } else {
       throw new Error("Parsed JSON is missing required fields.");
    }
  } catch(e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response text:", response.text);
    throw new Error("The AI returned an unexpected response format. Please try again.");
  }
};
