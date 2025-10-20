import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface LocationContext {
  latitude: number;
  longitude: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GeminiLocationResponse {
  text: string;
  groundingSources: GroundingSource[];
}

/**
 * Process location-based intelligence query using Gemini 2.5 Flash Lite with Google Maps grounding
 */
export async function processLocationQuery(
  query: string,
  location?: LocationContext
): Promise<GeminiLocationResponse> {
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    // Add location context if provided
    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: query,
      config,
    });

    const groundingSources: GroundingSource[] = [];

    // Extract grounding metadata (Google Maps sources)
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.groundingMetadata?.groundingChunks) {
        for (const chunk of candidate.groundingMetadata.groundingChunks) {
          if (chunk.maps) {
            groundingSources.push({
              title: chunk.maps.title || "Google Maps Location",
              uri: chunk.maps.uri || "",
            });
          }
        }
      }
    }

    return {
      text: response.text || "No response generated",
      groundingSources,
    };
  } catch (error) {
    console.error("Gemini location query error:", error);
    
    // Return mock response on error (for development/demo)
    return {
      text: `Based on available intelligence for the specified location:\n\n**Tactical Assessment:**\nLocation analysis indicates a moderate-density urban environment with mixed commercial and residential zones. Key infrastructure includes transportation networks, communication hubs, and civilian facilities.\n\n**Risk Factors:**\n- Population density: Medium to High\n- Critical infrastructure present\n- Mixed use area with civilian presence\n\n**Recommendations:**\n- Conduct detailed reconnaissance of immediate area\n- Identify evacuation routes and safe zones\n- Assess local security posture\n\n*Note: This is a simulated response. For live Google Maps data, ensure GEMINI_API_KEY is configured.*`,
      groundingSources: [],
    };
  }
}

/**
 * Process tactical intelligence query with multimodal support
 */
export async function processTacticalQueryGemini(
  query: string,
  imageData?: { data: string; mimeType: string }
): Promise<string> {
  try {
    const contents: any[] = [];

    // Add image if provided
    if (imageData) {
      contents.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType,
        },
      });
    }

    // Add text query
    contents.push(query);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return response.text || "No response generated";
  } catch (error) {
    console.error("Gemini tactical query error:", error);
    throw error;
  }
}

/**
 * Generate PMESII analysis using Gemini
 */
export async function generatePMESIIAnalysisGemini(
  location: string,
  context?: string
): Promise<any> {
  try {
    const prompt = `As a tactical intelligence analyst, provide a comprehensive PMESII analysis for ${location}.

${context ? `Additional Context: ${context}\n\n` : ""}
Analyze the following factors:

1. **Political**: Government structure, stability, key political actors, tensions
2. **Military**: Security forces, capabilities, threats, insurgent groups
3. **Economic**: Key industries, economic stability, infrastructure, resources
4. **Social**: Demographics, cultural factors, ethnic/religious tensions, population centers
5. **Information**: Media landscape, information networks, propaganda, social media influence
6. **Infrastructure**: Transportation, utilities, communication networks, critical facilities

For each factor, provide:
- Current assessment
- Risk level (LOW, MEDIUM, HIGH, CRITICAL)
- Confidence score (0.0 to 1.0)
- Key considerations for operations

Return the analysis in JSON format with this structure:
{
  "political": { "assessment": "", "riskLevel": "", "confidence": 0.0, "considerations": [] },
  "military": { "assessment": "", "riskLevel": "", "confidence": 0.0, "considerations": [] },
  "economic": { "assessment": "", "riskLevel": "", "confidence": 0.0, "considerations": [] },
  "social": { "assessment": "", "riskLevel": "", "confidence": 0.0, "considerations": [] },
  "information": { "assessment": "", "riskLevel": "", "confidence": 0.0, "considerations": [] },
  "infrastructure": { "assessment": "", "riskLevel": "", "confidence": 0.0, "considerations": [] }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const analysis = JSON.parse(response.text || "{}");
    return analysis;
  } catch (error) {
    console.error("Gemini PMESII analysis error:", error);
    throw error;
  }
}
