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
  type SearchQuery,
  type SearchResult,
  type TimelineEvent,
  type TimelineQuery,
  users,
  chatMessages,
  analysisResults,
  riskAssessments,
  waypoints,
  geotaggedFiles,
  weatherData,
  weatherAlerts,
  socialMediaPosts
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, sql, desc, asc } from "drizzle-orm";
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
    
    return await db
      .insert(socialMediaPosts)
      .values(insertPosts)
      .returning();
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
}