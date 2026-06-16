import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  processTacticalQuery, 
  generatePMESIIAnalysis, 
  analyzeMultimodalContent,
  calculateRiskScore
} from "./openai";
import {
  getStressConfig,
  setStressConfig,
  resetStressConfig,
  getStressMetrics,
  resetStressMetrics,
  StressScenarios,
} from "./services/stress-harness";
import {
  processLocationQuery,
  processTacticalQueryGemini,
  generatePMESIIAnalysisGemini,
  type LocationContext,
  type GeminiLocationResponse
} from "./gemini";
import {
  calculateDeterministicConfidence,
  aggregateConfidences,
  type ConfidenceContext
} from "./confidence-scoring";
import { 
  chatQuerySchema,
  geminiLocationQuerySchema,
  riskAssessmentRequestSchema,
  pmesiiAnalysisRequestSchema,
  waypointRequestSchema,
  geotagRequestSchema,
  searchQuerySchema,
  timelineQuerySchema,
  weatherRequestSchema,
  weatherAlertRequestSchema,
  locationAnalysisRequestSchema,
  socialMediaQuerySchema,
  insertSocialMediaPostSchema,
  insertAssistantSessionSchema,
  insertAssistantMessageSchema,
  giaRunRequestSchema,
  GIA_MODES,
  type ChatQueryRequest,
  type GeminiLocationQueryRequest,
  type RiskAssessmentRequest,
  type WaypointRequest,
  type GeotagRequest,
  type SearchQuery,
  type TimelineQuery,
  type WeatherRequest,
  type WeatherAlertRequest,
  type LocationAnalysisRequest,
  type SocialMediaQuery,
  type InsertSocialMediaPost,
  type GIAMode
} from "@shared/schema";
import multer from "multer";
// import pdfParse from "pdf-parse"; // Temporarily disabled due to initialization issues
import mammoth from "mammoth";
import * as fs from 'fs/promises';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return "Unknown error occurred";
}

function handleOpenAIError(error: unknown, res: any) {
  console.error("OpenAI error:", error);
  const message = getErrorMessage(error);
  
  if (message.includes('429') || message.includes('quota')) {
    return res.status(429).json({ 
      success: false, 
      error: "OpenAI quota exceeded. Please try again later.",
      code: 'quota_exceeded'
    });
  }
  
  return res.status(500).json({ 
    success: false, 
    error: message || "Internal server error" 
  });
}

// GIA Analysis execution helper
async function executeGIAAnalysis(
  mode: GIAMode, 
  prompt: string, 
  session: { 
    aoiLabel: string | null; 
    trainingCountry: string | null;
    timeFrom: Date | null;
    timeTo: Date | null;
  }
): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const contextInfo = session.aoiLabel 
    ? `Current AOI: ${session.aoiLabel}. Training Country: ${session.trainingCountry || "Not specified"}. `
    : "";

  const timeWindow = {
    from: session.timeFrom?.toISOString() || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    to: session.timeTo?.toISOString() || now,
  };

  switch (mode) {
    case "PMESII": {
      const pmesiiResult = await generatePMESIIAnalysis(
        `${contextInfo}${prompt}`,
        session.trainingCountry || undefined
      );
      return {
        schema_version: "1.0",
        mode: "PMESII",
        title: `PMESII Analysis: ${session.aoiLabel || "Current Region"}`,
        time_window: timeWindow,
        pmesii: pmesiiResult,
        confidence: calculateConfidenceFromAnalysis(pmesiiResult),
        claims: extractClaims(pmesiiResult, "PMESII"),
        citations: [],
        actions: [],
        audit: { tools_used: ["generatePMESIIAnalysis"], policy_flags: [] },
      };
    }

    case "RISK_BRIEF": {
      const riskData = await calculateRiskScore({
        label: session.aoiLabel || "Area of Interest",
        query: prompt,
      });
      
      // AI-generated risk assessment has no real artifact references
      const riskConfidenceContext: ConfidenceContext = {
        evidenceCount: 0,
        reliabilityGrades: [],
        hasRecentEvidence: false,
      };
      
      return {
        schema_version: "1.0",
        mode: "RISK_BRIEF",
        title: `Risk Brief: ${session.aoiLabel || "Current Region"}`,
        time_window: timeWindow,
        risks: [
          {
            title: "Overall Risk Assessment",
            severity: riskData.score > 0.8 ? "CRITICAL" : 
                     riskData.score > 0.6 ? "HIGH" :
                     riskData.score > 0.4 ? "MEDIUM" : "LOW",
            score: Math.round(riskData.score * 100),
            drivers: riskData.factors || [],
            mitigations: [],
            trend: "Unknown",
          }
        ],
        confidence: calculateDeterministicConfidence(riskConfidenceContext),
        claims: [],
        citations: [],
        actions: [],
        audit: { tools_used: ["calculateRiskScore"], policy_flags: [] },
      };
    }

    case "SITREP": {
      const response = await processTacticalQuery(
        `${contextInfo}Generate a situation report (SITREP) addressing: ${prompt}`,
        [],
        session.trainingCountry || undefined
      );
      
      // AI-generated SITREP has no real artifact references
      const sitrepConfidenceContext: ConfidenceContext = {
        evidenceCount: 0,
        reliabilityGrades: [],
        hasRecentEvidence: false,
      };
      
      return {
        schema_version: "1.0",
        mode: "SITREP",
        title: `Situation Report: ${session.aoiLabel || "Current Operations"}`,
        time_window: timeWindow,
        sections: [
          {
            heading: "Situation Overview",
            bullets: response.split('\n').filter(line => line.trim()).slice(0, 5),
          },
          {
            heading: "Key Developments",
            bullets: response.split('\n').filter(line => line.trim()).slice(5, 10),
          }
        ],
        confidence: calculateDeterministicConfidence(sitrepConfidenceContext),
        claims: [],
        citations: [],
        actions: [],
        audit: { tools_used: ["processTacticalQuery"], policy_flags: [] },
      };
    }

    case "GRAPH_QUERY": {
      const nodes = await storage.getGraphNodes({ limit: 20 });
      const edges = await storage.getGraphEdges();
      
      // Graph nodes are real structured data; count as evidence but don't fabricate reliability grades
      const graphConfidenceContext: ConfidenceContext = {
        evidenceCount: Math.min(nodes.total, 10),
        reliabilityGrades: [],
        hasRecentEvidence: nodes.total > 0,
        independentSources: Math.min(nodes.total, 5),
      };
      
      return {
        schema_version: "1.0",
        mode: "GRAPH_QUERY",
        title: `Graph Query: ${prompt.slice(0, 50)}...`,
        time_window: timeWindow,
        question: prompt,
        answer: {
          summary: `Found ${nodes.total} nodes and ${edges.length} edges related to your query.`,
          nodes: nodes.nodes.slice(0, 10),
          edges: edges.slice(0, 10),
          paths: [],
        },
        confidence: calculateDeterministicConfidence(graphConfidenceContext),
        claims: [],
        citations: [],
        actions: [],
        audit: { tools_used: ["getGraphNodes", "getGraphEdges"], policy_flags: [] },
      };
    }

    case "ARTIFACT_SUMMARY": {
      const sources = await storage.getUploadedSources();
      
      // Artifacts are real uploaded files; count as evidence but don't fabricate reliability grades
      const artifactConfidenceContext: ConfidenceContext = {
        evidenceCount: sources.length,
        reliabilityGrades: [],
        hasRecentEvidence: sources.length > 0,
        independentSources: sources.length,
      };
      
      return {
        schema_version: "1.0",
        mode: "ARTIFACT_SUMMARY",
        title: `Artifact Summary`,
        time_window: timeWindow,
        artifacts: sources.slice(0, 10).map(s => ({
          id: s.id,
          filename: s.filename,
          summary: s.summary || "No summary available",
        })),
        confidence: calculateDeterministicConfidence(artifactConfidenceContext),
        claims: [],
        citations: [],
        actions: [],
        audit: { tools_used: ["getUploadedSources"], policy_flags: [] },
      };
    }

    case "MISSION_SUPPORT": {
      const response = await processTacticalQuery(
        `${contextInfo}Provide mission support analysis for: ${prompt}`,
        [],
        session.trainingCountry || undefined
      );
      
      // AI-generated mission support has no real artifact references
      const missionConfidenceContext: ConfidenceContext = {
        evidenceCount: 0,
        reliabilityGrades: [],
        hasRecentEvidence: false,
      };
      
      return {
        schema_version: "1.0",
        mode: "MISSION_SUPPORT",
        title: `Mission Support: ${prompt.slice(0, 50)}...`,
        time_window: timeWindow,
        analysis: response,
        recommendations: response.split('\n').filter(line => line.trim()).slice(0, 5),
        confidence: calculateDeterministicConfidence(missionConfidenceContext),
        claims: [],
        citations: [],
        actions: [],
        audit: { tools_used: ["processTacticalQuery"], policy_flags: [] },
      };
    }

    case "DEGRADED":
    default: {
      const degradedConfidenceContext: ConfidenceContext = {
        evidenceCount: 0,
        reliabilityGrades: [],
        hasRecentEvidence: false,
      };
      
      return {
        schema_version: "1.0",
        mode: "DEGRADED",
        title: "Degraded Mode Response",
        time_window: timeWindow,
        degraded_reason: "AI_UNAVAILABLE",
        deterministic_outputs: {
          graph_findings: [],
          stored_pmesii_used: false,
          risk_rules_applied: false,
        },
        confidence: calculateDeterministicConfidence(degradedConfidenceContext),
        claims: [],
        citations: [],
        actions: [],
        audit: { tools_used: [], policy_flags: ["degraded_mode"] },
      };
    }
  }
}

