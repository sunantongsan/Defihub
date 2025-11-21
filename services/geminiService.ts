import { GoogleGenAI } from "@google/genai";
import { LaunchpadProject } from "../types";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiAnalysis = async (project: LaunchpadProject): Promise<string> => {
    
    // This prompt is designed to give Gemini clear instructions and context.
    const prompt = `
      Provide a brief, high-level analysis for a fictional crypto launchpad project.
      The analysis should be balanced, highlighting potential strengths and risks.
      Use markdown for formatting with bolding for key terms. Do not use headers or titles.

      Project Name: "${project.name}"
      Project Description: "${project.description}"

      Structure your analysis into three distinct paragraphs:
      1.  **Concept**: Briefly explain the project's core idea in simple terms.
      2.  **Potential**: What are the potential strengths or market opportunities?
      3.  **Considerations**: What are some potential challenges or risks to consider for a project like this?
    `;

    try {
        console.log("Calling Gemini API for:", project.name);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        // Ensure you are accessing the text correctly from the response
        if (response && response.text) {
             return response.text;
        } else {
            throw new Error("Invalid response structure from Gemini API.");
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        // Provide a more user-friendly error message
        return "An error occurred while generating the AI analysis. The model may be unavailable or the request could not be processed. Please try again later.";
    }
};