import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  contextIds: jsonb("context_ids").$type<string[]>().default([]),
  odinSource: text("odin_source"), // ODIN scenario country for data attribution
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: text("file_id"),
  analysisType: text("analysis_type").notNull(), // 'pmesii', 'risk', 'intelligence', 'social', 'waypoint', 'geotagged', 'weather'
  results: jsonb("results").notNull(),
  region: text("region"), // Region/AOI name for PMESII analysis
  aoiData: jsonb("aoi_data"), // AOI coordinates and metadata
  source: text("source"), // External intelligence source (e.g., 'seerist', 'fraym', 'internal')
  sourceMetadata: jsonb("source_metadata"), // Source-specific metadata and attribution
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aoi: jsonb("aoi").notNull(), // Area of Interest data
  riskScore: real("risk_score").notNull(),
  riskFactors: jsonb("risk_factors").$type<string[]>().default([]),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const waypoints = pgTable("waypoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  type: text("type").notNull(), // 'cache', 'waypoint', 'target', 'safe_house'
  description: text("description"),
  intelligenceData: jsonb("intelligence_data"), // Associated tactical intelligence
  isActive: boolean("is_active").default(true),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const geotaggedFiles = pgTable("geotagged_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: text("file_id").notNull(),
  filename: text("filename").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  altitude: real("altitude"), // Elevation data if available
  accuracy: real("accuracy"), // GPS accuracy in meters
  source: text("source").notNull(), // 'exif', 'manual', 'device'
  metadata: jsonb("metadata"), // Additional EXIF or file metadata
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  location: text("location").notNull(), // Human-readable location name
  weatherCode: text("weather_code").notNull(), // WMO weather interpretation code
  temperature: real("temperature").notNull(), // Temperature in Celsius
  apparentTemperature: real("apparent_temperature"), // "Feels like" temperature
  humidity: real("humidity"), // Relative humidity percentage
  dewPoint: real("dew_point"), // Dew point in Celsius
  precipitation: real("precipitation"), // Precipitation amount in mm
  precipitationProbability: real("precipitation_probability"), // Probability of precipitation (0-100)
  windSpeed: real("wind_speed"), // Wind speed in km/h
  windDirection: real("wind_direction"), // Wind direction in degrees
  windGusts: real("wind_gusts"), // Wind gusts in km/h
  pressure: real("pressure"), // Sea level pressure in hPa
  visibility: real("visibility"), // Visibility in km
  cloudCover: real("cloud_cover"), // Total cloud cover percentage
  uvIndex: real("uv_index"), // UV index
  isCurrentWeather: boolean("is_current_weather").default(false), // True for current conditions, false for forecast
  forecastTime: timestamp("forecast_time"), // Future time for forecasts, null for current
  dataSource: text("data_source").default("open-meteo"), // API source
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const weatherAlerts = pgTable("weather_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  location: text("location").notNull(),
  alertType: text("alert_type").notNull(), // 'severe_weather', 'extreme_temperature', 'high_wind', 'precipitation'
  severity: text("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  title: text("title").notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").default(true),
  weatherData: jsonb("weather_data"), // Associated weather conditions
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const socialMediaPosts = pgTable("social_media_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  universalMessageId: text("universal_message_id").unique().notNull(),
  socialNetwork: text("social_network").notNull(), // 'TWITTER', 'FACEBOOK', etc.
  senderUserId: text("sender_user_id").notNull(),
  senderScreenName: text("sender_screen_name").notNull(),
  senderListedName: text("sender_listed_name"),
  senderProfileImgUrl: text("sender_profile_img_url"),
  senderProfileLink: text("sender_profile_link"),
  senderFollowersCount: real("sender_followers_count"),
  senderInfluencerScore: real("sender_influencer_score"),
  senderAge: real("sender_age"),
  senderGender: text("sender_gender"),
  originalAuthor: text("original_author"),
  originalAuthorProfileLink: text("original_author_profile_link"),
  title: text("title"),
  message: text("message").notNull(),
  messageType: text("message_type").notNull(), // 'X Update', 'X Repost', etc.
  createdTime: real("created_time").notNull(),
  language: text("language"),
  languageCode: text("language_code"),
  countryCode: text("country_code"),
  mediaTypeList: text("media_type_list"),
  permalink: text("permalink").notNull(),
  domain: text("domain"),
  retweets: real("retweets").default(0),
  tweetGenerator: text("tweet_generator"), // Platform/client used
  favorites: real("favorites").default(0),
  sentiment: text("sentiment"), // 'POSITIVE', 'NEGATIVE', 'NEUTRAL'
  location: text("location"),
  country: text("country"),
  state: text("state"),
  city: text("city"),
  lat: real("lat"),
  lng: real("lng"),
  conversationId: text("conversation_id"),
  campaignName: text("campaign_name"),
  isSpam: boolean("is_spam").default(false),
  platform: text("platform"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// User-uploaded intelligence sources (Priority #5: Real source feeds)
export const uploadedSources = pgTable("uploaded_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: real("file_size").notNull(), // Size in bytes
  sourceType: text("source_type").notNull(), // 'document', 'image', 'report', 'intel_feed'
  extractedText: text("extracted_text"), // Text extracted from document
  summary: text("summary"), // AI-generated summary
  pmesiiCategories: jsonb("pmesii_categories").$type<string[]>().default([]), // Relevant PMESII categories
  relevanceScore: real("relevance_score"), // 0-1 relevance for current analysis
  lat: real("lat"), // Optional geo-reference
  lng: real("lng"),
  region: text("region"), // Region/AOI this source applies to
  isProcessed: boolean("is_processed").default(false),
  processingError: text("processing_error"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Intelligence Graph Nodes - unified model for filterable intelligence items
export const graphNodes = pgTable("graph_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  description: text("description"),
  
  // Node type: Artifact, Milestone, Risk, Dependency, Decision, Partner
  nodeType: text("node_type").notNull(),
  
  // Intelligence layer: Evidence, Execution, Dependencies, Risk, PeopleOrgs, LegalIP
  layer: text("layer").notNull(),
  
  // Status: planned, in_progress, done, open, closed, pending, applied
  status: text("status").default("open"),
  
  // Severity: low, medium, high, critical
  severity: text("severity"),
  
  // Sensitivity classification: internal, cui, secret, etc.
  sensitivity: text("sensitivity").default("internal"),
  
  // Dates for filtering
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"), // For milestones
  
  // Location (optional)
  lat: real("lat"),
  lng: real("lng"),
  locationName: text("location_name"),
  
  // Owner/team attribution
  owner: text("owner"),
  team: text("team"),
  
  // Linked data (e.g., reference to source file, waypoint, etc.)
  linkedEntityType: text("linked_entity_type"), // 'waypoint', 'file', 'risk_assessment', etc.
  linkedEntityId: text("linked_entity_id"),
  
  // Additional metadata
  metadata: jsonb("metadata"),
  tags: jsonb("tags").$type<string[]>().default([]),
});

// Graph Edges - relationships between nodes
export const graphEdges = pgTable("graph_edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceNodeId: varchar("source_node_id").notNull(),
  targetNodeId: varchar("target_node_id").notNull(),
  edgeType: text("edge_type").notNull(), // 'depends_on', 'blocks', 'related_to', 'caused_by', etc.
  label: text("label"),
  weight: real("weight").default(1),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// GIA (GuideRight Intelligence Assistant) Tables
// ==========================================

// Assistant Sessions - tracks analysis sessions with context
export const assistantSessions = pgTable("assistant_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  
  // AOI context
  aoiLabel: text("aoi_label"),
  aoiGeometry: jsonb("aoi_geometry"), // GeoJSON geometry
  
  // Time window
  timeFrom: timestamp("time_from"),
  timeTo: timestamp("time_to"),
  
  // Scenario settings
  trainingCountry: text("training_country"), // ODIN training country
  isExercise: boolean("is_exercise").default(false),
  
  // Default settings
  defaultMode: text("default_mode").default("SITREP"), // PMESII, RISK_BRIEF, SITREP, GRAPH_QUERY, ARTIFACT_SUMMARY
  sensitivityMax: text("sensitivity_max").default("Internal"), // Max sensitivity level
  
  // Session state
  status: text("status").default("active"), // active, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assistant Messages - chat messages within a session
export const assistantMessages = pgTable("assistant_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  
  // Mode override for this message
  mode: text("mode"), // PMESII, RISK_BRIEF, SITREP, GRAPH_QUERY, ARTIFACT_SUMMARY, DEGRADED
  
  // Context overrides
  contextOverrides: jsonb("context_overrides"), // time_window, artifact_scope, etc.
  
  // Status
  status: text("status").default("queued"), // queued, processing, completed, failed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assistant Runs - analysis runs with structured outputs
export const assistantRuns = pgTable("assistant_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  messageId: varchar("message_id"), // Optional link to triggering message
  
  // Run configuration
  mode: text("mode").notNull(), // PMESII, RISK_BRIEF, SITREP, GRAPH_QUERY, ARTIFACT_SUMMARY, DEGRADED
  prompt: text("prompt"),
  
  // Context used (for audit)
  contextSnapshot: jsonb("context_snapshot"), // AOI, time_window, artifact_ids, graph_nodes
  
  // Engine state
  engineState: text("engine_state").default("AI_ONLINE"), // AI_ONLINE, DEGRADED, AI_UNAVAILABLE
  
  // Structured result (ModeResult schema)
  result: jsonb("result"),
  
  // Audit trail
  toolsUsed: jsonb("tools_used").$type<string[]>().default([]),
  policyFlags: jsonb("policy_flags").$type<string[]>().default([]),
  
  // Status
  status: text("status").default("pending"), // pending, running, completed, failed
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  role: true,
  contextIds: true,
  odinSource: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  fileId: true,
  analysisType: true,
  results: true,
  region: true,
  aoiData: true,
  source: true,
  sourceMetadata: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).pick({
  aoi: true,
  riskScore: true,
  riskFactors: true,
});

export const insertWaypointSchema = createInsertSchema(waypoints).pick({
  name: true,
  lat: true,
  lng: true,
  type: true,
  description: true,
  intelligenceData: true,
  isActive: true,
});

export const insertGeotaggedFileSchema = createInsertSchema(geotaggedFiles).pick({
  fileId: true,
  filename: true,
  lat: true,
  lng: true,
  altitude: true,
  accuracy: true,
  source: true,
  metadata: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).pick({
  lat: true,
  lng: true,
  location: true,
  weatherCode: true,
  temperature: true,
  apparentTemperature: true,
  humidity: true,
  dewPoint: true,
  precipitation: true,
  precipitationProbability: true,
  windSpeed: true,
  windDirection: true,
  windGusts: true,
  pressure: true,
  visibility: true,
  cloudCover: true,
  uvIndex: true,
  isCurrentWeather: true,
  forecastTime: true,
  dataSource: true,
});

export const insertWeatherAlertSchema = createInsertSchema(weatherAlerts).pick({
  lat: true,
  lng: true,
  location: true,
  alertType: true,
  severity: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  isActive: true,
  weatherData: true,
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts, {
  createdTime: z.number().positive(), // Allow large timestamp values
}).pick({
  universalMessageId: true,
  socialNetwork: true,
  senderUserId: true,
  senderScreenName: true,
  senderListedName: true,
  senderProfileImgUrl: true,
  senderProfileLink: true,
  senderFollowersCount: true,
  senderInfluencerScore: true,
  senderAge: true,
  senderGender: true,
  originalAuthor: true,
  originalAuthorProfileLink: true,
  title: true,
  message: true,
  messageType: true,
  createdTime: true,
  language: true,
  languageCode: true,
  countryCode: true,
  mediaTypeList: true,
  permalink: true,
  domain: true,
  retweets: true,
  tweetGenerator: true,
  favorites: true,
  sentiment: true,
  location: true,
  country: true,
  state: true,
  city: true,
  lat: true,
  lng: true,
  conversationId: true,
  campaignName: true,
  isSpam: true,
  platform: true,
});

export const insertUploadedSourceSchema = createInsertSchema(uploadedSources).pick({
  filename: true,
  originalFilename: true,
  mimeType: true,
  fileSize: true,
  sourceType: true,
  extractedText: true,
  summary: true,
  pmesiiCategories: true,
  relevanceScore: true,
  lat: true,
  lng: true,
  region: true,
  isProcessed: true,
  processingError: true,
});

export const insertGraphNodeSchema = createInsertSchema(graphNodes).pick({
  label: true,
  description: true,
  nodeType: true,
  layer: true,
  status: true,
  severity: true,
  sensitivity: true,
  dueDate: true,
  lat: true,
  lng: true,
  locationName: true,
  owner: true,
  team: true,
  linkedEntityType: true,
  linkedEntityId: true,
  metadata: true,
  tags: true,
});

export const insertGraphEdgeSchema = createInsertSchema(graphEdges).pick({
  sourceNodeId: true,
  targetNodeId: true,
  edgeType: true,
  label: true,
  weight: true,
  metadata: true,
});

// GIA Insert Schemas
export const insertAssistantSessionSchema = createInsertSchema(assistantSessions).pick({
  name: true,
  aoiLabel: true,
  aoiGeometry: true,
  timeFrom: true,
  timeTo: true,
  trainingCountry: true,
  isExercise: true,
  defaultMode: true,
  sensitivityMax: true,
  status: true,
});

export const insertAssistantMessageSchema = createInsertSchema(assistantMessages).pick({
  sessionId: true,
  role: true,
  content: true,
  mode: true,
  contextOverrides: true,
  status: true,
});

export const insertAssistantRunSchema = createInsertSchema(assistantRuns).pick({
  sessionId: true,
  messageId: true,
  mode: true,
  prompt: true,
  contextSnapshot: true,
  engineState: true,
  result: true,
  toolsUsed: true,
  policyFlags: true,
  status: true,
  errorMessage: true,
  completedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type Waypoint = typeof waypoints.$inferSelect;
export type InsertWaypoint = z.infer<typeof insertWaypointSchema>;
export type GeotaggedFile = typeof geotaggedFiles.$inferSelect;
export type InsertGeotaggedFile = z.infer<typeof insertGeotaggedFileSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherAlert = typeof weatherAlerts.$inferSelect;
export type InsertWeatherAlert = z.infer<typeof insertWeatherAlertSchema>;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type UploadedSource = typeof uploadedSources.$inferSelect;
export type InsertUploadedSource = z.infer<typeof insertUploadedSourceSchema>;
export type GraphNode = typeof graphNodes.$inferSelect;
export type InsertGraphNode = z.infer<typeof insertGraphNodeSchema>;
export type GraphEdge = typeof graphEdges.$inferSelect;
export type InsertGraphEdge = z.infer<typeof insertGraphEdgeSchema>;

// GIA Types
export type AssistantSession = typeof assistantSessions.$inferSelect;
export type InsertAssistantSession = z.infer<typeof insertAssistantSessionSchema>;
export type AssistantMessage = typeof assistantMessages.$inferSelect;
export type InsertAssistantMessage = z.infer<typeof insertAssistantMessageSchema>;
export type AssistantRun = typeof assistantRuns.$inferSelect;
export type InsertAssistantRun = z.infer<typeof insertAssistantRunSchema>;

// GIA Mode Constants
export const GIA_MODES = ['PMESII', 'RISK_BRIEF', 'SITREP', 'MISSION_SUPPORT', 'GRAPH_QUERY', 'ARTIFACT_SUMMARY', 'DEGRADED'] as const;
export const ENGINE_STATES = ['AI_ONLINE', 'DEGRADED', 'AI_UNAVAILABLE', 'QUOTA'] as const;
export const CLAIM_TAGS = ['SUPPORTED', 'ASSUMPTION', 'UNKNOWN'] as const;
export const RELIABILITY_GRADES = ['A', 'B', 'C', 'D', 'E'] as const;
export const CONFIDENCE_LEVELS = ['Low', 'Med', 'High'] as const;

export type GIAMode = typeof GIA_MODES[number];
export type EngineState = typeof ENGINE_STATES[number];
export type ClaimTag = typeof CLAIM_TAGS[number];
export type ReliabilityGrade = typeof RELIABILITY_GRADES[number];
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number];

// GIA Run Request Schema (for API validation)
export const giaRunRequestSchema = z.object({
  mode: z.enum(GIA_MODES).optional(),
  prompt: z.string().min(1, "Prompt is required"),
  context_overrides: z.record(z.unknown()).optional(),
});
export type GIARunRequest = z.infer<typeof giaRunRequestSchema>;

// GIA Structured Output Schemas (per tech spec)

// Evidence reference for claims
export const evidenceReferenceSchema = z.object({
  artifact_id: z.string().uuid(),
  snippet_id: z.string().optional(),
  reliability: z.enum(RELIABILITY_GRADES),
  timestamp: z.string().datetime().optional(),
});

// Confidence object
export const confidenceSchema = z.object({
  level: z.enum(CONFIDENCE_LEVELS),
  score: z.number().min(0).max(1),
  basis: z.array(z.string()).default([]),
});

// Claim object (core building block)
export const claimSchema = z.object({
  id: z.string(),
  text: z.string(),
  tag: z.enum(CLAIM_TAGS),
  confidence: confidenceSchema,
  evidence: z.array(evidenceReferenceSchema).default([]),
  related_nodes: z.array(z.string()).default([]),
});

// Citation object
export const citationSchema = z.object({
  id: z.string(),
  artifact_id: z.string().uuid(),
  snippet_id: z.string().optional(),
  text: z.string(),
  reliability: z.enum(RELIABILITY_GRADES),
});

// Action object (from assistant output)
export const actionSchema = z.object({
  type: z.enum(['create_risk', 'create_milestone', 'link_artifact', 'update_node']),
  label: z.string(),
  payload: z.record(z.unknown()),
});

// Audit trail
export const auditSchema = z.object({
  tools_used: z.array(z.string()).default([]),
  policy_flags: z.array(z.string()).default([]),
});

// Common ModeResult envelope
export const modeResultEnvelopeSchema = z.object({
  schema_version: z.string().default("1.0"),
  mode: z.enum(GIA_MODES),
  title: z.string(),
  time_window: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
  confidence: confidenceSchema.optional(),
  claims: z.array(claimSchema).default([]),
  citations: z.array(citationSchema).default([]),
  actions: z.array(actionSchema).default([]),
  audit: auditSchema,
});

// PMESII mode payload
export const pmesiiModePayloadSchema = z.object({
  pmesii: z.object({
    Political: z.object({ summary: z.string(), claims: z.array(z.string()) }),
    Military: z.object({ summary: z.string(), claims: z.array(z.string()) }),
    Economic: z.object({ summary: z.string(), claims: z.array(z.string()) }),
    Social: z.object({ summary: z.string(), claims: z.array(z.string()) }),
    Information: z.object({ summary: z.string(), claims: z.array(z.string()) }),
    Infrastructure: z.object({ summary: z.string(), claims: z.array(z.string()) }),
  }),
  confidence_bars: z.array(z.object({
    dimension: z.string(),
    score: z.number().min(0).max(1),
  })),
});

// Risk Brief mode payload
export const riskBriefPayloadSchema = z.object({
  risks: z.array(z.object({
    title: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    score: z.number().min(0).max(100),
    drivers: z.array(z.string()), // Claim IDs
    mitigations: z.array(z.string()),
    geo: z.object({
      applies_to_aoi: z.boolean(),
      notes: z.string().optional(),
    }).optional(),
    trend: z.enum(['Improving', 'Stable', 'Worsening', 'Unknown']).optional(),
  })),
});

// SITREP mode payload
export const sitrepPayloadSchema = z.object({
  sections: z.array(z.object({
    heading: z.string(),
    bullets: z.array(z.string()), // Can be claim IDs or strings
  })),
});

// Graph Query mode payload
export const graphQueryPayloadSchema = z.object({
  question: z.string(),
  answer: z.object({
    summary: z.string(),
    paths: z.array(z.object({
      from: z.string(),
      to: z.string(),
      edges: z.array(z.string()),
      explanation: z.string(),
    })),
  }),
});

// Artifact Summary mode payload
export const artifactSummaryPayloadSchema = z.object({
  artifact_id: z.string().uuid(),
  summary: z.string(),
  key_points: z.array(z.string()), // Claim IDs
  reliability: z.enum(RELIABILITY_GRADES),
  gaps: z.array(z.string()),
});

// Degraded mode payload
export const degradedPayloadSchema = z.object({
  degraded_reason: z.enum(['AI_UNAVAILABLE', 'QUOTA', 'POLICY']),
  deterministic_outputs: z.object({
    graph_findings: z.array(z.unknown()).default([]),
    stored_pmesii_used: z.boolean().default(false),
    risk_rules_applied: z.boolean().default(false),
  }),
});

// Types for structured outputs
export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Citation = z.infer<typeof citationSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Audit = z.infer<typeof auditSchema>;
export type ModeResultEnvelope = z.infer<typeof modeResultEnvelopeSchema>;
export type PMESIIModePayload = z.infer<typeof pmesiiModePayloadSchema>;
export type RiskBriefPayload = z.infer<typeof riskBriefPayloadSchema>;
export type SITREPPayload = z.infer<typeof sitrepPayloadSchema>;
export type GraphQueryPayload = z.infer<typeof graphQueryPayloadSchema>;
export type ArtifactSummaryPayload = z.infer<typeof artifactSummaryPayloadSchema>;
export type DegradedPayload = z.infer<typeof degradedPayloadSchema>;

// Graph node type and layer constants
export const NODE_TYPES = ['artifact', 'milestone', 'risk', 'dependency', 'decision', 'partner'] as const;
export const LAYERS = ['evidence', 'execution', 'dependencies', 'risk', 'people_orgs', 'legal_ip'] as const;
export const STATUS_VALUES = ['planned', 'in_progress', 'done', 'open', 'closed', 'pending', 'applied'] as const;
export const SEVERITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
export const SENSITIVITY_VALUES = ['internal', 'cui', 'secret', 'top_secret'] as const;

export type NodeType = typeof NODE_TYPES[number];
export type Layer = typeof LAYERS[number];
export type Status = typeof STATUS_VALUES[number];
export type Severity = typeof SEVERITY_VALUES[number];
export type Sensitivity = typeof SENSITIVITY_VALUES[number];

// Graph filter query schema for API
export const graphFilterSchema = z.object({
  q: z.string().optional(), // Text search across labels
  type_in: z.array(z.enum(NODE_TYPES)).optional(),
  layer_in: z.array(z.enum(LAYERS)).optional(),
  status_in: z.array(z.enum(STATUS_VALUES)).optional(),
  severity_in: z.array(z.enum(SEVERITY_VALUES)).optional(),
  sensitivity_in: z.array(z.enum(SENSITIVITY_VALUES)).optional(),
  time_from: z.string().datetime().optional(), // ISO timestamp
  time_to: z.string().datetime().optional(),
  due_from: z.string().datetime().optional(), // For milestones
  due_to: z.string().datetime().optional(),
  owner: z.string().optional(),
  team: z.string().optional(),
  has_location: z.boolean().optional(),
  limit: z.number().min(1).max(500).default(100),
  offset: z.number().min(0).default(0),
});

export type GraphFilter = z.infer<typeof graphFilterSchema>;

// Social media query schemas
export const socialMediaQuerySchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(), 
  radiusKm: z.number().positive().optional(),
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).optional(),
  country: z.string().optional(),
  limit: z.number().positive().max(1000).optional()
});

export type SocialMediaQuery = z.infer<typeof socialMediaQuerySchema>;

// API Request/Response types
export const personaSchema = z.object({
  callsign: z.string().default("Analyst"),
  role: z.string().default("Intelligence Analyst"),
  experienceLevel: z.string().default("Intermediate"),
  missionContext: z.string().default("Deployment"),
  temporalHorizon: z.string().optional(),
}).optional();

export const chatQuerySchema = z.object({
  query: z.string().min(1),
  contextIds: z.array(z.string()).default([]),
  odinCountry: z.string().optional(),
  persona: personaSchema,
});

export const geminiLocationQuerySchema = z.object({
  query: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const fileAnalysisSchema = z.object({
  fileId: z.string(),
  analysisType: z.enum(['pmesii', 'intelligence', 'threat', 'general']),
  file: z.any(), // File data
});

export const riskAssessmentRequestSchema = z.object({
  aoi: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
    radiusKm: z.number(),
  }),
});

export const pmesiiAnalysisRequestSchema = z.object({
  region: z.string(),
  context: z.string().optional(),
  aoi: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
    radiusKm: z.number(),
  }).optional(),
});

export const waypointRequestSchema = z.object({
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  type: z.enum(['cache', 'waypoint', 'target', 'safe_house']),
  description: z.string().optional(),
  intelligenceData: z.any().optional(),
});

export const geotagRequestSchema = z.object({
  fileId: z.string(),
  filename: z.string(),
  lat: z.number(),
  lng: z.number(),
  altitude: z.number().optional(),
  accuracy: z.number().optional(),
  source: z.enum(['exif', 'manual', 'device']),
  metadata: z.any().optional(),
});

export const weatherRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  location: z.string().optional(), // Optional human-readable location
  includeForecast: z.boolean().default(false), // Whether to include forecast data
  forecastDays: z.number().min(1).max(16).default(7), // Number of forecast days (1-16)
});

export const weatherAlertRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  location: z.string(),
  alertType: z.enum(['severe_weather', 'extreme_temperature', 'high_wind', 'precipitation']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string(),
  description: z.string(),
  startTime: z.string(), // ISO timestamp
  endTime: z.string().optional(), // ISO timestamp
  weatherData: z.any().optional(),
});

export const locationAnalysisRequestSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  radiusKm: z.number().optional().default(5),
  analysisType: z.enum(['general', 'pmesii', 'threat', 'intelligence']).optional().default('general'),
  context: z.string().optional()
});

export type ChatQueryRequest = z.infer<typeof chatQuerySchema>;
export type GeminiLocationQueryRequest = z.infer<typeof geminiLocationQuerySchema>;
export type FileAnalysisRequest = z.infer<typeof fileAnalysisSchema>;
export type RiskAssessmentRequest = z.infer<typeof riskAssessmentRequestSchema>;
export type WaypointRequest = z.infer<typeof waypointRequestSchema>;
export type GeotagRequest = z.infer<typeof geotagRequestSchema>;
export type WeatherRequest = z.infer<typeof weatherRequestSchema>;
export type WeatherAlertRequest = z.infer<typeof weatherAlertRequestSchema>;
export type LocationAnalysisRequest = z.infer<typeof locationAnalysisRequestSchema>;

// Search schemas
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  filters: z.object({
    type: z.enum(['waypoint', 'geotagged', 'pmesii', 'intelligence', 'risk', 'weather']).optional(),
    region: z.object({ lat: z.number(), lng: z.number(), radius: z.number() }).optional(),
    timeRange: z.object({ start: z.string(), end: z.string() }).optional()
  }).optional(),
  limit: z.number().min(1).max(100).default(50)
})

