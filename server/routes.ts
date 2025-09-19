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
  type ChatQueryRequest,
  type RiskAssessmentRequest
} from "@shared/schema";
import multer from "multer";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint with streaming support
  app.post("/api/chat", async (req, res) => {
    try {
      const { query, contextIds } = chatQuerySchema.parse(req.body);
      
      // Get context from previous messages or analysis results
      const contextMessages = contextIds && contextIds.length > 0 
        ? await storage.getChatMessages(10) 
        : [];
      
      const contextStrings = contextMessages
        .filter(msg => contextIds.includes(msg.id))
        .map(msg => msg.content);

      // Process the tactical query
      const analysis = await processTacticalQuery(query, contextStrings);
      
      // Save user message
      await storage.createChatMessage({
        content: query,
        role: "user",
        contextIds: contextIds || []
      });
      
      // Save assistant response
      const assistantMessage = await storage.createChatMessage({
        content: JSON.stringify(analysis),
        role: "assistant",
        contextIds: []
      });

      res.json({
        success: true,
        message: assistantMessage,
        analysis
      });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to process chat query" 
      });
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
      const { region, context } = req.body;
      
      if (!region) {
        return res.status(400).json({ 
          success: false, 
          error: "Region parameter is required" 
        });
      }

      const analysis = await generatePMESIIAnalysis(region, context);
      
      // Save analysis result
      await storage.createAnalysisResult({
        analysisType: "pmesii",
        results: analysis,
        fileId: null
      });

      res.json({ success: true, analysis });
    } catch (error) {
      console.error("PMESII analysis error:", error);
      res.status(500).json({ success: false, error: error.message });
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

      let content = '';
      let base64Image: string | undefined;

      // Handle different file types
      if (file.mimetype.startsWith('image/')) {
        base64Image = file.buffer.toString('base64');
        content = `Image file: ${file.originalname}`;
      } else if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
        content = file.buffer.toString('utf-8');
      } else {
        content = `File: ${file.originalname} (${file.mimetype})`;
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
      console.error("File analysis error:", error);
      res.status(500).json({ success: false, error: error.message });
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
      console.error("Risk assessment error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get analysis history
  app.get("/api/analysis/history", async (req, res) => {
    try {
      const fileId = req.query.fileId as string;
      const results = await storage.getAnalysisResults(fileId);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Analysis history error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get risk assessment history
  app.get("/api/risk/history", async (req, res) => {
    try {
      const assessments = await storage.getRiskAssessments();
      res.json({ success: true, assessments });
    } catch (error) {
      console.error("Risk history error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