// Helper to calculate confidence from PMESII analysis results
// AI-generated summaries without real artifact references count as 0 evidence sources
function calculateConfidenceFromAnalysis(result: Record<string, unknown>): { level: "Low" | "Med" | "High"; score: number; basis: string[] } {
  let dimensionCount = 0;
  
  if (result && typeof result === "object") {
    dimensionCount = Object.keys(result).length;
  }

  const context: ConfidenceContext = {
    evidenceCount: 0,
    reliabilityGrades: [],
    hasRecentEvidence: false,
    pmesiiDimensionsCovered: dimensionCount,
  };

  return calculateDeterministicConfidence(context);
}

// Helper to extract claims from analysis (claims without evidence are ASSUMPTION)
function extractClaims(result: Record<string, unknown>, mode: string): Array<Record<string, unknown>> {
  const claims: Array<Record<string, unknown>> = [];
  let claimId = 1;

  if (mode === "PMESII" && result) {
    for (const [dimension, data] of Object.entries(result)) {
      if (data && typeof data === "object" && "summary" in (data as Record<string, unknown>)) {
        const claimContext: ConfidenceContext = {
          evidenceCount: 0,
          reliabilityGrades: [],
          hasRecentEvidence: false,
          claimTag: "ASSUMPTION",
        };
        
        claims.push({
          id: `claim_${claimId++}`,
          text: (data as Record<string, unknown>).summary as string,
          tag: "ASSUMPTION",
          confidence: calculateDeterministicConfidence(claimContext),
          evidence: [],
          related_nodes: [],
        });
      }
    }
  }

  return claims;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Google Maps API key endpoint
  app.get("/api/config/maps", (req, res) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: "Google Maps API key not configured" 
      });
    }
    res.json({ 
      success: true, 
      apiKey: apiKey 
    });
  });

  // Chat endpoint with streaming support
  app.post("/api/chat", async (req, res) => {
    try {
      const { query, contextIds, persona } = chatQuerySchema.parse(req.body);
      
      // AUDIT LOG: Log all chat queries for OPSEC review
      console.log(`[AUDIT] Chat query logged | timestamp=${new Date().toISOString()} | query="${query.substring(0, 100)}${query.length > 100 ? '...' : ''}" | contextIds=${contextIds?.length || 0} | ip=${req.ip}`);
      
      // Set up Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.flushHeaders();
      
      // Save user message
      const userMessage = await storage.createChatMessage({
        content: query,
        role: "user",
        contextIds: contextIds || []
      });
      
      // Send user message confirmation
      res.write(`data: ${JSON.stringify({ type: 'user_message', data: userMessage })}\n\n`);
      
      // Get context from both chat messages and analysis results
      const contextStrings: string[] = [];
      
      
      if (contextIds && contextIds.length > 0) {
        // Get all chat messages (not limited to 10)
        const allMessages = await storage.getChatMessages(200);
        const referencedMessages = allMessages.filter(msg => contextIds.includes(msg.id));
        contextStrings.push(...referencedMessages.map(msg => msg.content));
        
        // Get referenced analysis results (for media context)
        const analysisResults = await storage.getAnalysisResults();
        const referencedAnalysis = analysisResults.filter(result => contextIds.includes(result.id));
        contextStrings.push(...referencedAnalysis.map(result => {
          if (typeof result.results === 'object') {
            return JSON.stringify(result.results);
          }
          return String(result.results);
        }));
      }

      // Send typing indicator
      res.write(`data: ${JSON.stringify({ type: 'typing', data: { isTyping: true } })}\n\n`);

      // Fetch individual query history for this operator (personalization layer)
      const priorQueries = persona?.callsign
        ? await storage.getQueryHistoryForCallsign(persona.callsign, 8)
        : [];

      // Detect if query is location-based (for Gemini Google Maps grounding)
      const locationKeywords = [
        'restaurant', 'hotel', 'hospital', 'school', 'pharmacy', 'gas station',
        'nearby', 'near me', 'within', 'close to', 'walking distance', 
        'places to', 'where can i', 'best', 'find', 'locate',
        'shopping', 'dining', 'accommodation', 'medical', 'fuel',
        'infrastructure within', 'facilities', 'amenities'
      ];
      
      const isLocationQuery = locationKeywords.some(keyword => 
        query.toLowerCase().includes(keyword)
      );

      // Build persona with role-default temporal horizon if not explicitly set
      const resolvedPersona = persona ? {
        ...persona,
        temporalHorizon: persona.temporalHorizon ?? (
          persona.role === "SOF Operator" ? "6h" :
          persona.role === "Commander" ? "24h" :
          persona.role === "Diplomatic Security Officer" ? "24h" :
          persona.role === "Executive Decision Maker" ? "24h" :
          persona.role === "Port Operations Analyst" ? "72h" :
          persona.role === "Civil Affairs Officer" ? "7d" :
          persona.role === "Psychological Operations Officer" ? "14d" :
          persona.role === "Planner" ? "30d" :
          persona.role === "Security Cooperation Officer" ? "90d" : "72h"
        )
      } : undefined;

      // Process the tactical query with persona context + individual query history
      const analysis = await processTacticalQuery(query, contextStrings, resolvedPersona, priorQueries);
      
      // Main bubble carries the BLUF only. The structured assessment card renders
      // findings, recommendations, sources, risk and confidence — no duplication.
      const assistantContent = analysis.summary;
      
      // Save assistant response with formatted content
      const assistantMessage = await storage.createChatMessage({
        content: assistantContent,
        role: "assistant",
        contextIds: []
      });

      // Save to individual query history for callsign-level personalization
      if (persona?.callsign) {
        const topic = analysis.summary
          ? analysis.summary.split(/[.!?]/)[0]?.trim().substring(0, 100)
          : undefined;
        storage.saveQueryHistory({
          callsign: persona.callsign,
          role: persona.role ?? "Intelligence Analyst",
          query: query.substring(0, 200),
          topic
        }).catch(() => {}); // fire-and-forget, non-blocking
      }
      
      // Send assistant response with analysis data
      res.write(`data: ${JSON.stringify({ 
        type: 'assistant_message', 
        data: { 
          message: assistantMessage,
          analysis,
          priorQueryCount: priorQueries.length
        }
      })}\n\n`);
      
      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      res.end();
      
    } catch (error) {
      console.error("Chat API error:", error);
      const message = getErrorMessage(error);
      
      // For streaming endpoints, send error as SSE event
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          data: { 
            error: message.includes('429') || message.includes('quota') 
              ? "OpenAI quota exceeded. Please try again later."
              : message || "Failed to process chat query",
            code: message.includes('429') || message.includes('quota') 
              ? 'quota_exceeded' 
              : 'server_error'
          }
        })}\n\n`);
        res.end();
      } else {
        handleOpenAIError(error, res);
      }
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(limit);
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // PMESII Analysis endpoint
  app.post("/api/analysis/pmesii", async (req, res) => {
    try {
      const { region, context, aoi } = pmesiiAnalysisRequestSchema.parse(req.body);
      
      const analysis = await generatePMESIIAnalysis(region, context, aoi);
      
      // Save analysis result with AOI metadata
      await storage.createAnalysisResult({
        analysisType: "pmesii",
        results: analysis,
        fileId: null,
        region: region,
        aoiData: aoi || null
      });

      res.json({ success: true, analysis, region, aoi });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // MVP: New PMESII Analysis endpoint with persistence (matches API contract)
  // Priority #1: No fallback - returns 503 DEGRADED_MODE on provider failure
  app.post("/api/analyze/pmesii", async (req, res) => {
    try {
      const { pmesiiAnalyzeRequestSchema } = await import("@shared/schema");
      const { generatePmesiiAnalysis, isProviderAvailable, ProviderError } = await import("./services/provider");
      
      // Validate request
      const parsed = pmesiiAnalyzeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request format",
          details: parsed.error.issues
        });
      }
      
      const { session_id, aoi, time_window_days, question } = parsed.data;
      
      // Check provider availability
      if (!isProviderAvailable()) {
        return res.status(503).json({
          success: false,
          mode: "DEGRADED_MODE",
          error: "AI provider not configured. Please set OPENAI_API_KEY.",
          code: "provider_unavailable",
          inference_performed: false,
          cached_result: null
        });
      }
      
      // Generate UUIDs BEFORE analysis and persistence for consistent tracking
      const analysisId = crypto.randomUUID();
      const sessionId = session_id || crypto.randomUUID();
      
      console.log(`[PMESII] Analyzing AOI: ${aoi.name} (${aoi.lat}, ${aoi.lon}) - ID: ${analysisId}`);
      
      try {
        // Generate analysis using the provider service
        const result = await generatePmesiiAnalysis(aoi, question, time_window_days);
        
        // Persist to database with IDs included
        try {
          await storage.createAnalysisResult({
            analysisType: "pmesii_mvp",
            results: {
              analysisId,
              sessionId,
              pmesii: result.pmesii,
              sigacts: result.sigacts,
              confidence: result.confidence,
              evidence: result.evidence,
              providerStatus: result.providerStatus
            },
            fileId: null,
            region: aoi.name,
            aoiData: aoi
          });
          console.log(`[PMESII] Analysis persisted: ${analysisId}`);
        } catch (dbError) {
          console.error("[PMESII] Failed to persist analysis:", dbError);
        }
        
        // Return successful response
        res.json({
          analysis_id: analysisId,
          session_id: sessionId,
          pmesii: result.pmesii,
          sigacts: result.sigacts,
          confidence: result.confidence,
          evidence: result.evidence,
          provider_status: result.providerStatus
        });
        
      } catch (providerError) {
        // Priority #1: Handle ProviderError with 503 DEGRADED_MODE
        if (providerError instanceof ProviderError) {
          console.warn(`[PMESII] Provider error (${providerError.code}): ${providerError.message}`);
          
          // Return 503 with cached data if available
          return res.status(503).json({
            success: false,
            mode: "DEGRADED_MODE",
            error: providerError.message,
            code: providerError.code,
            inference_performed: false,
            cached_result: providerError.cachedResult ? {
              analysis_id: analysisId,
              session_id: sessionId,
              pmesii: providerError.cachedResult.pmesii,
              sigacts: providerError.cachedResult.sigacts,
              confidence: {
                ...providerError.cachedResult.confidence,
                inputs: {
                  ...providerError.cachedResult.confidence.inputs,
                  model_status: "cached"
                }
              },
              evidence: providerError.cachedResult.evidence,
              provider_status: {
                ...providerError.cachedResult.providerStatus,
                mode: "cached",
                inference_performed: false
              }
            } : null,
            ui_banner: "System is in degraded mode. No new inference was performed."
          });
        }
        throw providerError;
      }
      
    } catch (error) {
      console.error("[PMESII] Analysis error:", error);
      handleOpenAIError(error, res);
    }
  });

  // Priority #4: SIGACT 5Ws extraction endpoint
  app.post("/api/analyze/sigacts", async (req, res) => {
    try {
      const { ProviderError, isProviderAvailable } = await import("./services/provider");
      
      // Request schema for SIGACT analysis
      const requestSchema = z.object({
        aoi: z.object({
          name: z.string(),
          lat: z.number(),
          lon: z.number(),
          bbox: z.array(z.number()).optional(),
        }),
        time_window_days: z.number().default(7),
        event_types: z.array(z.string()).optional(),
        sources: z.array(z.string()).optional(),
      });
      
      const parsed = requestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request format",
          details: parsed.error.issues
        });
      }
      
      const { aoi, time_window_days, event_types, sources } = parsed.data;
      
      if (!isProviderAvailable()) {
        return res.status(503).json({
          success: false,
          mode: "DEGRADED_MODE",
          error: "AI provider not configured",
          code: "provider_unavailable",
          inference_performed: false,
          sigacts: []
        });
      }
      
      const analysisId = crypto.randomUUID();
      console.log(`[SIGACT] Extracting events for: ${aoi.name} - ID: ${analysisId}`);
      
      // Use OpenAI to extract SIGACT events
      const openai = new (await import("openai")).default();
      
      const prompt = `Extract significant activities (SIGACTs) for the area: ${aoi.name} (${aoi.lat}, ${aoi.lon}).
