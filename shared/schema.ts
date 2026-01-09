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
export const chatQuerySchema = z.object({
  query: z.string().min(1),
  contextIds: z.array(z.string()).default([]),
  odinCountry: z.string().optional(), // Selected ODIN scenario country for contextual intelligence
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
