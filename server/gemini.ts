import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client only if API key is available
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured - using fallback responses");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

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
  // Check for API key first
  const ai = getGeminiClient();
  if (!ai) {
    return getMockLocationResponse(query, location);
  }

  try {
    // Build request config with Google Maps grounding
    const config: any = {
      tools: [{ google_maps: {} }], // Correct tool name format
    };

    // Add location context if provided
    if (location) {
      config.tool_config = {
        retrieval_config: {
          lat_lng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    console.log(`[Gemini] Processing location query with Maps grounding: "${query}"`);
    console.log(`[Gemini] Location context:`, location || "none");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config,
    });

    const groundingSources: GroundingSource[] = [];

    // Extract grounding metadata (Google Maps sources)
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      // Log grounding metadata for debugging
      console.log(`[Gemini] Grounding metadata:`, JSON.stringify(candidate.groundingMetadata || {}, null, 2));
      
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

    console.log(`[Gemini] Response received, grounding sources:`, groundingSources.length);

    // Get text response (it's a property, not a method)
    const text = response.text;

    return {
      text: text || "No response generated",
      groundingSources,
    };
  } catch (error) {
    console.error("[Gemini] Location query error:", error);
    return getMockLocationResponse(query, location);
  }
}

/**
 * Generate mock tactical location response for fallback
 */
function getMockLocationResponse(query: string, location?: LocationContext): GeminiLocationResponse {
  const locationStr = location 
    ? `(${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
    : "specified location";
    
  return {
    text: `Based on available intelligence for ${locationStr}:\n\n**Tactical Assessment:**\nLocation analysis indicates a moderate-density urban environment with mixed commercial and residential zones. Key infrastructure includes transportation networks, communication hubs, and civilian facilities.\n\n**Risk Factors:**\n- Population density: Medium to High\n- Critical infrastructure present\n- Mixed use area with civilian presence\n\n**Recommendations:**\n- Conduct detailed reconnaissance of immediate area\n- Identify evacuation routes and safe zones\n- Assess local security posture\n\n*Note: This is a simulated response. For live Google Maps data, ensure GEMINI_API_KEY is configured.*`,
    groundingSources: [],
  };
}

/**
 * Process tactical intelligence query with multimodal support
 */
export async function processTacticalQueryGemini(
  query: string,
  imageData?: { data: string; mimeType: string }
): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const parts: any[] = [];

    // Add image if provided
    if (imageData) {
      parts.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType,
        },
      });
    }

    // Add text query
    parts.push({ text: query });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
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
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API key not configured");
  }

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
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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
