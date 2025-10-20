import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  processTacticalQuery, 
  generatePMESIIAnalysis, 
  analyzeMultimodalContent,
  calculateRiskScore
} from "./openai";
import {
  processLocationQuery,
  processTacticalQueryGemini,
  generatePMESIIAnalysisGemini,
  type LocationContext,
  type GeminiLocationResponse
} from "./gemini";
import {
  getODINCountriesList,
  getODINCountryData,
  getODINSummary,
  parseODINContent
} from "./odin";
import { 
  chatQuerySchema,
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
  type ChatQueryRequest,
  type RiskAssessmentRequest,
  type WaypointRequest,
  type GeotagRequest,
  type SearchQuery,
  type TimelineQuery,
  type WeatherRequest,
  type WeatherAlertRequest,
  type LocationAnalysisRequest,
  type SocialMediaQuery,
  type InsertSocialMediaPost
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
      const { query, contextIds, odinCountry } = chatQuerySchema.parse(req.body);
      
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
      
      // Add ODIN intelligence context if scenario is selected
      if (odinCountry) {
        try {
          const odinData = await getODINCountryData(odinCountry);
          if (odinData.success && odinData.data) {
            // Add PMESII intelligence from ODIN as context
            const odinContext = [
              `ODIN Intelligence Source: ${odinCountry}`,
              `Political: ${odinData.data.political || 'No data'}`,
              `Military: ${odinData.data.military || 'No data'}`,
              `Economic: ${odinData.data.economic || 'No data'}`,
              `Social: ${odinData.data.social || 'No data'}`,
              `Information: ${odinData.data.information || 'No data'}`,
              `Infrastructure: ${odinData.data.infrastructure || 'No data'}`
            ].join('\n');
            contextStrings.push(odinContext);
          }
        } catch (error) {
          console.error('ODIN data fetch error for chat:', error);
          // Continue without ODIN context if fetch fails
        }
      }
      
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

      // Process the tactical query
      const analysis = await processTacticalQuery(query, contextStrings);
      
      // Format assistant response content (consistent with frontend display)
      let assistantContent = analysis.summary;
      
      if (analysis.keyFindings?.length > 0) {
        assistantContent += `\n\nKey findings:\n${analysis.keyFindings.map((finding: string) => `• ${finding}`).join('\n')}`;
      }
      
      if (analysis.recommendations?.length > 0) {
        assistantContent += `\n\nRecommendations:\n${analysis.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}`;
      }
      
      assistantContent += `\n\nRisk Level: ${analysis.riskLevel}\nConfidence: ${Math.round(analysis.confidence * 100)}%`;
      
      // Save assistant response with formatted content and ODIN source attribution
      const assistantMessage = await storage.createChatMessage({
        content: assistantContent,
        role: "assistant",
        contextIds: [],
        odinSource: odinCountry // Persist ODIN source for data provenance
      });
      
      // Send assistant response with analysis data and ODIN source attribution
      res.write(`data: ${JSON.stringify({ 
        type: 'assistant_message', 
        data: { 
          message: assistantMessage,
          analysis,
          odinSource: odinCountry // Include ODIN source for attribution
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

      const analysis = await analyzeMultimodalContent(content, base64Image, analysisType);
      
      // Save analysis result
      const result = await storage.createAnalysisResult({
        analysisType,
        results: analysis,
        fileId: file.originalname
      });

      res.json({ 
        success: true, 
        fileId: result.id,
        analysis,
        fileName: file.originalname
      });
    } catch (error) {
      handleOpenAIError(error, res);
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

  // ODIN Integration Routes
  
  // Get list of available ODIN countries
  app.get("/api/odin/countries", async (req, res) => {
    try {
      const countries = await getODINCountriesList();
      res.json({ 
        success: true, 
        countries 
      });
    } catch (error) {
      console.error("Error fetching ODIN countries:", error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  });

  // Get PMESII data for a specific country
  app.get("/api/odin/country/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const result = await getODINCountryData(name);
      
      if (!result.success) {
        const status = result.error?.includes('not found') ? 404 : 502;
        return res.status(status).json({ 
          success: false, 
          error: result.error || 'Failed to fetch ODIN data'
        });
      }
      
      // Parse HTML content to text
      const dataSource = result.data || result.partialData || {};
      const parsed: any = {};
      
      const categories = ['political', 'military', 'economic', 'social', 'information', 'infrastructure'] as const;
      categories.forEach(category => {
        if (dataSource[category]) {
          parsed[category] = parseODINContent(dataSource[category]);
        }
      });
      
      res.json({ 
        success: true, 
        country: name,
        data: result.data ? parsed : undefined,
        partialData: result.partialData ? parsed : undefined,
        partial: !!result.partialData && !result.data,
        warnings: result.error
      });
    } catch (error) {
      console.error(`Error fetching ODIN data for ${req.params.name}:`, error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  });

  // Get summary for a specific PMESII category
  app.get("/api/odin/summary/:country/:category", async (req, res) => {
    try {
      const { country, category } = req.params;
      
      if (!['political', 'military', 'economic', 'social', 'information', 'infrastructure'].includes(category)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid category. Must be one of: political, military, economic, social, information, infrastructure' 
        });
      }
      
      const result = await getODINSummary(country, category as any);
      
      if (!result.success) {
        const status = result.error?.includes('not found') ? 404 : 502;
        return res.status(status).json({ 
          success: false, 
          error: result.error || 'Failed to fetch ODIN summary'
        });
      }
      
      res.json({ 
        success: true, 
        country,
        category,
        summary: result.summary
      });
    } catch (error) {
      console.error(`Error fetching ODIN summary:`, error);
      res.status(500).json({ success: false, error: (error as any).message });
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