/**
 * AI Provider Service - Single provider (OpenAI) with retries, timeouts, and caching
 * MVP: Use ONE provider and make it rock-solid
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for analysis results
const analysisCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second

/**
 * Sleep utility
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate cache key from request parameters
 */
function getCacheKey(aoi: { name: string; lat: number; lon: number }, question?: string, timeWindowDays?: number): string {
  const roundedLat = Math.round(aoi.lat * 100) / 100;
  const roundedLon = Math.round(aoi.lon * 100) / 100;
  return `${aoi.name}:${roundedLat},${roundedLon}:${question || "default"}:${timeWindowDays || 30}`;
}

/**
 * Get cached result if valid
 */
function getCached(key: string): any | null {
  const cached = analysisCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Provider] Cache hit for: ${key.substring(0, 50)}...`);
    return cached.result;
  }
  return null;
}

/**
 * Set cache entry
 */
function setCache(key: string, result: any): void {
  analysisCache.set(key, { result, timestamp: Date.now() });
  
  // Clean old entries (keep cache size reasonable)
  if (analysisCache.size > 100) {
    const now = Date.now();
    const keysToDelete: string[] = [];
    analysisCache.forEach((v, k) => {
      if (now - v.timestamp > CACHE_TTL) {
        keysToDelete.push(k);
      }
    });
    keysToDelete.forEach(k => analysisCache.delete(k));
  }
}

/**
 * Execute OpenAI request with retries and error handling
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; latencyMs: number; tokens?: number }> {
  const startTime = Date.now();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await operation();
      return {
        result,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[Provider] ${operationName} attempt ${attempt + 1} failed:`, error.message);
      
      // Don't retry on non-retryable errors
      if (error.status === 401 || error.status === 403) {
        throw new Error(`API authentication error: ${error.message}`);
      }
      
      // Rate limit - wait longer
      if (error.status === 429) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt + 1);
        console.log(`[Provider] Rate limited, waiting ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      // Server error - retry with backoff
      if (error.status >= 500) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      
      // Other errors - don't retry
      throw error;
    }
  }
  
  throw lastError || new Error(`${operationName} failed after ${MAX_RETRIES} retries`);
}

export interface PmesiiAnalysisResult {
  pmesii: {
    political: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    military: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    economic: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    social: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    information: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    infrastructure: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
  };
  sigacts: Array<{
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    confidence: number;
  }>;
  confidence: {
    score: number;
    rationale: string[];
  };
  evidence: Array<{
    source: string;
    title: string;
    url?: string;
    timestamp?: string;
    excerpt: string;
  }>;
  providerStatus: {
    model: string;
    latencyMs: number;
    tokens: number;
  };
}

/**
 * Generate PMESII analysis using OpenAI
 */
export async function generatePmesiiAnalysis(
  aoi: { name: string; lat: number; lon: number; bbox?: number[] },
  question?: string,
  timeWindowDays: number = 30
): Promise<PmesiiAnalysisResult> {
  // Check cache first
  const cacheKey = getCacheKey(aoi, question, timeWindowDays);
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  console.log(`[Provider] Generating PMESII analysis for: ${aoi.name} (${aoi.lat}, ${aoi.lon})`);

  const systemPrompt = `You are a senior intelligence analyst specializing in PMESII-PT (Political, Military, Economic, Social, Information, Infrastructure, Physical Environment, Time) analysis. You provide structured, evidence-based assessments for operational planning.

Your analysis must be:
1. Factual and based on real-world knowledge
2. Structured according to PMESII-PT framework
3. Include confidence scores (0.0-1.0) based on data quality
4. Provide SIGACT-style event summaries (Who, What, Where, When, Why)
5. Cite sources and evidence when possible

Risk levels: LOW, MEDIUM, HIGH, CRITICAL

Return your analysis as valid JSON matching the exact schema provided.`;

  const userPrompt = `Analyze the following Area of Interest (AOI):

Location: ${aoi.name}
Coordinates: ${aoi.lat}, ${aoi.lon}
Time Window: Last ${timeWindowDays} days
${question ? `\nSpecific Question: ${question}` : ""}

Provide a comprehensive PMESII analysis as JSON with this exact structure:
{
  "pmesii": {
    "political": { "assessment": "...", "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL", "confidence": 0.0-1.0, "considerations": ["..."] },
    "military": { "assessment": "...", "riskLevel": "...", "confidence": 0.0-1.0, "considerations": ["..."] },
    "economic": { "assessment": "...", "riskLevel": "...", "confidence": 0.0-1.0, "considerations": ["..."] },
    "social": { "assessment": "...", "riskLevel": "...", "confidence": 0.0-1.0, "considerations": ["..."] },
    "information": { "assessment": "...", "riskLevel": "...", "confidence": 0.0-1.0, "considerations": ["..."] },
    "infrastructure": { "assessment": "...", "riskLevel": "...", "confidence": 0.0-1.0, "considerations": ["..."] }
  },
  "sigacts": [
    { "who": "...", "what": "...", "where": "...", "when": "...", "why": "...", "confidence": 0.0-1.0 }
  ],
  "confidence": {
    "score": 0-100,
    "rationale": ["reason 1", "reason 2", "..."]
  },
  "evidence": [
    { "source": "news|social|government|ngo|academic", "title": "...", "excerpt": "...", "timestamp": "YYYY-MM-DD" }
  ]
}

Focus on actionable intelligence relevant to the location and any stated objectives.`;

  try {
    const { result: completion, latencyMs } = await executeWithRetry(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o", // Using gpt-4o for best quality
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 4000,
        });
      },
      "PMESII Analysis"
    );

    const responseText = completion.choices[0]?.message?.content || "{}";
    const tokens = completion.usage?.total_tokens || 0;

    let analysis: any;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error("[Provider] Failed to parse response as JSON:", responseText.substring(0, 200));
      throw new Error("Failed to parse AI response as valid JSON");
    }

    // Build result with provider status
    const result: PmesiiAnalysisResult = {
      pmesii: analysis.pmesii || getDefaultPmesii(),
      sigacts: analysis.sigacts || [],
      confidence: analysis.confidence || { score: 50, rationale: ["Default confidence - analysis may be incomplete"] },
      evidence: analysis.evidence || [],
      providerStatus: {
        model: "gpt-4o",
        latencyMs,
        tokens,
      },
    };

    // Cache the result
    setCache(cacheKey, result);

    console.log(`[Provider] PMESII analysis complete: ${latencyMs}ms, ${tokens} tokens, confidence: ${result.confidence.score}`);

    return result;
  } catch (error: any) {
    console.error("[Provider] PMESII analysis failed:", error.message);
    
    // Return a fallback result with error indication
    return {
      pmesii: getDefaultPmesii(),
      sigacts: [],
      confidence: {
        score: 0,
        rationale: [`Analysis failed: ${error.message}`, "Using fallback data - please retry"],
      },
      evidence: [],
      providerStatus: {
        model: "gpt-4o",
        latencyMs: 0,
        tokens: 0,
      },
    };
  }
}

/**
 * Generate default PMESII structure for fallback
 */
function getDefaultPmesii() {
  const defaultFactor = {
    assessment: "Analysis unavailable - please retry",
    riskLevel: "MEDIUM",
    confidence: 0,
    considerations: ["Data not available"],
  };
  
  return {
    political: { ...defaultFactor },
    military: { ...defaultFactor },
    economic: { ...defaultFactor },
    social: { ...defaultFactor },
    information: { ...defaultFactor },
    infrastructure: { ...defaultFactor },
  };
}

/**
 * Check if provider is available
 */
export function isProviderAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get provider status
 */
export function getProviderStatus(): { available: boolean; provider: string; cacheSize: number } {
  return {
    available: isProviderAvailable(),
    provider: "openai",
    cacheSize: analysisCache.size,
  };
}
