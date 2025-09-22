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
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: text("file_id"),
  analysisType: text("analysis_type").notNull(), // 'pmesii', 'risk', 'intelligence'
  results: jsonb("results").notNull(),
  region: text("region"), // Region/AOI name for PMESII analysis
  aoiData: jsonb("aoi_data"), // AOI coordinates and metadata
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  role: true,
  contextIds: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  fileId: true,
  analysisType: true,
  results: true,
  region: true,
  aoiData: true,
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

// API Request/Response types
export const chatQuerySchema = z.object({
  query: z.string().min(1),
  contextIds: z.array(z.string()).default([]),
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

export type ChatQueryRequest = z.infer<typeof chatQuerySchema>;
export type FileAnalysisRequest = z.infer<typeof fileAnalysisSchema>;
export type RiskAssessmentRequest = z.infer<typeof riskAssessmentRequestSchema>;
export type WaypointRequest = z.infer<typeof waypointRequestSchema>;
export type GeotagRequest = z.infer<typeof geotagRequestSchema>;
