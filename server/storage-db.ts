import { 
  type User, 
  type InsertUser, 
  type ChatMessage,
  type InsertChatMessage,
  type AnalysisResult,
  type InsertAnalysisResult,
  type RiskAssessment,
  type InsertRiskAssessment,
  type Waypoint,
  type InsertWaypoint,
  type GeotaggedFile,
  type InsertGeotaggedFile,
  type WeatherData,
  type InsertWeatherData,
  type WeatherAlert,
  type InsertWeatherAlert,
  type SocialMediaPost,
  type InsertSocialMediaPost,
  type UploadedSource,
  type InsertUploadedSource,
  type GraphNode,
  type InsertGraphNode,
  type GraphEdge,
  type InsertGraphEdge,
  type GraphFilter,
  type SearchQuery,
  type SearchResult,
  type TimelineEvent,
  type TimelineQuery,
  type AssistantSession,
  type InsertAssistantSession,
  type AssistantMessage,
  type InsertAssistantMessage,
  type AssistantRun,
  type InsertAssistantRun,
  users,
  chatMessages,
  analysisResults,
  riskAssessments,
  waypoints,
  geotaggedFiles,
  weatherData,
  weatherAlerts,
  socialMediaPosts,
  uploadedSources,
  graphNodes,
  graphEdges,
  assistantSessions,
  assistantMessages,
  assistantRuns
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, sql, desc, asc, inArray, gte, lte, isNotNull, isNull } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...insertMessage,
        contextIds: insertMessage.contextIds || []
      })
      .returning();
    return message;
  }

  async getAnalysisResults(fileId?: string): Promise<AnalysisResult[]> {
    if (fileId) {
      return await db
        .select()
        .from(analysisResults)
        .where(eq(analysisResults.fileId, fileId))
        .orderBy(desc(analysisResults.timestamp));
    }
    return await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.timestamp));
  }

  async getAnalysisResultsByType(analysisType: string, region?: string): Promise<AnalysisResult[]> {
    const conditions = [eq(analysisResults.analysisType, analysisType)];
    if (region) {
      conditions.push(eq(analysisResults.region, region));
    }
    
    return await db
      .select()
      .from(analysisResults)
      .where(and(...conditions))
      .orderBy(desc(analysisResults.timestamp));
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const [result] = await db
      .insert(analysisResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getRiskAssessments(): Promise<RiskAssessment[]> {
    return await db
      .select()
      .from(riskAssessments)
      .orderBy(desc(riskAssessments.timestamp));
  }

  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [assessment] = await db
      .insert(riskAssessments)
      .values({
        ...insertAssessment,
        riskFactors: insertAssessment.riskFactors || []
      })
      .returning();
    return assessment;
  }

  async getWaypoints(): Promise<Waypoint[]> {
    return await db
      .select()
      .from(waypoints)
      .where(eq(waypoints.isActive, true))
      .orderBy(desc(waypoints.timestamp));
  }

  async createWaypoint(insertWaypoint: InsertWaypoint): Promise<Waypoint> {
    const [waypoint] = await db
      .insert(waypoints)
      .values(insertWaypoint)
      .returning();
    return waypoint;
  }

  async updateWaypoint(id: string, updates: Partial<InsertWaypoint>): Promise<Waypoint | null> {
    const [waypoint] = await db
      .update(waypoints)
      .set(updates)
      .where(eq(waypoints.id, id))
      .returning();
    return waypoint || null;
  }

  async deleteWaypoint(id: string): Promise<boolean> {
    const [result] = await db
      .update(waypoints)
      .set({ isActive: false })
      .where(eq(waypoints.id, id))
      .returning();
    return !!result;
  }

  async getGeotaggedFiles(): Promise<GeotaggedFile[]> {
    return await db
      .select()
      .from(geotaggedFiles)
      .orderBy(desc(geotaggedFiles.timestamp));
  }

  async createGeotaggedFile(insertFile: InsertGeotaggedFile): Promise<GeotaggedFile> {
    const [file] = await db
      .insert(geotaggedFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getGeotaggedFilesByLocation(lat: number, lng: number, radiusKm: number): Promise<GeotaggedFile[]> {
    // Use Haversine formula for distance calculation
    const earthRadius = 6371; // km
    return await db
      .select()
      .from(geotaggedFiles)
      .where(
        sql`(${earthRadius} * acos(
          greatest(-1, least(1, 
            cos(radians(${lat})) * cos(radians(${geotaggedFiles.lat})) * 
            cos(radians(${geotaggedFiles.lng}) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians(${geotaggedFiles.lat}))
          ))
        )) <= ${radiusKm}`
      );
  }

  async deleteGeotaggedFile(id: string): Promise<boolean> {
    const result = await db
      .delete(geotaggedFiles)
      .where(eq(geotaggedFiles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getWeatherData(lat?: number, lng?: number, isCurrentOnly?: boolean): Promise<WeatherData[]> {
    const conditions = [];
    if (isCurrentOnly) {
      conditions.push(eq(weatherData.isCurrentWeather, true));
    }
    if (lat !== undefined && lng !== undefined) {
      // Simple lat/lng filtering - could be enhanced with radius
      conditions.push(
        and(
          sql`abs(${weatherData.lat} - ${lat}) < 0.5`,
          sql`abs(${weatherData.lng} - ${lng}) < 0.5`
        )
      );
    }

    return await db
      .select()
      .from(weatherData)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(weatherData.timestamp));
  }

  async createWeatherData(insertWeather: InsertWeatherData): Promise<WeatherData> {
    const [weather] = await db
      .insert(weatherData)
      .values(insertWeather)
      .returning();
    return weather;
  }

  async getWeatherAlerts(lat?: number, lng?: number, activeOnly?: boolean): Promise<WeatherAlert[]> {
    const conditions = [];
    if (activeOnly) {
      conditions.push(eq(weatherAlerts.isActive, true));
    }
    if (lat !== undefined && lng !== undefined) {
      conditions.push(
        and(
          sql`abs(${weatherAlerts.lat} - ${lat}) < 0.5`,
          sql`abs(${weatherAlerts.lng} - ${lng}) < 0.5`
        )
      );
    }

    return await db
      .select()
      .from(weatherAlerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(weatherAlerts.timestamp));
  }

  async createWeatherAlert(insertAlert: InsertWeatherAlert): Promise<WeatherAlert> {
    const [alert] = await db
      .insert(weatherAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async updateWeatherAlert(id: string, updates: Partial<InsertWeatherAlert>): Promise<WeatherAlert | null> {
    const [alert] = await db
      .update(weatherAlerts)
      .set(updates)
      .where(eq(weatherAlerts.id, id))
      .returning();
    return alert || null;
  }

  async getSocialMediaPosts(filters?: {
    lat?: number; lng?: number; radiusKm?: number;
    sentiment?: string; country?: string; limit?: number;
  }): Promise<SocialMediaPost[]> {
    const conditions = [];
    
    if (filters?.sentiment) {
      conditions.push(eq(socialMediaPosts.sentiment, filters.sentiment));
    }
    if (filters?.country) {
      conditions.push(eq(socialMediaPosts.country, filters.country));
    }
    if (filters?.lat !== undefined && filters?.lng !== undefined && filters?.radiusKm) {
      const earthRadius = 6371;
      conditions.push(
        sql`(${earthRadius} * acos(
          greatest(-1, least(1, 
            cos(radians(${filters.lat})) * cos(radians(${socialMediaPosts.lat})) * 
            cos(radians(${socialMediaPosts.lng}) - radians(${filters.lng})) + 
            sin(radians(${filters.lat})) * sin(radians(${socialMediaPosts.lat}))
          ))
        )) <= ${filters.radiusKm}`
      );
    }

    return await db
      .select()
      .from(socialMediaPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(socialMediaPosts.timestamp))
      .limit(filters?.limit || 100);
  }

  async createSocialMediaPost(insertPost: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const [post] = await db
      .insert(socialMediaPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async createSocialMediaPostsBulk(insertPosts: InsertSocialMediaPost[]): Promise<SocialMediaPost[]> {
    if (insertPosts.length === 0) return [];
    
    // Process in batches of 100 to avoid stack overflow
    const batchSize = 100;
    const results: SocialMediaPost[] = [];
    
    for (let i = 0; i < insertPosts.length; i += batchSize) {
      const batch = insertPosts.slice(i, i + batchSize);
      const batchResults = await db
        .insert(socialMediaPosts)
        .values(batch)
        .returning();
      results.push(...batchResults);
    }
    
    return results;
  }

  async getSocialMediaPostsByLocation(lat: number, lng: number, radiusKm: number): Promise<SocialMediaPost[]> {
    const earthRadius = 6371;
    return await db
      .select()
      .from(socialMediaPosts)
      .where(
        sql`(${earthRadius} * acos(
          greatest(-1, least(1, 
            cos(radians(${lat})) * cos(radians(${socialMediaPosts.lat})) * 
            cos(radians(${socialMediaPosts.lng}) - radians(${lng})) + 
            sin(radians(${lat})) * sin(radians(${socialMediaPosts.lat}))
          ))
        )) <= ${radiusKm}`
      );
  }

  async getSocialMediaPostsBySentiment(sentiment: string): Promise<SocialMediaPost[]> {
    return await db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.sentiment, sentiment));
  }

  async getSocialMediaInfluencers(minFollowers?: number): Promise<SocialMediaPost[]> {
    const followers = minFollowers || 1000;
    return await db
      .select()
      .from(socialMediaPosts)
      .where(sql`${socialMediaPosts.senderFollowersCount} >= ${followers}`)
      .orderBy(desc(socialMediaPosts.senderFollowersCount));
  }

  // Basic search implementation - can be enhanced with full-text search
  async searchAll(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchTerm = `%${query.q.toLowerCase()}%`;

    // For now, implement a basic search that focuses on social media posts
    // This can be expanded to include other data types
    const posts = await db
      .select()
      .from(socialMediaPosts)
      .where(
        or(
          like(sql`lower(${socialMediaPosts.message})`, searchTerm),
          like(sql`lower(${socialMediaPosts.senderScreenName})`, searchTerm),
          like(sql`lower(${socialMediaPosts.location})`, searchTerm)
        )
      )
      .limit(query.limit || 50);

    for (const post of posts) {
      results.push({
        id: post.id,
        type: 'social' as any,
        title: `${post.socialNetwork} - @${post.senderScreenName}`,
        snippet: post.message.substring(0, 100),
        tags: ['social-media', post.socialNetwork.toLowerCase()],
        timestamp: post.timestamp.toISOString(),
        score: 0.8,
        location: post.lat && post.lng ? { lat: post.lat, lng: post.lng } : undefined,
        context: { sentiment: post.sentiment, location: post.location }
      });
    }

    return results;
  }

  async getTimelineEvents(query: TimelineQuery): Promise<TimelineEvent[]> {
    // Basic implementation - can be enhanced
    const events: TimelineEvent[] = [];
    
    // Get recent chat messages
    const messages = await this.getChatMessages(query.limit || 100);
    for (const msg of messages) {
      events.push({
        id: msg.id,
        type: 'chat',
        title: 'Chat Message',
        description: msg.content.substring(0, 100),
        timestamp: msg.timestamp.toISOString(),
        metadata: { role: msg.role }
      });
    }

    // Get recent analysis results
    const analyses = await this.getAnalysisResults();
    for (const analysis of analyses.slice(0, 20)) {
      events.push({
        id: analysis.id,
        type: analysis.analysisType === 'pmesii' ? 'pmesii' : 'intelligence',
        title: `${analysis.analysisType} Analysis`,
        description: analysis.region || 'Analysis completed',
        timestamp: analysis.timestamp.toISOString(),
        source: analysis.source || undefined,
        metadata: { analysisType: analysis.analysisType, region: analysis.region }
      });
    }

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, query.limit || 100);
  }

  // Uploaded sources operations (Priority #5: Real source feeds)
  async getUploadedSources(region?: string): Promise<UploadedSource[]> {
    if (region) {
      return await db
        .select()
        .from(uploadedSources)
        .where(or(eq(uploadedSources.region, region), sql`${uploadedSources.region} IS NULL`))
        .orderBy(desc(uploadedSources.timestamp));
    }
    return await db
      .select()
      .from(uploadedSources)
      .orderBy(desc(uploadedSources.timestamp));
  }

  async getUploadedSourceById(id: string): Promise<UploadedSource | undefined> {
    const [source] = await db
      .select()
      .from(uploadedSources)
      .where(eq(uploadedSources.id, id));
    return source || undefined;
  }

  async createUploadedSource(source: InsertUploadedSource): Promise<UploadedSource> {
    const [newSource] = await db
      .insert(uploadedSources)
      .values({
        ...source,
        pmesiiCategories: source.pmesiiCategories || [],
        isProcessed: source.isProcessed ?? false
      })
      .returning();
    console.log(`[Sources] Created uploaded source: ${source.originalFilename} (${newSource.id})`);
    return newSource;
  }

  async updateUploadedSource(id: string, updates: Partial<InsertUploadedSource>): Promise<UploadedSource | null> {
    const [updated] = await db
      .update(uploadedSources)
      .set(updates)
      .where(eq(uploadedSources.id, id))
      .returning();
    if (updated) {
      console.log(`[Sources] Updated source: ${id}`);
    }
    return updated || null;
  }

  async deleteUploadedSource(id: string): Promise<boolean> {
    const result = await db
      .delete(uploadedSources)
      .where(eq(uploadedSources.id, id))
      .returning();
    if (result.length > 0) {
      console.log(`[Sources] Deleted source: ${id}`);
      return true;
    }
    return false;
  }

  async getProcessedSources(region?: string): Promise<UploadedSource[]> {
    if (region) {
      return await db
        .select()
        .from(uploadedSources)
        .where(
          and(
            eq(uploadedSources.isProcessed, true),
            or(eq(uploadedSources.region, region), sql`${uploadedSources.region} IS NULL`)
          )
        )
        .orderBy(desc(uploadedSources.timestamp));
    }
    return await db
      .select()
      .from(uploadedSources)
      .where(eq(uploadedSources.isProcessed, true))
      .orderBy(desc(uploadedSources.timestamp));
  }

  // Graph node operations
  async getGraphNodes(filters?: GraphFilter): Promise<{ nodes: GraphNode[]; total: number }> {
    let query = db.select().from(graphNodes);
    const conditions: any[] = [];
    
    if (filters) {
      if (filters.q) {
        conditions.push(
          or(
            like(graphNodes.label, `%${filters.q}%`),
            like(graphNodes.description, `%${filters.q}%`)
          )
        );
      }
      if (filters.type_in?.length) {
        conditions.push(inArray(graphNodes.nodeType, filters.type_in));
      }
      if (filters.layer_in?.length) {
        conditions.push(inArray(graphNodes.layer, filters.layer_in));
      }
      if (filters.status_in?.length) {
        conditions.push(inArray(graphNodes.status, filters.status_in));
      }
      if (filters.severity_in?.length) {
        conditions.push(inArray(graphNodes.severity, filters.severity_in));
      }
      if (filters.sensitivity_in?.length) {
        conditions.push(inArray(graphNodes.sensitivity, filters.sensitivity_in));
      }
      if (filters.time_from) {
        conditions.push(gte(graphNodes.createdAt, new Date(filters.time_from)));
      }
      if (filters.time_to) {
        conditions.push(lte(graphNodes.createdAt, new Date(filters.time_to)));
      }
      if (filters.due_from) {
        conditions.push(gte(graphNodes.dueDate, new Date(filters.due_from)));
      }
      if (filters.due_to) {
        conditions.push(lte(graphNodes.dueDate, new Date(filters.due_to)));
      }
      if (filters.owner) {
        conditions.push(eq(graphNodes.owner, filters.owner));
      }
      if (filters.team) {
        conditions.push(eq(graphNodes.team, filters.team));
      }
      if (filters.has_location === true) {
        conditions.push(and(isNotNull(graphNodes.lat), isNotNull(graphNodes.lng)));
      } else if (filters.has_location === false) {
        conditions.push(or(isNull(graphNodes.lat), isNull(graphNodes.lng)));
      }
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(graphNodes)
      .where(whereClause);
    const total = Number(countResult?.count || 0);
    
    // Get paginated results
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 100;
    
    const nodes = await db
      .select()
      .from(graphNodes)
      .where(whereClause)
      .orderBy(desc(graphNodes.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { nodes, total };
  }

  async getGraphNodeById(id: string): Promise<GraphNode | undefined> {
    const [node] = await db.select().from(graphNodes).where(eq(graphNodes.id, id));
    return node || undefined;
  }

  async createGraphNode(node: InsertGraphNode): Promise<GraphNode> {
    const [newNode] = await db
      .insert(graphNodes)
      .values({
        ...node,
        tags: (node.tags as string[]) || [],
      })
      .returning();
    return newNode;
  }

  async updateGraphNode(id: string, updates: Partial<InsertGraphNode>): Promise<GraphNode | null> {
    const [updated] = await db
      .update(graphNodes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(graphNodes.id, id))
      .returning();
    return updated || null;
  }

  async deleteGraphNode(id: string): Promise<boolean> {
    // Delete related edges first
    await db.delete(graphEdges).where(
      or(eq(graphEdges.sourceNodeId, id), eq(graphEdges.targetNodeId, id))
    );
    // Delete node
    const result = await db.delete(graphNodes).where(eq(graphNodes.id, id)).returning();
    return result.length > 0;
  }

  // Graph edge operations
  async getGraphEdges(nodeId?: string): Promise<GraphEdge[]> {
    if (nodeId) {
      return await db
        .select()
        .from(graphEdges)
        .where(or(eq(graphEdges.sourceNodeId, nodeId), eq(graphEdges.targetNodeId, nodeId)));
    }
    return await db.select().from(graphEdges);
  }

  async createGraphEdge(edge: InsertGraphEdge): Promise<GraphEdge> {
    const [newEdge] = await db
      .insert(graphEdges)
      .values(edge)
      .returning();
    return newEdge;
  }

  async deleteGraphEdge(id: string): Promise<boolean> {
    const result = await db.delete(graphEdges).where(eq(graphEdges.id, id)).returning();
    return result.length > 0;
  }

  // GIA Session operations
  async getAssistantSessions(status?: string): Promise<AssistantSession[]> {
    if (status) {
      return await db
        .select()
        .from(assistantSessions)
        .where(eq(assistantSessions.status, status))
        .orderBy(desc(assistantSessions.updatedAt));
    }
    return await db
      .select()
      .from(assistantSessions)
      .orderBy(desc(assistantSessions.updatedAt));
  }

  async getAssistantSessionById(id: string): Promise<AssistantSession | undefined> {
    const [session] = await db
      .select()
      .from(assistantSessions)
      .where(eq(assistantSessions.id, id));
    return session || undefined;
  }

  async createAssistantSession(session: InsertAssistantSession): Promise<AssistantSession> {
    const [result] = await db
      .insert(assistantSessions)
      .values(session)
      .returning();
    return result;
  }

  async updateAssistantSession(id: string, updates: Partial<InsertAssistantSession>): Promise<AssistantSession | null> {
    const [result] = await db
      .update(assistantSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assistantSessions.id, id))
      .returning();
    return result || null;
  }

  async deleteAssistantSession(id: string): Promise<boolean> {
    // Delete related messages and runs first
    await db.delete(assistantMessages).where(eq(assistantMessages.sessionId, id));
    await db.delete(assistantRuns).where(eq(assistantRuns.sessionId, id));
    // Then delete the session
    const result = await db.delete(assistantSessions).where(eq(assistantSessions.id, id)).returning();
    return result.length > 0;
  }

  // GIA Message operations
  async getAssistantMessages(sessionId: string, limit: number = 50): Promise<AssistantMessage[]> {
    return await db
      .select()
      .from(assistantMessages)
      .where(eq(assistantMessages.sessionId, sessionId))
      .orderBy(asc(assistantMessages.createdAt))
      .limit(limit);
  }

  async createAssistantMessage(message: InsertAssistantMessage): Promise<AssistantMessage> {
    const [result] = await db
      .insert(assistantMessages)
      .values(message)
      .returning();
    return result;
  }

  async updateAssistantMessage(id: string, updates: Partial<InsertAssistantMessage>): Promise<AssistantMessage | null> {
    const [result] = await db
      .update(assistantMessages)
      .set(updates)
      .where(eq(assistantMessages.id, id))
      .returning();
    return result || null;
  }

  // GIA Run operations
  async getAssistantRuns(sessionId: string, limit: number = 10): Promise<AssistantRun[]> {
    return await db
      .select()
      .from(assistantRuns)
      .where(eq(assistantRuns.sessionId, sessionId))
      .orderBy(desc(assistantRuns.createdAt))
      .limit(limit);
  }

  async getAssistantRunById(id: string): Promise<AssistantRun | undefined> {
    const [run] = await db
      .select()
      .from(assistantRuns)
      .where(eq(assistantRuns.id, id));
    return run || undefined;
  }

  async createAssistantRun(run: InsertAssistantRun): Promise<AssistantRun> {
    const [result] = await db
      .insert(assistantRuns)
      .values(run)
      .returning();
    return result;
  }

  async updateAssistantRun(id: string, updates: Partial<InsertAssistantRun>): Promise<AssistantRun | null> {
    const [result] = await db
      .update(assistantRuns)
      .set(updates)
      .where(eq(assistantRuns.id, id))
      .returning();
    return result || null;
  }
}