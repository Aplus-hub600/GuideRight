import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, real } from "drizzle-orm/pg-core";
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
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aoi: jsonb("aoi").notNull(), // Area of Interest data
  riskScore: real("risk_score").notNull(),
  riskFactors: jsonb("risk_factors").$type<string[]>().default([]),
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
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).pick({
  aoi: true,
  riskScore: true,
  riskFactors: true,
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

export type ChatQueryRequest = z.infer<typeof chatQuerySchema>;
export type FileAnalysisRequest = z.infer<typeof fileAnalysisSchema>;
export type RiskAssessmentRequest = z.infer<typeof riskAssessmentRequestSchema>;
