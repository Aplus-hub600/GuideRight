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
  chatQuerySchema,
  riskAssessmentRequestSchema,
  pmesiiAnalysisRequestSchema,
  type ChatQueryRequest,
  type RiskAssessmentRequest
} from "@shared/schema";
import multer from "multer";
// import pdfParse from "pdf-parse"; // Temporarily disabled due to initialization issues
import mammoth from "mammoth";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

function handleOpenAIError(error: any, res: any) {
  console.error("OpenAI error:", error);
  
  if (error.message?.includes('429') || error.message?.includes('quota')) {
    return res.status(429).json({ 
      success: false, 
      error: "OpenAI quota exceeded. Please try again later.",
      code: 'quota_exceeded'
    });
  }
  
  return res.status(500).json({ 
    success: false, 
    error: error.message || "Internal server error" 
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
      const { query, contextIds } = chatQuerySchema.parse(req.body);
      
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
      
      // Save assistant response with formatted content (consistent with display)
      const assistantMessage = await storage.createChatMessage({
        content: assistantContent,
        role: "assistant",
        contextIds: []
      });
      
      // Send assistant response with analysis data
      res.write(`data: ${JSON.stringify({ 
        type: 'assistant_message', 
        data: { 
          message: assistantMessage,
          analysis 
        }
      })}\n\n`);
      
      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      res.end();
      
    } catch (error) {
      console.error("Chat API error:", error);
      
      // For streaming endpoints, send error as SSE event
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          data: { 
            error: error.message?.includes('429') || error.message?.includes('quota') 
              ? "OpenAI quota exceeded. Please try again later."
              : error.message || "Failed to process chat query",
            code: error.message?.includes('429') || error.message?.includes('quota') 
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
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PMESII Analysis endpoint
  app.post("/api/analysis/pmesii", async (req, res) => {
    try {
      const { region, context, aoi } = pmesiiAnalysisRequestSchema.parse(req.body);
      
      const analysis = await generatePMESIIAnalysis(region, context);
      
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
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get risk assessment history
  app.get("/api/risk/history", async (req, res) => {
    try {
      const results = await storage.getRiskAssessments();
      res.json({ success: true, results });
    } catch (error) {
      console.error("Risk history error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}