Time window: Last ${time_window_days} days.
${event_types?.length ? `Focus on event types: ${event_types.join(", ")}` : ""}

Return a JSON array of events, each with:
{
  "who": "Actor/group involved",
  "what": "What happened",
  "where": "Specific location",
  "when": "Date/time (ISO format or relative)",
  "why": "Assessed motivation or cause",
  "event_type": "attack|protest|movement|infrastructure|political|other",
  "confidence": 0.0-1.0,
  "lat": latitude (if known),
  "lon": longitude (if known),
  "evidence_summary": "Brief source description"
}

Return realistic intelligence-style events based on your knowledge of the region.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a tactical intelligence analyst extracting SIGACT events." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2000,
        });
        
        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(responseText);
        const sigacts = parsed.sigacts || parsed.events || (Array.isArray(parsed) ? parsed : []);
        
        // Build evidence from SIGACT summaries
        const evidence = sigacts.map((s: any, idx: number) => ({
          source_type: "report",
          title: `SIGACT #${idx + 1}: ${s.what?.substring(0, 50) || "Event"}`,
          timestamp: s.when || new Date().toISOString(),
          excerpt: s.evidence_summary || s.what,
          relevance_score: Math.round((s.confidence || 0.5) * 100),
        }));
        
        res.json({
          analysis_id: analysisId,
          sigacts: sigacts.map((s: any) => ({
            who: s.who || "Unknown",
            what: s.what || "Unknown event",
            where: s.where || aoi.name,
            when: s.when || "Recent",
            why: s.why || "Under assessment",
            event_type: s.event_type || "other",
            confidence: s.confidence || 0.5,
            lat: s.lat,
            lon: s.lon,
            evidence_ids: [],
          })),
          evidence,
          inference_performed: true,
          provider_status: {
            model: "gpt-4o",
            mode: "live",
            tokens: completion.usage?.total_tokens || 0
          }
        });
        
      } catch (error: any) {
        console.error("[SIGACT] Extraction failed:", error.message);
        
        // Return 503 DEGRADED_MODE
        return res.status(503).json({
          success: false,
          mode: "DEGRADED_MODE",
          error: error.message,
          code: error.status === 429 ? "quota_exceeded" : "server_error",
          inference_performed: false,
          sigacts: [],
          ui_banner: "SIGACT extraction unavailable. No inference performed."
        });
      }
      
    } catch (error) {
      console.error("[SIGACT] Error:", error);
      handleOpenAIError(error, res);
    }
  });

  // File analysis endpoint
  app.post("/api/analysis/file", upload.single('file'), async (req, res) => {
    try {
      const { analysisType = 'general' } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          error: "No file provided" 
        });
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ 
          success: false, 
          error: "File too large. Maximum size is 50MB." 
        });
      }

      // Validate file type
      const supportedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!supportedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          success: false, 
          error: `Unsupported file type: ${file.mimetype}. Supported types: images (JPEG, PNG, GIF, WebP), text files, PDF, and Word documents.` 
        });
      }

      let content = '';
      let base64Image: string | undefined;

      // Handle different file types with proper content extraction
      if (file.mimetype.startsWith('image/')) {
        base64Image = file.buffer.toString('base64');
        content = `Image file: ${file.originalname}`;
      } else if (file.mimetype === 'text/plain') {
        content = file.buffer.toString('utf-8');
      } else if (file.mimetype === 'application/pdf') {
        // PDF text extraction temporarily disabled - provide basic file info
        content = `PDF document: ${file.originalname} (${Math.round(file.size / 1024)} KB) - text extraction to be implemented`;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const docxData = await mammoth.extractRawText({ buffer: file.buffer });
          content = docxData.value || `Word document: ${file.originalname} (could not extract text)`;
        } catch (error) {
          console.error('DOCX parsing error:', error);
          content = `Word document: ${file.originalname} (extraction failed)`;
        }
      } else if (file.mimetype === 'application/msword') {
        // DOC files are more complex to parse, provide basic info
        content = `Word document: ${file.originalname} (legacy .doc format - text extraction not supported)`;
      } else if (file.mimetype.startsWith('video/')) {
        content = `Video file: ${file.originalname} (${file.mimetype}) - visual analysis not yet supported`;
      } else {
        return res.status(400).json({ 
          success: false, 
          error: `Unsupported file type: ${file.mimetype}. Supported types: images, text, PDF, Word documents.` 
        });
      }

      // Determine source type based on mime type
      const getSourceType = (mimeType: string): string => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf')) return 'document';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'report';
        if (mimeType === 'text/plain') return 'intel_feed';
        return 'document';
      };

      let analysis: any = null;
      let processingError: string | undefined;
      let pmesiiCategories: string[] = [];
      let summary: string | undefined;

      try {
        analysis = await analyzeMultimodalContent(content, base64Image, analysisType);
        summary = analysis?.summary;
        pmesiiCategories = analysis?.categories || [];
      } catch (error: any) {
        console.error('[FileUpload] AI analysis failed:', error.message);
        processingError = error.message;
      }
      
      // Save as uploaded source (Priority #5: Real source feeds)
      const uploadedSource = await storage.createUploadedSource({
        filename: `${Date.now()}-${file.originalname}`,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        sourceType: getSourceType(file.mimetype),
        extractedText: content,
        summary,
        pmesiiCategories,
        relevanceScore: analysis ? 0.7 : 0.5, // Default relevance, can be updated
        isProcessed: !processingError,
        processingError,
      });

      // Also save analysis result (legacy support)
      const result = await storage.createAnalysisResult({
        analysisType,
        results: analysis || { error: processingError },
        fileId: file.originalname
      });

      res.json({ 
        success: true, 
        fileId: result.id,
        sourceId: uploadedSource.id,
        analysis,
        fileName: file.originalname,
        isProcessed: uploadedSource.isProcessed,
        processingError: uploadedSource.processingError
      });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // List uploaded sources endpoint (Priority #5: Real source feeds)
  app.get("/api/sources", async (req, res) => {
    try {
      const { region, processed } = req.query;
      
      let sources;
      if (processed === 'true') {
        sources = await storage.getProcessedSources(region as string);
      } else {
        sources = await storage.getUploadedSources(region as string);
      }

      res.json({
        success: true,
        sources: sources.map(s => ({
          id: s.id,
          filename: s.originalFilename,
          sourceType: s.sourceType,
          fileSize: s.fileSize,
          summary: s.summary,
          pmesiiCategories: s.pmesiiCategories,
          relevanceScore: s.relevanceScore,
          region: s.region,
          isProcessed: s.isProcessed,
          timestamp: s.timestamp,
        })),
        count: sources.length
      });
    } catch (error) {
      console.error('[Sources] Error listing sources:', error);
      res.status(500).json({ success: false, error: 'Failed to list sources' });
    }
  });

  // Get single uploaded source
  app.get("/api/sources/:id", async (req, res) => {
    try {
      const source = await storage.getUploadedSourceById(req.params.id);
      if (!source) {
        return res.status(404).json({ success: false, error: 'Source not found' });
      }

      res.json({
        success: true,
        source: {
          id: source.id,
          filename: source.originalFilename,
          sourceType: source.sourceType,
          fileSize: source.fileSize,
          extractedText: source.extractedText,
          summary: source.summary,
          pmesiiCategories: source.pmesiiCategories,
          relevanceScore: source.relevanceScore,
          lat: source.lat,
          lng: source.lng,
          region: source.region,
          isProcessed: source.isProcessed,
          processingError: source.processingError,
          timestamp: source.timestamp,
        }
      });
    } catch (error) {
      console.error('[Sources] Error getting source:', error);
      res.status(500).json({ success: false, error: 'Failed to get source' });
    }
  });

  // Delete uploaded source
  app.delete("/api/sources/:id", async (req, res) => {
    try {
      const success = await storage.deleteUploadedSource(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Source not found' });
      }

      res.json({ success: true, message: 'Source deleted' });
    } catch (error) {
      console.error('[Sources] Error deleting source:', error);
      res.status(500).json({ success: false, error: 'Failed to delete source' });
    }
  });

  // ============================================================
  // STRESS TEST HARNESS ENDPOINTS (for testing degraded mode)
  // ============================================================

  // Get current stress test configuration
  app.get("/api/stress/config", (req, res) => {
    res.json({
      success: true,
      config: getStressConfig(),
      availableScenarios: Object.keys(StressScenarios),
    });
  });

  // Update stress test configuration
  app.post("/api/stress/config", (req, res) => {
    try {
      const config = setStressConfig(req.body);
      res.json({
        success: true,
        config,
        message: config.enabled ? 'Stress testing ENABLED' : 'Stress testing disabled',
      });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Invalid configuration' });
    }
  });

  // Reset stress test configuration
  app.post("/api/stress/reset", (req, res) => {
    const config = resetStressConfig();
    res.json({
      success: true,
      config,
      message: 'Stress testing disabled and reset to defaults',
    });
  });

  // Apply a preset stress scenario
  app.post("/api/stress/scenario/:name", (req, res) => {
    const scenarioName = req.params.name as keyof typeof StressScenarios;
    
    if (!StressScenarios[scenarioName]) {
      return res.status(400).json({
        success: false,
        error: `Unknown scenario: ${scenarioName}`,
        availableScenarios: Object.keys(StressScenarios),
      });
    }
    
    const config = StressScenarios[scenarioName]();
    res.json({
      success: true,
      scenario: scenarioName,
      config,
      message: scenarioName === 'disabled' 
        ? 'Stress testing disabled' 
        : `Stress scenario '${scenarioName}' activated`,
    });
  });

  // Get stress test metrics
  app.get("/api/stress/metrics", (req, res) => {
    res.json({
      success: true,
      metrics: getStressMetrics(),
    });
  });

  // Reset stress test metrics
  app.post("/api/stress/metrics/reset", (req, res) => {
    resetStressMetrics();
    res.json({
      success: true,
      message: 'Metrics reset',
    });
  });

  // ==========================================
  // GRAPH INTELLIGENCE API - Filtering Support
  // ==========================================

  // Get graph nodes with advanced filtering
  app.get("/api/graph/nodes", async (req, res) => {
    try {
      const filters: any = {};
      
      // Parse query parameters
      if (req.query.q) filters.q = String(req.query.q);
      if (req.query.type_in) {
        filters.type_in = Array.isArray(req.query.type_in) 
          ? req.query.type_in 
          : String(req.query.type_in).split(',');
      }
      if (req.query.layer_in) {
        filters.layer_in = Array.isArray(req.query.layer_in) 
          ? req.query.layer_in 
          : String(req.query.layer_in).split(',');
      }
      if (req.query.status_in) {
        filters.status_in = Array.isArray(req.query.status_in) 
          ? req.query.status_in 
          : String(req.query.status_in).split(',');
      }
      if (req.query.severity_in) {
        filters.severity_in = Array.isArray(req.query.severity_in) 
          ? req.query.severity_in 
          : String(req.query.severity_in).split(',');
      }
      if (req.query.sensitivity_in) {
        filters.sensitivity_in = Array.isArray(req.query.sensitivity_in) 
          ? req.query.sensitivity_in 
          : String(req.query.sensitivity_in).split(',');
      }
      if (req.query.time_from) filters.time_from = String(req.query.time_from);
      if (req.query.time_to) filters.time_to = String(req.query.time_to);
      if (req.query.due_from) filters.due_from = String(req.query.due_from);
      if (req.query.due_to) filters.due_to = String(req.query.due_to);
      if (req.query.owner) filters.owner = String(req.query.owner);
      if (req.query.team) filters.team = String(req.query.team);
      if (req.query.has_location !== undefined) {
        filters.has_location = req.query.has_location === 'true';
      }
      if (req.query.limit) filters.limit = parseInt(String(req.query.limit), 10);
      if (req.query.offset) filters.offset = parseInt(String(req.query.offset), 10);

      const result = await storage.getGraphNodes(filters);
      
      res.json({
        success: true,
        ...result,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
    } catch (error) {
      console.error("[Graph API] Error fetching nodes:", error);
      res.status(500).json({ 
        success: false, 
        error: getErrorMessage(error) 
      });
    }
  });

  // Get single graph node
  app.get("/api/graph/nodes/:id", async (req, res) => {
    try {
      const node = await storage.getGraphNodeById(req.params.id);
      if (!node) {
        return res.status(404).json({ success: false, error: "Node not found" });
      }
      res.json({ success: true, node });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Create graph node
  app.post("/api/graph/nodes", async (req, res) => {
    try {
      const node = await storage.createGraphNode(req.body);
      res.status(201).json({ success: true, node });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Update graph node
  app.patch("/api/graph/nodes/:id", async (req, res) => {
    try {
      const node = await storage.updateGraphNode(req.params.id, req.body);
      if (!node) {
        return res.status(404).json({ success: false, error: "Node not found" });
      }
      res.json({ success: true, node });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Delete graph node
  app.delete("/api/graph/nodes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGraphNode(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Node not found" });
      }
      res.json({ success: true, message: "Node deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get graph edges (optionally for a specific node)
  app.get("/api/graph/edges", async (req, res) => {
    try {
      const nodeId = req.query.nodeId ? String(req.query.nodeId) : undefined;
      const edges = await storage.getGraphEdges(nodeId);
      res.json({ success: true, edges });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Create graph edge
  app.post("/api/graph/edges", async (req, res) => {
    try {
      const edge = await storage.createGraphEdge(req.body);
      res.status(201).json({ success: true, edge });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Delete graph edge
  app.delete("/api/graph/edges/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGraphEdge(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Edge not found" });
      }
      res.json({ success: true, message: "Edge deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // ==========================================
  // GIA (GuideRight Intelligence Assistant) API
  // ==========================================

  // Get all sessions
  app.get("/api/assistant/sessions", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const sessions = await storage.getAssistantSessions(status);
      res.json({ success: true, sessions });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get session by ID
  app.get("/api/assistant/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getAssistantSessionById(req.params.id);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      res.json({ success: true, session });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Create new session
  app.post("/api/assistant/sessions", async (req, res) => {
    try {
      const sessionData = insertAssistantSessionSchema.parse(req.body);
      const session = await storage.createAssistantSession(sessionData);
      res.status(201).json({ success: true, session });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Update session
  app.patch("/api/assistant/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateAssistantSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      res.json({ success: true, session });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Delete session
  app.delete("/api/assistant/sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAssistantSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }
      res.json({ success: true, message: "Session deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get messages for a session
  app.get("/api/assistant/sessions/:id/messages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getAssistantMessages(req.params.id, limit);
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Add message to session
  app.post("/api/assistant/sessions/:id/messages", async (req, res) => {
    try {
      const messageData = insertAssistantMessageSchema.parse({
        ...req.body,
        sessionId: req.params.id,
      });
      const message = await storage.createAssistantMessage(messageData);
      res.status(201).json({ success: true, message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Run analysis on session (main GIA endpoint)
  app.post("/api/assistant/sessions/:id/run", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getAssistantSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: "Session not found" });
      }

      const parseResult = giaRunRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid request body",
          details: parseResult.error.flatten()
        });
      }

      const { mode, prompt, context_overrides } = parseResult.data;

      const effectiveMode = mode || (session.defaultMode as GIAMode) || "SITREP";

      // Create user message
      const userMessage = await storage.createAssistantMessage({
        sessionId,
        role: "user",
        content: prompt,
        mode: effectiveMode,
        contextOverrides: context_overrides,
        status: "completed",
      });

      // Create run record
      const run = await storage.createAssistantRun({
        sessionId,
        messageId: userMessage.id,
        mode: effectiveMode,
        prompt,
        contextSnapshot: {
          aoi_label: session.aoiLabel,
          aoi_geometry: session.aoiGeometry,
          time_from: session.timeFrom,
          time_to: session.timeTo,
          training_country: session.trainingCountry,
          ...context_overrides,
        },
        engineState: "AI_ONLINE",
        status: "running",
      });

      // Execute analysis based on mode
      try {
        const result = await executeGIAAnalysis(effectiveMode, prompt, session);
        
        // Update run with result
        await storage.updateAssistantRun(run.id, {
          result,
          status: "completed",
          completedAt: new Date(),
        });

        // Create assistant response message
        await storage.createAssistantMessage({
          sessionId,
          role: "assistant",
          content: JSON.stringify(result),
          mode: effectiveMode,
          status: "completed",
        });

        res.json({ 
          success: true, 
          run_id: run.id,
          result 
        });
      } catch (analysisError) {
        // Update run with error
        await storage.updateAssistantRun(run.id, {
          status: "failed",
          errorMessage: getErrorMessage(analysisError),
          engineState: "DEGRADED",
        });

        throw analysisError;
      }
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // Get runs for a session
  app.get("/api/assistant/sessions/:id/runs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const runs = await storage.getAssistantRuns(req.params.id, limit);
      res.json({ success: true, runs });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get specific run
  app.get("/api/assistant/runs/:id", async (req, res) => {
    try {
      const run = await storage.getAssistantRunById(req.params.id);
      if (!run) {
        return res.status(404).json({ success: false, error: "Run not found" });
      }
      res.json({ success: true, run });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Context endpoints for GIA
  app.get("/api/context/aoi/current", async (req, res) => {
    try {
      // Get current AOI context from recent sessions or graph nodes
      const sessions = await storage.getAssistantSessions("active");
      const currentSession = sessions[0];
      
      if (currentSession?.aoiGeometry) {
        res.json({
          success: true,
          aoi: {
            label: currentSession.aoiLabel,
            geometry: currentSession.aoiGeometry,
            training_country: currentSession.trainingCountry,
          }
        });
      } else {
        res.json({ success: true, aoi: null });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // System status endpoint for GIA
  app.get("/api/system/status", async (req, res) => {
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      
      res.json({
        success: true,
        status: {
          engine_state: openaiKey ? "AI_ONLINE" : (geminiKey ? "DEGRADED" : "AI_UNAVAILABLE"),
          ai_providers: {
            openai: !!openaiKey,
            gemini: !!geminiKey,
          },
          database: true,
          features: {
            pmesii: true,
            risk_brief: true,
            sitrep: true,
            graph_query: true,
            artifact_summary: true,
          },
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Risk assessment endpoint
  app.post("/api/risk/assess", async (req, res) => {
    try {
      const { aoi } = riskAssessmentRequestSchema.parse(req.body);
      
      const riskData = await calculateRiskScore(aoi);
      
      // Save risk assessment
      await storage.createRiskAssessment({
        aoi,
        riskScore: riskData.score,
        riskFactors: riskData.factors
      });

      res.json({
        success: true,
        riskScore: Math.round(riskData.score * 100), // Convert to percentage
        riskLevel: riskData.score > 0.8 ? 'CRITICAL' : 
                   riskData.score > 0.6 ? 'HIGH' :
                   riskData.score > 0.4 ? 'MEDIUM' : 'LOW',
        factors: riskData.factors,
        assessment: riskData.assessment
      });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // Location-based intelligence analysis endpoint
  app.post("/api/analysis/location", async (req, res) => {
    try {
      const { lat, lng, radiusKm, analysisType, context } = locationAnalysisRequestSchema.parse(req.body);
      
      // Create location description for analysis
      const locationName = `Location ${lat.toFixed(4)}, ${lng.toFixed(4)} (${radiusKm}km radius)`;
      const analysisContext = context || `Tactical intelligence analysis for coordinates ${lat}, ${lng} within ${radiusKm}km radius.`;
      
      // Perform intelligence analysis based on type
      let analysis;
      if (analysisType === 'pmesii') {
        analysis = await generatePMESIIAnalysis(locationName, analysisContext);
      } else {
        analysis = await processTacticalQuery(
          `Analyze the tactical intelligence for location ${lat}, ${lng} with ${radiusKm}km radius. ${analysisContext}`,
          context ? [context] : undefined
        );
      }
      
      // Calculate risk score for the location
      const riskData = await calculateRiskScore({
        name: locationName,
        lat,
        lng,
        radiusKm
      });
      
      // Save analysis result with location metadata
      const result = await storage.createAnalysisResult({
        analysisType: analysisType === 'pmesii' ? 'pmesii' : 'intelligence',
        results: analysisType === 'pmesii' ? analysis : analysis,
        region: locationName,
        aoiData: { lat, lng, radiusKm },
        source: 'map_click'
      });

      // Calculate confidence score based on analysis type
      let confidence: number;
      if (analysisType === 'pmesii') {
        // For PMESII analysis, calculate average confidence from component scores
        const pmesiiAnalysis = analysis as any; // Cast to access PMESII properties
        const scores = [
          pmesiiAnalysis.political?.stabilityScore || 0.5,
          pmesiiAnalysis.military?.readinessScore || 0.5,
          pmesiiAnalysis.economic?.stabilityScore || 0.5,
          pmesiiAnalysis.social?.stabilityScore || 0.5,
          pmesiiAnalysis.information?.reliabilityScore || 0.5,
          pmesiiAnalysis.infrastructure?.integrityScore || 0.5
        ];
        confidence = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      } else {
        confidence = (analysis as any).confidence || 0.7;
      }

      res.json({
        success: true,
        analysis,
        riskScore: Math.round(riskData.score * 100),
        riskLevel: riskData.score > 0.8 ? 'CRITICAL' : 
                   riskData.score > 0.6 ? 'HIGH' :
                   riskData.score > 0.4 ? 'MEDIUM' : 'LOW',
        riskFactors: riskData.factors,
        riskAssessment: riskData.assessment,
        confidence: Math.round(confidence * 100), // Convert to percentage
        location: { lat, lng, radiusKm, name: locationName },
        resultId: result.id
      });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // Get analysis history
  app.get("/api/analysis/history", async (req, res) => {
    try {
      const fileId = req.query.fileId as string;
      const analysisType = req.query.analysisType as string;
      const region = req.query.region as string;
      
      let results;
      if (analysisType) {
        results = await storage.getAnalysisResultsByType(analysisType, region);
      } else {
        results = await storage.getAnalysisResults(fileId);
      }
      
      res.json({ success: true, results });
    } catch (error) {
      console.error("Analysis history error:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get risk assessment history
  app.get("/api/risk/history", async (req, res) => {
    try {
      const results = await storage.getRiskAssessments();
      res.json({ success: true, results });
    } catch (error) {
      console.error("Risk history error:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Waypoint endpoints
  app.get("/api/waypoints", async (req, res) => {
    try {
      const waypoints = await storage.getWaypoints();
      res.json({ success: true, waypoints });
    } catch (error) {
      console.error("Error getting waypoints:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  app.post("/api/waypoints", async (req, res) => {
    try {
      const waypointData = waypointRequestSchema.parse(req.body);
      const waypoint = await storage.createWaypoint(waypointData);
      res.json({ success: true, waypoint });
    } catch (error) {
      console.error("Error creating waypoint:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  app.put("/api/waypoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = waypointRequestSchema.partial().parse(req.body);
      const waypoint = await storage.updateWaypoint(id, updates);
      
      if (!waypoint) {
        return res.status(404).json({ success: false, error: "Waypoint not found" });
      }
      
      res.json({ success: true, waypoint });
    } catch (error) {
      console.error("Error updating waypoint:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  app.delete("/api/waypoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteWaypoint(id);
      
      if (!success) {
        return res.status(404).json({ success: false, error: "Waypoint not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting waypoint:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Geotagged file endpoints
  app.get("/api/geotagged", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      let files;
      if (lat && lng && radius) {
        files = await storage.getGeotaggedFilesByLocation(
          parseFloat(lat as string),
          parseFloat(lng as string),
          parseFloat(radius as string)
        );
      } else {
        files = await storage.getGeotaggedFiles();
      }
      
      res.json({ success: true, files });
    } catch (error) {
      console.error("Error getting geotagged files:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  app.post("/api/geotagged", async (req, res) => {
    try {
      const geotagData = geotagRequestSchema.parse(req.body);
      const file = await storage.createGeotaggedFile(geotagData);
      res.json({ success: true, file });
    } catch (error) {
      console.error("Error creating geotagged file:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  app.delete("/api/geotagged/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteGeotaggedFile(id);
      
      if (!success) {
        return res.status(404).json({ success: false, error: "Geotagged file not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting geotagged file:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Global search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const query = searchQuerySchema.parse({
        q: req.query.q,
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      });
      
      // AUDIT LOG: Log all search queries for OPSEC review
      console.log(`[AUDIT] Search query logged | timestamp=${new Date().toISOString()} | query="${query.q}" | filters=${JSON.stringify(query.filters || {})} | ip=${req.ip}`);
      
      const results = await storage.searchAll(query);
      
      // Group results by type for easier frontend handling
      const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.type]) {
          acc[result.type] = [];
        }
        acc[result.type].push(result);
        return acc;
      }, {} as Record<string, typeof results>);
      
      res.json({ 
        success: true, 
        results,
        grouped: groupedResults,
        total: results.length
      });
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Timeline events endpoint
  app.get("/api/timeline", async (req, res) => {
    try {
      const query = timelineQuerySchema.parse({
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      });
      
      const events = await storage.getTimelineEvents(query);
      
      res.json({ 
        success: true, 
        events,
        total: events.length
      });
    } catch (error) {
      console.error("Error fetching timeline events:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Social Media Intelligence endpoints
  
  // Get social media posts with filters  
  app.get("/api/social-media/posts", async (req, res) => {
    try {
      // Validate query parameters with normalization
      const queryData = {
        lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radiusKm: req.query.radiusKm ? parseFloat(req.query.radiusKm as string) : undefined,
        sentiment: req.query.sentiment ? (req.query.sentiment as string).toUpperCase() : undefined,
        country: req.query.country as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };
      
      // Remove undefined values and validate
      const filters = Object.fromEntries(
        Object.entries(queryData).filter(([_, v]) => v !== undefined)
      );
      
      if (Object.keys(filters).length > 0) {
        const validatedFilters = socialMediaQuerySchema.parse(filters);
        const posts = await storage.getSocialMediaPosts(validatedFilters);
        res.json({ success: true, posts, total: posts.length });
      } else {
        const posts = await storage.getSocialMediaPosts();
        res.json({ success: true, posts, total: posts.length });
      }
    } catch (error) {
      console.error("Error fetching social media posts:", error);
      res.status(400).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get social media posts by location
  app.get("/api/social-media/location/:lat/:lng/:radius", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lng = parseFloat(req.params.lng);
      const radius = parseFloat(req.params.radius);
      
      const posts = await storage.getSocialMediaPostsByLocation(lat, lng, radius);
      
      res.json({ 
        success: true, 
        posts,
        total: posts.length,
        location: { lat, lng, radius }
      });
    } catch (error) {
      console.error("Error fetching social media posts by location:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get social media posts by sentiment
  app.get("/api/social-media/sentiment/:sentiment", async (req, res) => {
    try {
      const sentiment = req.params.sentiment.toUpperCase();
      const posts = await storage.getSocialMediaPostsBySentiment(sentiment);
      
      res.json({ 
        success: true, 
        posts,
        total: posts.length,
        sentiment
      });
    } catch (error) {
      console.error("Error fetching social media posts by sentiment:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Get social media influencers
  app.get("/api/social-media/influencers", async (req, res) => {
    try {
      const minFollowers = req.query.minFollowers ? parseInt(req.query.minFollowers as string) : 1000;
      const influencers = await storage.getSocialMediaInfluencers(minFollowers);
      
      res.json({ 
        success: true, 
        influencers,
        total: influencers.length,
        criteria: { minFollowers }
      });
    } catch (error) {
      console.error("Error fetching social media influencers:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Import social media data from Excel file
  app.post("/api/social-media/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      let socialMediaData: any[];

      try {
        if (req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls')) {
          // Process Excel file directly from buffer
          const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          socialMediaData = XLSX.utils.sheet_to_json(worksheet);
          
          console.log(`Processing Excel file with ${socialMediaData.length} rows`);
        } else {
          return res.status(400).json({ 
            success: false, 
            error: "Unsupported file format. Please upload an Excel file (.xlsx or .xls)" 
          });
        }

        if (!Array.isArray(socialMediaData) || socialMediaData.length === 0) {
          return res.status(400).json({ success: false, error: "No data found in Excel file" });
        }

        // Transform and validate each row
        const transformedPosts: InsertSocialMediaPost[] = [];
        const errors: string[] = [];

        for (let i = 0; i < Math.min(socialMediaData.length, 5000); i++) { // Limit to 5000 posts for performance
          const row = socialMediaData[i];
          
          try {
            const transformedPost: InsertSocialMediaPost = {
              universalMessageId: row['Universal Message ID'] || `EXCEL_${Date.now()}_${i}`,
              socialNetwork: row['Social Network'] || 'UNKNOWN',
              senderUserId: row['Sender User ID'] || `user_${i}`,
              senderScreenName: row['Sender Screen Name'] || 'Unknown',
              senderListedName: row['Sender Listed Name'] || null,
              senderProfileImgUrl: row['Sender Profile Img URL'] || null,
              senderProfileLink: row['Sender Profile Link'] || null,
              senderFollowersCount: parseFloat(row['Sender Followers Count']) || 0,
              senderInfluencerScore: parseFloat(row['Sender Influencer Score']) || null,
              senderAge: parseFloat(row['Sender Age']) || null,
              senderGender: row['Sender Gender'] || null,
              originalAuthor: row['Original Author'] || null,
              originalAuthorProfileLink: row['Original Author Profile Link'] || null,
              title: row['Title'] || null,
              message: row['Message'] || '',
              messageType: row['Message Type'] || 'Post',
              createdTime: parseFloat(row['Created Time']) || Date.now() / 1000,
              language: row['Language'] || null,
              languageCode: row['Language Code'] || null,
              countryCode: row['Country Code'] || null,
              mediaTypeList: row['Media Type List'] || null,
              permalink: row['Permalink'] || `https://example.com/post/${i}`,
              domain: row['Domain'] || null,
              retweets: parseFloat(row['Retweets']) || 0,
              tweetGenerator: row['Tweet Generator'] || null,
              favorites: parseFloat(row['Favorites']) || 0,
              sentiment: row['Sentiment'] || null,
              location: row['Location'] || null,
              country: row['Country'] || null,
              state: row['State'] || null,
              city: row['City'] || null,
              lat: parseFloat(row['Lat']) || null,
              lng: parseFloat(row['Lng']) || null,
              conversationId: row['Conversation ID'] || null,
              campaignName: row['Campaign Name'] || null,
              isSpam: Boolean(row['Is Spam']) || false
            };

            // Validate the transformed post
            const validatedPost = insertSocialMediaPostSchema.parse(transformedPost);
            transformedPosts.push(validatedPost);
          } catch (validationError) {
            errors.push(`Row ${i + 1}: ${getErrorMessage(validationError)}`);
            if (errors.length > 10) break; // Limit error collection
          }
        }

        if (transformedPosts.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: "No valid social media posts found in Excel file",
            sampleErrors: errors.slice(0, 5)
          });
        }

        // Import validated data into storage
        const imported = await storage.createSocialMediaPostsBulk(transformedPosts);
        
        res.json({ 
          success: true, 
          message: `Successfully imported ${imported.length} social media posts from Excel file`,
          imported: imported.length,
          errors: errors.length,
          sample: imported.slice(0, 3).map(post => ({
            id: post.id,
            message: post.message.substring(0, 100),
            location: post.location,
            sentiment: post.sentiment,
            lat: post.lat,
            lng: post.lng
          }))
        });

      } catch (processingError) {
        console.error("Error processing Excel file:", processingError);
        res.status(500).json({ 
          success: false, 
          error: `Error processing Excel file: ${getErrorMessage(processingError)}` 
        });
      }
    } catch (error) {
      console.error("Error importing social media data:", error);
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  });

  // Weather endpoints
  
  // Get current weather data
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lng, current_only } = req.query;
      const latitude = lat ? parseFloat(lat as string) : undefined;
      const longitude = lng ? parseFloat(lng as string) : undefined;
      const isCurrentOnly = current_only === 'true';
      
      const weatherData = await storage.getWeatherData(latitude, longitude, isCurrentOnly);
      
      res.json({ 
        success: true, 
        weather: weatherData,
        total: weatherData.length
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  });

  // Fetch weather data from Open-Meteo API and store it
  app.post("/api/weather", async (req, res) => {
    try {
      const { lat, lng, location, includeForecast, forecastDays } = weatherRequestSchema.parse(req.body);
      
      // Fetch from Open-Meteo API
      const weatherData = await fetchWeatherFromOpenMeteo(lat, lng, includeForecast, forecastDays);
      
      // Store current weather
      if (weatherData.current) {
        await storage.createWeatherData({
          lat,
          lng,
          location: location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          weatherCode: weatherData.current.weather_code?.toString() || '0',
          temperature: weatherData.current.temperature_2m || 0,
          apparentTemperature: weatherData.current.apparent_temperature,
          humidity: weatherData.current.relative_humidity_2m,
          dewPoint: weatherData.current.dew_point_2m,
          precipitation: weatherData.current.precipitation,
          precipitationProbability: null, // Not available in current data
          windSpeed: weatherData.current.wind_speed_10m,
          windDirection: weatherData.current.wind_direction_10m,
          windGusts: weatherData.current.wind_gusts_10m,
          pressure: weatherData.current.surface_pressure,
          visibility: null, // Not available in Open-Meteo API
          cloudCover: weatherData.current.cloud_cover,
          uvIndex: weatherData.current.uv_index,
          isCurrentWeather: true,
          forecastTime: null,
          dataSource: "open-meteo"
        });
      }
      
      // Store forecast data if requested
      if (includeForecast && weatherData.daily) {
        for (let i = 0; i < Math.min(weatherData.daily.time.length, forecastDays || 7); i++) {
          await storage.createWeatherData({
            lat,
            lng,
            location: location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            weatherCode: weatherData.daily.weather_code?.[i]?.toString() || '0',
            temperature: weatherData.daily.temperature_2m_max?.[i] || 0,
            apparentTemperature: weatherData.daily.apparent_temperature_max?.[i],
            humidity: null, // Not available in daily data
            dewPoint: null,
            precipitation: weatherData.daily.precipitation_sum?.[i],
            precipitationProbability: weatherData.daily.precipitation_probability_max?.[i],
            windSpeed: weatherData.daily.wind_speed_10m_max?.[i],
            windDirection: weatherData.daily.wind_direction_10m_dominant?.[i],
            windGusts: weatherData.daily.wind_gusts_10m_max?.[i],
            pressure: null,
            visibility: null,
            cloudCover: null,
            uvIndex: weatherData.daily.uv_index_max?.[i],
            isCurrentWeather: false,
            forecastTime: new Date(weatherData.daily.time[i]),
            dataSource: "open-meteo"
          });
        }
      }
      
      res.json({ 
        success: true, 
        message: "Weather data fetched and stored successfully",
        data: weatherData
      });
    } catch (error) {
      console.error("Error fetching weather from Open-Meteo:", error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  });

  // Get weather alerts
  app.get("/api/weather/alerts", async (req, res) => {
    try {
      const { lat, lng, active_only } = req.query;
      const latitude = lat ? parseFloat(lat as string) : undefined;
      const longitude = lng ? parseFloat(lng as string) : undefined;
      const activeOnly = active_only === 'true';
      
      const alerts = await storage.getWeatherAlerts(latitude, longitude, activeOnly);
      
      res.json({ 
        success: true, 
        alerts,
        total: alerts.length
      });
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  });

  // Create weather alert
  app.post("/api/weather/alerts", async (req, res) => {
    try {
      const alertData = weatherAlertRequestSchema.parse(req.body);
      
      const alert = await storage.createWeatherAlert({
        lat: alertData.lat,
        lng: alertData.lng,
        location: alertData.location,
        alertType: alertData.alertType,
        severity: alertData.severity,
        title: alertData.title,
        description: alertData.description,
        startTime: new Date(alertData.startTime),
        endTime: alertData.endTime ? new Date(alertData.endTime) : undefined,
        isActive: true,
        weatherData: alertData.weatherData
      });
      
      res.json({ 
        success: true, 
        alert
      });
    } catch (error) {
      console.error("Error creating weather alert:", error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  });

  // Export test endpoint
  app.get("/api/export/test", (req, res) => {
    const testExport = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      type: "test_export",
      data: {
        aoi: {
          name: "Test Location",
          lat: 23.8103,
          lng: 90.4125,
          radiusKm: 5
        },
        activePanels: {
          top: "intelligence",
          bottom: "timeline"
        },
        sampleData: {
          riskScore: 65,
          confidence: {
            belief: 0.75,
            disbelief: 0.15,
            uncertainty: 0.10
          },
          pmesii: {
            political: 0.6,
            military: 0.7,
            economic: 0.5,
            social: 0.8,
            information: 0.6,
            infrastructure: 0.4
          }
        },
        metadata: {
          exported: new Date().toISOString(),
          purpose: "QA Testing"
        }
      }
    };

    res.json({ success: true, ...testExport });
  });

  // Feedback submission endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = req.body;
      
      // Store feedback in storage
      console.log("Feedback received:", {
        exportResult: feedbackData.exportResult,
        timestamp: feedbackData.timestamp,
        hasNotes: !!feedbackData.notes
      });

      // In a real implementation, you would store this in the database
      // For now, we just log it
      
      res.status(201).json({ 
        success: true, 
        message: "Feedback received successfully" 
      });
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ 
        success: false, 
        error: (error as any).message 
      });
    }
  });

  // ============================================================================
  // GDELT Intelligence Routes (DB-first caching with background refresh)
  // ============================================================================
  
  // Active SSE connections for live refresh updates
  const gdeltRefreshClients: Map<string, { res: any; queryHash: string }> = new Map();
  
  // POST /api/intel/gdelt/query - Query cached GDELT data, return stale flag if needed
  app.post("/api/intel/gdelt/query", async (req, res) => {
    try {
      const { gdeltQueryRequestSchema } = await import("@shared/schema");
      const { generateQueryHash, isCacheStale } = await import("./services/gdelt");
      
      const parsed = gdeltQueryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request format",
          details: parsed.error.issues
        });
      }
      
      const { aoi, timeWindowDays, forceRefresh } = parsed.data;
      const queryHash = generateQueryHash({ aoi, timeWindowDays });
      
      console.log(`[GDELT Query] ${aoi.name} (hash: ${queryHash})`);
      
      // Get cache state
      const cacheState = await storage.getCacheState(queryHash);
      const isStale = !cacheState || isCacheStale(cacheState.lastRefreshAt, cacheState.ttlMinutes || 60);
      
      // Get cached events and docs
      const [events, docs] = await Promise.all([
        storage.getGdeltEvents(queryHash),
        storage.getGdeltDocs(queryHash)
      ]);
      
      // If stale or force refresh, trigger background refresh (non-blocking)
      if ((isStale || forceRefresh) && cacheState?.lastRefreshStatus !== "running") {
        console.log(`[GDELT Query] Cache stale, triggering background refresh`);
        
        // Fire and forget - don't await
        (async () => {
          try {
            const { refreshGdeltData, getDemoData } = await import("./services/gdelt");
            
            // Create refresh run
            const run = await storage.createRefreshRun({
              queryHash,
              aoiName: aoi.name,
              aoiLat: aoi.lat,
              aoiLon: aoi.lon,
              radiusKm: aoi.radiusKm,
              timeWindowDays,
              status: "running"
            });
            
            // Update cache state to running
            await storage.upsertCacheState({
              queryHash,
              aoiName: aoi.name,
              aoiLat: aoi.lat,
              aoiLon: aoi.lon,
              radiusKm: aoi.radiusKm,
              timeWindowDays,
              lastRefreshStatus: "running",
              ttlMinutes: 60
            });
            
            // Notify SSE clients
            gdeltRefreshClients.forEach((client) => {
              if (client.queryHash === queryHash) {
                client.res.write(`data: ${JSON.stringify({ type: "refresh_started", runId: run.id })}\n\n`);
              }
            });
            
            // Perform refresh
            let result = await refreshGdeltData({ aoi, timeWindowDays });
            
            // If GDELT returns empty (e.g., future date), use demo data for showcase
            if (result.success && result.eventsCount === 0 && result.docsCount === 0) {
              console.log(`[GDELT Background Refresh] No live data, using demo data for ${aoi.name}`);
              const demoData = getDemoData(aoi);
              result = {
                ...result,
                events: demoData.events,
                docs: demoData.docs,
                eventsCount: demoData.events.length,
                docsCount: demoData.docs.length
              };
            }
            
            if (result.success) {
              // Upsert events
              const eventInserts = result.events.map(e => ({ ...e, queryHash }));
              await storage.upsertGdeltEventsBulk(eventInserts as any);
              
              // Upsert docs
              const docInserts = result.docs.map(d => ({ ...d, queryHash }));
              await storage.upsertGdeltDocsBulk(docInserts as any);
              
              // Update cache state
              await storage.upsertCacheState({
                queryHash,
                aoiName: aoi.name,
                aoiLat: aoi.lat,
                aoiLon: aoi.lon,
                radiusKm: aoi.radiusKm,
                timeWindowDays,
                eventsCount: result.eventsCount,
                docsCount: result.docsCount,
                lastRefreshAt: new Date(),
                lastRefreshStatus: "success",
                ttlMinutes: 60
              });
              
              // Update run
              await storage.updateRefreshRun(run.id, {
                status: "success",
                eventsCount: result.eventsCount,
                docsCount: result.docsCount,
                completedAt: new Date(),
                durationMs: result.durationMs
              });
              
              // Notify SSE clients
              gdeltRefreshClients.forEach((client) => {
                if (client.queryHash === queryHash) {
                  client.res.write(`data: ${JSON.stringify({ 
                    type: "refresh_complete", 
                    eventsCount: result.eventsCount,
                    docsCount: result.docsCount,
                    durationMs: result.durationMs
                  })}\n\n`);
                }
              });
            } else {
              await storage.upsertCacheState({
                queryHash,
                aoiName: aoi.name,
                aoiLat: aoi.lat,
                aoiLon: aoi.lon,
                radiusKm: aoi.radiusKm,
                timeWindowDays,
                lastRefreshStatus: "error",
                ttlMinutes: 60
              });
              
              await storage.updateRefreshRun(run.id, {
                status: "error",
                errorMessage: result.error,
                completedAt: new Date(),
                durationMs: result.durationMs
              });
            }
          } catch (bgError) {
            console.error("[GDELT] Background refresh error:", bgError);
          }
        })();
      }
      
      // Return cached data immediately
      res.json({
        success: true,
        queryHash,
        aoi,
        coverage: {
          eventsCount: events.length,
          docsCount: docs.length,
          lastUpdated: cacheState?.lastRefreshAt || null,
          isStale,
          refreshing: cacheState?.lastRefreshStatus === "running"
        },
        events: events.slice(0, 100),
        docs: docs.slice(0, 100)
      });
      
    } catch (error) {
      console.error("[GDELT Query] Error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // POST /api/intel/gdelt/refresh - Force refresh GDELT data for AOI
  app.post("/api/intel/gdelt/refresh", async (req, res) => {
    try {
      const { gdeltRefreshRequestSchema } = await import("@shared/schema");
      const { generateQueryHash, refreshGdeltData, getDemoData } = await import("./services/gdelt");
      
      const parsed = gdeltRefreshRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid request format",
          details: parsed.error.issues
        });
      }
      
      const { aoi, timeWindowDays, themes } = parsed.data;
      const queryHash = generateQueryHash({ aoi, timeWindowDays, themes });
      
      console.log(`[GDELT Refresh] Starting: ${aoi.name} (hash: ${queryHash})`);
      
      // Create refresh run
      const run = await storage.createRefreshRun({
        queryHash,
        aoiName: aoi.name,
        aoiLat: aoi.lat,
        aoiLon: aoi.lon,
        radiusKm: aoi.radiusKm,
        timeWindowDays,
        status: "running"
      });
      
      // Update cache state
      await storage.upsertCacheState({
        queryHash,
        aoiName: aoi.name,
        aoiLat: aoi.lat,
        aoiLon: aoi.lon,
        radiusKm: aoi.radiusKm,
        timeWindowDays,
        lastRefreshStatus: "running",
        ttlMinutes: 60
      });
      
      // Perform refresh
      let result = await refreshGdeltData({ aoi, timeWindowDays, themes });
      
      // If GDELT returns empty (e.g., future date), use demo data for showcase
      if (result.success && result.eventsCount === 0 && result.docsCount === 0) {
        console.log(`[GDELT Refresh] No live data, using demo data for ${aoi.name}`);
        const demoData = getDemoData(aoi);
        result = {
          ...result,
          events: demoData.events,
          docs: demoData.docs,
          eventsCount: demoData.events.length,
          docsCount: demoData.docs.length
        };
      }
      
      if (result.success) {
        // Upsert events
        const eventInserts = result.events.map(e => ({ ...e, queryHash }));
        const eventsUpserted = await storage.upsertGdeltEventsBulk(eventInserts as any);
        
        // Upsert docs
        const docInserts = result.docs.map(d => ({ ...d, queryHash }));
        const docsUpserted = await storage.upsertGdeltDocsBulk(docInserts as any);
        
        // Update cache state
        await storage.upsertCacheState({
          queryHash,
          aoiName: aoi.name,
          aoiLat: aoi.lat,
          aoiLon: aoi.lon,
          radiusKm: aoi.radiusKm,
          timeWindowDays,
          eventsCount: result.eventsCount,
          docsCount: result.docsCount,
          lastRefreshAt: new Date(),
          lastRefreshStatus: "success",
          ttlMinutes: 60
        });
        
        // Update run
        await storage.updateRefreshRun(run.id, {
          status: "success",
          eventsCount: result.eventsCount,
          docsCount: result.docsCount,
          completedAt: new Date(),
          durationMs: result.durationMs
        });
        
        // Notify SSE clients
        gdeltRefreshClients.forEach((client) => {
          if (client.queryHash === queryHash) {
            client.res.write(`data: ${JSON.stringify({ 
              type: "refresh_complete", 
              eventsCount: result.eventsCount,
              docsCount: result.docsCount,
              durationMs: result.durationMs
            })}\n\n`);
          }
        });
        
        res.json({
          success: true,
          runId: run.id,
          queryHash,
          eventsCount: result.eventsCount,
          docsCount: result.docsCount,
          eventsUpserted,
          docsUpserted,
          durationMs: result.durationMs
        });
      } else {
        await storage.upsertCacheState({
          queryHash,
          aoiName: aoi.name,
          aoiLat: aoi.lat,
          aoiLon: aoi.lon,
          radiusKm: aoi.radiusKm,
          timeWindowDays,
          lastRefreshStatus: "error",
          ttlMinutes: 60
        });
        
        await storage.updateRefreshRun(run.id, {
          status: "error",
          errorMessage: result.error,
          completedAt: new Date(),
          durationMs: result.durationMs
        });
        
        res.status(500).json({
          success: false,
          runId: run.id,
          queryHash,
          error: result.error,
          durationMs: result.durationMs
        });
      }
      
    } catch (error) {
      console.error("[GDELT Refresh] Error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // GET /api/intel/gdelt/live - SSE stream for refresh status updates
  app.get("/api/intel/gdelt/live", async (req, res) => {
    const queryHash = req.query.queryHash as string;
    
    if (!queryHash) {
      return res.status(400).json({
        success: false,
        error: "queryHash parameter required"
      });
    }
    
    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();
    
    const clientId = crypto.randomUUID();
    gdeltRefreshClients.set(clientId, { res, queryHash });
    
    console.log(`[GDELT Live] Client connected: ${clientId} for hash ${queryHash}`);
    
    // Send initial state
    const cacheState = await storage.getCacheState(queryHash);
    res.write(`data: ${JSON.stringify({ 
      type: "connected", 
      clientId,
      cacheState: cacheState ? {
        eventsCount: cacheState.eventsCount,
        docsCount: cacheState.docsCount,
        lastRefreshAt: cacheState.lastRefreshAt,
        lastRefreshStatus: cacheState.lastRefreshStatus
      } : null
    })}\n\n`);
    
    // Keep-alive ping every 30s
    const pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`);
    }, 30000);
    
    // Cleanup on close
    req.on("close", () => {
      clearInterval(pingInterval);
      gdeltRefreshClients.delete(clientId);
      console.log(`[GDELT Live] Client disconnected: ${clientId}`);
    });
  });
  
  // GET /api/intel/gdelt/runs - Get recent refresh runs
  app.get("/api/intel/gdelt/runs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const runs = await storage.getRecentRefreshRuns(limit);
      res.json({ success: true, runs });
    } catch (error) {
      console.error("[GDELT Runs] Error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ============================================
  // Google Earth Engine - Population & Socioeconomic Data
  // ============================================
  
  // POST /api/intel/earth-engine/population - Get population density data
  app.post("/api/intel/earth-engine/population", async (req, res) => {
    try {
      const { queryEarthEngine } = await import("./services/earth-engine");
      
      const { lat, lon, radiusKm = 50, resolution = 'medium' } = req.body;
      
      if (lat === undefined || lon === undefined) {
        return res.status(400).json({
          success: false,
          error: "lat and lon are required"
        });
      }
      
      const result = await queryEarthEngine({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radiusKm: parseFloat(radiusKm),
        resolution
      });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("[Earth Engine] Error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // ============================================
  // Google Threat Intelligence - Cyber Threat Data
  // ============================================
  
  // POST /api/intel/threat/assessment - Get regional threat assessment
  app.post("/api/intel/threat/assessment", async (req, res) => {
    try {
      const { queryThreatIntelligence } = await import("./services/threat-intel");
      
      const { country, region, sectors, timeWindowDays = 30 } = req.body;
      
      if (!country) {
        return res.status(400).json({
          success: false,
          error: "country is required"
        });
      }
      
      const result = await queryThreatIntelligence({
        country,
        region,
        sectors,
        timeWindowDays
      });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("[Threat Intel] Error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // GET /api/intel/threat/status - Check if GTI API is configured
  app.get("/api/intel/threat/status", async (req, res) => {
    try {
      const { isGTIConfigured } = await import("./services/threat-intel");
      
      res.json({
        success: true,
        configured: isGTIConfigured(),
        source: isGTIConfigured() ? 'Google Threat Intelligence API' : 'Simulated Data (Demo)'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Gemini Integration Routes
  
  // Location-based intelligence query with Google Maps grounding
  app.post("/api/gemini/location", async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Query is required' 
        });
      }
      
      const location: LocationContext | undefined = 
        (latitude !== undefined && longitude !== undefined) 
          ? { latitude, longitude }
          : undefined;
      
      const result = await processLocationQuery(query, location);
      
      res.json({ 
        success: true, 
        response: result.text,
        groundingSources: result.groundingSources,
        hasGrounding: result.groundingSources.length > 0
      });
    } catch (error) {
      console.error("Gemini location query error:", error);
      res.status(500).json({ 
        success: false, 
        error: (error as any).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Open-Meteo API integration function
async function fetchWeatherFromOpenMeteo(lat: number, lng: number, includeForecast = false, forecastDays = 7) {
  const baseUrl = "https://api.open-meteo.com/v1/forecast";
  
  // Current weather parameters
  const currentParams = [
    "temperature_2m",
    "apparent_temperature", 
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "weather_code",
    "surface_pressure",
    "cloud_cover",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "uv_index"
  ].join(",");
  
  // Daily forecast parameters
  const dailyParams = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "wind_direction_10m_dominant",
    "wind_gusts_10m_max",
    "uv_index_max"
  ].join(",");
  
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: currentParams,
    timezone: "auto"
  });
  
  if (includeForecast) {
    params.append("daily", dailyParams);
    params.append("forecast_days", forecastDays.toString());
  }
  
  const url = `${baseUrl}?${params}`;
  console.log(`Fetching weather from Open-Meteo: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}