export const searchResultSchema = z.object({
  id: z.string(),
  type: z.enum(['waypoint', 'geotagged', 'pmesii', 'intelligence', 'risk', 'weather']),
  title: z.string(),
  snippet: z.string(),
  tags: z.array(z.string()).optional(),
  timestamp: z.string(),
  score: z.number().min(0).max(1),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  context: z.record(z.any()).optional()
})

export type SearchQuery = z.infer<typeof searchQuerySchema>
export type SearchResult = z.infer<typeof searchResultSchema>

// Timeline event types for event timeline feature
export const timelineEventSchema = z.object({
  id: z.string(),
  type: z.enum(['chat', 'intelligence', 'pmesii', 'risk', 'waypoint', 'file', 'weather']),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  source: z.string().optional(), // For external intelligence sources
  metadata: z.record(z.any()).optional()
})

export const timelineQuerySchema = z.object({
  limit: z.number().min(1).max(200).default(100),
  filters: z.object({
    types: z.array(z.enum(['chat', 'intelligence', 'pmesii', 'risk', 'waypoint', 'file', 'weather'])).optional(),
    dateRange: z.object({ start: z.string(), end: z.string() }).optional(),
    severity: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])).optional(),
    sources: z.array(z.string()).optional() // For filtering by intelligence source
  }).optional()
})

export type TimelineEvent = z.infer<typeof timelineEventSchema>
export type TimelineQuery = z.infer<typeof timelineQuerySchema>

// =====================================================
// MVP REBUILD: Sessions, Analyses, Evidence Tables
// =====================================================

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  aoi: jsonb("aoi").$type<{ name: string; lat: number; lon: number; bbox?: number[] }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pmesiiAnalyses = pgTable("pmesii_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id),
  aoi: jsonb("aoi").$type<{ name: string; lat: number; lon: number; bbox?: number[] }>().notNull(),
  question: text("question"),
  timeWindowDays: real("time_window_days").default(30),
  pmesii: jsonb("pmesii").$type<{
    political: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    military: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    economic: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    social: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    information: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    infrastructure: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    physicalEnvironment?: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
    time?: { assessment: string; riskLevel: string; confidence: number; considerations: string[] };
  }>(),
  sigacts: jsonb("sigacts").$type<Array<{
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    confidence: number;
    lat?: number;
    lng?: number;
  }>>(),
  confidence: jsonb("confidence").$type<{
    score: number;
    rationale: string[];
  }>(),
  providerStatus: jsonb("provider_status").$type<{
    model: string;
    latencyMs: number;
    tokens: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evidence = pgTable("evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").references(() => pmesiiAnalyses.id),
  source: text("source").notNull(), // 'news', 'social', 'osint', 'humint', etc.
  title: text("title").notNull(),
  url: text("url"),
  excerpt: text("excerpt"),
  timestamp: timestamp("timestamp"),
  lat: real("lat"),
  lng: real("lng"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertSessionSchema = createInsertSchema(sessions).pick({
  name: true,
  aoi: true,
});

export const insertPmesiiAnalysisSchema = createInsertSchema(pmesiiAnalyses).pick({
  sessionId: true,
  aoi: true,
  question: true,
  timeWindowDays: true,
  pmesii: true,
  sigacts: true,
  confidence: true,
  providerStatus: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).pick({
  analysisId: true,
  source: true,
  title: true,
  url: true,
  excerpt: true,
  timestamp: true,
  lat: true,
  lng: true,
  confidence: true,
});

// Types for new tables
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type PmesiiAnalysis = typeof pmesiiAnalyses.$inferSelect;
export type InsertPmesiiAnalysis = z.infer<typeof insertPmesiiAnalysisSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

// API Request schema for PMESII analysis (matches the plan)
export const pmesiiAnalyzeRequestSchema = z.object({
  session_id: z.string().optional(),
  aoi: z.object({
    name: z.string(),
    bbox: z.array(z.number()).optional(),
    lat: z.number(),
    lon: z.number(),
  }),
  time_window_days: z.number().default(30),
  question: z.string().optional(),
});

export type PmesiiAnalyzeRequest = z.infer<typeof pmesiiAnalyzeRequestSchema>;

// ============================================================================
// GDELT Intelligence Tables (DB-first caching for open-source event data)
// ============================================================================

export const intelGdeltEvents = pgTable("intel_gdelt_event", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  globalEventId: text("global_event_id").notNull().unique(),
  eventDate: timestamp("event_date").notNull(),
  eventCode: text("event_code"),
  eventBaseCode: text("event_base_code"),
  eventRootCode: text("event_root_code"),
  quadClass: text("quad_class"),
  goldsteinScale: real("goldstein_scale"),
  numMentions: real("num_mentions"),
  numSources: real("num_sources"),
  numArticles: real("num_articles"),
  avgTone: real("avg_tone"),
  actor1Name: text("actor1_name"),
  actor1CountryCode: text("actor1_country_code"),
  actor1Type1Code: text("actor1_type1_code"),
  actor2Name: text("actor2_name"),
  actor2CountryCode: text("actor2_country_code"),
  actor2Type1Code: text("actor2_type1_code"),
  actionGeoType: text("action_geo_type"),
  actionGeoFullname: text("action_geo_fullname"),
  actionGeoCountryCode: text("action_geo_country_code"),
  actionGeoLat: real("action_geo_lat"),
  actionGeoLon: real("action_geo_lon"),
  sourceUrl: text("source_url"),
  raw: jsonb("raw").notNull(),
  queryHash: text("query_hash").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

export const intelGdeltDocs = pgTable("intel_gdelt_doc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  docId: text("doc_id").notNull().unique(),
  url: text("url").notNull(),
  urlMobile: text("url_mobile"),
  title: text("title"),
  seenDate: timestamp("seen_date"),
  publishedAt: timestamp("published_at"),
  domain: text("domain"),
  language: text("language"),
  sourceName: text("source_name"),
  sourceCountry: text("source_country"),
  theme: text("theme"),
  tone: real("tone"),
  positiveScore: real("positive_score"),
  negativeScore: real("negative_score"),
  polarity: real("polarity"),
  activityDensity: real("activity_density"),
  selfGroup: text("self_group"),
  socialImage: text("social_image"),
  socialVideo: text("social_video"),
  lat: real("lat"),
  lon: real("lon"),
  locationName: text("location_name"),
  locationCountry: text("location_country"),
  raw: jsonb("raw").notNull(),
  queryHash: text("query_hash").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

export const intelRefreshRuns = pgTable("intel_refresh_run", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryHash: text("query_hash").notNull(),
  aoiName: text("aoi_name").notNull(),
  aoiLat: real("aoi_lat").notNull(),
  aoiLon: real("aoi_lon").notNull(),
  radiusKm: real("radius_km"),
  timeWindowDays: real("time_window_days"),
  status: text("status").notNull().default("pending"),
  eventsCount: real("events_count").default(0),
  docsCount: real("docs_count").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  durationMs: real("duration_ms"),
});

export const intelCacheState = pgTable("intel_cache_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryHash: text("query_hash").notNull().unique(),
  aoiName: text("aoi_name").notNull(),
  aoiLat: real("aoi_lat").notNull(),
  aoiLon: real("aoi_lon").notNull(),
  radiusKm: real("radius_km"),
  timeWindowDays: real("time_window_days"),
  eventsCount: real("events_count").default(0),
  docsCount: real("docs_count").default(0),
  lastRefreshAt: timestamp("last_refresh_at"),
  lastRefreshStatus: text("last_refresh_status"),
  ttlMinutes: real("ttl_minutes").default(60),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertIntelGdeltEventSchema = createInsertSchema(intelGdeltEvents).omit({ id: true, fetchedAt: true });
export const insertIntelGdeltDocSchema = createInsertSchema(intelGdeltDocs).omit({ id: true, fetchedAt: true });
export const insertIntelRefreshRunSchema = createInsertSchema(intelRefreshRuns).omit({ id: true, startedAt: true });
export const insertIntelCacheStateSchema = createInsertSchema(intelCacheState).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type IntelGdeltEvent = typeof intelGdeltEvents.$inferSelect;
export type InsertIntelGdeltEvent = z.infer<typeof insertIntelGdeltEventSchema>;
export type IntelGdeltDoc = typeof intelGdeltDocs.$inferSelect;
export type InsertIntelGdeltDoc = z.infer<typeof insertIntelGdeltDocSchema>;
export type IntelRefreshRun = typeof intelRefreshRuns.$inferSelect;
export type InsertIntelRefreshRun = z.infer<typeof insertIntelRefreshRunSchema>;
export type IntelCacheState = typeof intelCacheState.$inferSelect;
export type InsertIntelCacheState = z.infer<typeof insertIntelCacheStateSchema>;

// GDELT Query request schemas
export const gdeltQueryRequestSchema = z.object({
  aoi: z.object({
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
    radiusKm: z.number().optional().default(50),
  }),
  timeWindowDays: z.number().optional().default(7),
  themes: z.array(z.string()).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export const gdeltRefreshRequestSchema = z.object({
  aoi: z.object({
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
    radiusKm: z.number().optional().default(50),
  }),
  timeWindowDays: z.number().optional().default(7),
  themes: z.array(z.string()).optional(),
});

export type GdeltQueryRequest = z.infer<typeof gdeltQueryRequestSchema>;
export type GdeltRefreshRequest = z.infer<typeof gdeltRefreshRequestSchema>;
