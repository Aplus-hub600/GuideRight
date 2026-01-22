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
  type IntelGdeltEvent,
  type InsertIntelGdeltEvent,
  type IntelGdeltDoc,
  type InsertIntelGdeltDoc,
  type IntelCacheState,
  type InsertIntelCacheState,
  type IntelRefreshRun,
  type InsertIntelRefreshRun
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat operations
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Analysis operations
  getAnalysisResults(fileId?: string): Promise<AnalysisResult[]>;
  getAnalysisResultsByType(analysisType: string, region?: string): Promise<AnalysisResult[]>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  
  // Risk assessment operations
  getRiskAssessments(): Promise<RiskAssessment[]>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  
  // Waypoint operations
  getWaypoints(): Promise<Waypoint[]>;
  createWaypoint(waypoint: InsertWaypoint): Promise<Waypoint>;
  updateWaypoint(id: string, updates: Partial<InsertWaypoint>): Promise<Waypoint | null>;
  deleteWaypoint(id: string): Promise<boolean>;
  
  // Geotagged file operations
  getGeotaggedFiles(): Promise<GeotaggedFile[]>;
  createGeotaggedFile(file: InsertGeotaggedFile): Promise<GeotaggedFile>;
  getGeotaggedFilesByLocation(lat: number, lng: number, radiusKm: number): Promise<GeotaggedFile[]>;
  deleteGeotaggedFile(id: string): Promise<boolean>;
  
  // Search operations
  searchAll(query: SearchQuery): Promise<SearchResult[]>;
  
  // Timeline operations
  getTimelineEvents(query: TimelineQuery): Promise<TimelineEvent[]>;
  
  // Weather operations
  getWeatherData(lat?: number, lng?: number, isCurrentOnly?: boolean): Promise<WeatherData[]>;
  createWeatherData(weather: InsertWeatherData): Promise<WeatherData>;
  getWeatherAlerts(lat?: number, lng?: number, activeOnly?: boolean): Promise<WeatherAlert[]>;
  createWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert>;
  updateWeatherAlert(id: string, updates: Partial<InsertWeatherAlert>): Promise<WeatherAlert | null>;
  
  // Social media operations
  getSocialMediaPosts(filters?: {
    lat?: number; lng?: number; radiusKm?: number;
    sentiment?: string; country?: string; limit?: number;
  }): Promise<SocialMediaPost[]>;
  createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost>;
  createSocialMediaPostsBulk(posts: InsertSocialMediaPost[]): Promise<SocialMediaPost[]>;
  getSocialMediaPostsByLocation(lat: number, lng: number, radiusKm: number): Promise<SocialMediaPost[]>;
  getSocialMediaPostsBySentiment(sentiment: string): Promise<SocialMediaPost[]>;
  getSocialMediaInfluencers(minFollowers?: number): Promise<SocialMediaPost[]>;
  
  // Uploaded sources operations (Priority #5: Real source feeds)
  getUploadedSources(region?: string): Promise<UploadedSource[]>;
  getUploadedSourceById(id: string): Promise<UploadedSource | undefined>;
  createUploadedSource(source: InsertUploadedSource): Promise<UploadedSource>;
  updateUploadedSource(id: string, updates: Partial<InsertUploadedSource>): Promise<UploadedSource | null>;
  deleteUploadedSource(id: string): Promise<boolean>;
  getProcessedSources(region?: string): Promise<UploadedSource[]>;
  
  // Graph node operations
  getGraphNodes(filters?: GraphFilter): Promise<{ nodes: GraphNode[]; total: number }>;
  getGraphNodeById(id: string): Promise<GraphNode | undefined>;
  createGraphNode(node: InsertGraphNode): Promise<GraphNode>;
  updateGraphNode(id: string, updates: Partial<InsertGraphNode>): Promise<GraphNode | null>;
  deleteGraphNode(id: string): Promise<boolean>;
  
  // Graph edge operations
  getGraphEdges(nodeId?: string): Promise<GraphEdge[]>;
  createGraphEdge(edge: InsertGraphEdge): Promise<GraphEdge>;
  deleteGraphEdge(id: string): Promise<boolean>;
  
  // GIA Session operations
  getAssistantSessions(status?: string): Promise<AssistantSession[]>;
  getAssistantSessionById(id: string): Promise<AssistantSession | undefined>;
  createAssistantSession(session: InsertAssistantSession): Promise<AssistantSession>;
  updateAssistantSession(id: string, updates: Partial<InsertAssistantSession>): Promise<AssistantSession | null>;
  deleteAssistantSession(id: string): Promise<boolean>;
  
  // GIA Message operations
  getAssistantMessages(sessionId: string, limit?: number): Promise<AssistantMessage[]>;
  createAssistantMessage(message: InsertAssistantMessage): Promise<AssistantMessage>;
  updateAssistantMessage(id: string, updates: Partial<InsertAssistantMessage>): Promise<AssistantMessage | null>;
  
  // GIA Run operations
  getAssistantRuns(sessionId: string, limit?: number): Promise<AssistantRun[]>;
  getAssistantRunById(id: string): Promise<AssistantRun | undefined>;
  createAssistantRun(run: InsertAssistantRun): Promise<AssistantRun>;
  updateAssistantRun(id: string, updates: Partial<InsertAssistantRun>): Promise<AssistantRun | null>;
  
  // GDELT Intel operations
  getGdeltEvents(queryHash: string, limit?: number): Promise<IntelGdeltEvent[]>;
  upsertGdeltEvent(event: InsertIntelGdeltEvent): Promise<IntelGdeltEvent>;
  upsertGdeltEventsBulk(events: InsertIntelGdeltEvent[]): Promise<number>;
  getGdeltDocs(queryHash: string, limit?: number): Promise<IntelGdeltDoc[]>;
  upsertGdeltDoc(doc: InsertIntelGdeltDoc): Promise<IntelGdeltDoc>;
  upsertGdeltDocsBulk(docs: InsertIntelGdeltDoc[]): Promise<number>;
  getCacheState(queryHash: string): Promise<IntelCacheState | undefined>;
  upsertCacheState(state: InsertIntelCacheState): Promise<IntelCacheState>;
  createRefreshRun(run: InsertIntelRefreshRun): Promise<IntelRefreshRun>;
  updateRefreshRun(id: string, updates: Partial<InsertIntelRefreshRun>): Promise<IntelRefreshRun | null>;
  getRecentRefreshRuns(limit?: number): Promise<IntelRefreshRun[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatMessages: ChatMessage[];
  private analysisResults: AnalysisResult[];
  private riskAssessments: RiskAssessment[];
  private waypoints: Waypoint[];
  private geotaggedFiles: GeotaggedFile[];
  private weatherData: WeatherData[];
  private weatherAlerts: WeatherAlert[];
  private socialMediaPosts: SocialMediaPost[];
  private uploadedSources: UploadedSource[];
  private graphNodes: GraphNode[];
  private graphEdges: GraphEdge[];
  private assistantSessions: AssistantSession[];
  private assistantMessages: AssistantMessage[];
  private assistantRuns: AssistantRun[];

  constructor() {
    this.users = new Map();
    this.chatMessages = [];
    this.analysisResults = [];
    this.riskAssessments = [];
    this.waypoints = [];
    this.geotaggedFiles = [];
    this.weatherData = [];
    this.weatherAlerts = [];
    this.socialMediaPosts = [];
    this.uploadedSources = [];
    this.graphNodes = [];
    this.graphEdges = [];
    this.assistantSessions = [];
    this.assistantMessages = [];
    this.assistantRuns = [];
    
    // Initialize with external intelligence sources and sample weather data
    this.initializeExternalIntelligence();
    this.initializeSampleWeatherData();
    this.initializeSampleSocialMediaData();
    this.initializeSampleGraphNodes();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    return this.chatMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      contextIds: (insertMessage.contextIds as any) || []
    };
    this.chatMessages.push(message);
    return message;
  }

  async getAnalysisResults(fileId?: string): Promise<AnalysisResult[]> {
    if (fileId) {
      return this.analysisResults.filter(result => result.fileId === fileId);
    }
    return this.analysisResults;
  }

  async getAnalysisResultsByType(analysisType: string, region?: string): Promise<AnalysisResult[]> {
    return this.analysisResults
      .filter(result => {
        if (result.analysisType !== analysisType) return false;
        if (region && result.region !== region) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const result: AnalysisResult = {
      ...insertResult,
      id,
      timestamp: new Date(),
      fileId: insertResult.fileId || null,
      region: insertResult.region || null,
      aoiData: insertResult.aoiData || null,
      source: insertResult.source || null,
      sourceMetadata: insertResult.sourceMetadata || null
    };
    this.analysisResults.push(result);
    return result;
  }

  async getRiskAssessments(): Promise<RiskAssessment[]> {
    return this.riskAssessments
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = randomUUID();
    const assessment: RiskAssessment = {
      ...insertAssessment,
      id,
      timestamp: new Date(),
      riskFactors: (insertAssessment.riskFactors as any) || []
    };
    this.riskAssessments.push(assessment);
    return assessment;
  }

  async getWaypoints(): Promise<Waypoint[]> {
    return this.waypoints
      .filter(w => w.isActive !== false)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createWaypoint(insertWaypoint: InsertWaypoint): Promise<Waypoint> {
    const id = randomUUID();
    const waypoint: Waypoint = {
      ...insertWaypoint,
      id,
      timestamp: new Date(),
      description: insertWaypoint.description || null,
      intelligenceData: insertWaypoint.intelligenceData || null,
      isActive: insertWaypoint.isActive !== false
    };
    this.waypoints.push(waypoint);
    return waypoint;
  }

  async updateWaypoint(id: string, updates: Partial<InsertWaypoint>): Promise<Waypoint | null> {
    const index = this.waypoints.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    this.waypoints[index] = { ...this.waypoints[index], ...updates };
    return this.waypoints[index];
  }

  async deleteWaypoint(id: string): Promise<boolean> {
    const index = this.waypoints.findIndex(w => w.id === id);
    if (index === -1) return false;
    
    this.waypoints[index].isActive = false;
    return true;
  }

  async getGeotaggedFiles(): Promise<GeotaggedFile[]> {
    return this.geotaggedFiles
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createGeotaggedFile(insertFile: InsertGeotaggedFile): Promise<GeotaggedFile> {
    const id = randomUUID();
    const file: GeotaggedFile = {
      ...insertFile,
      id,
      timestamp: new Date(),
      altitude: insertFile.altitude || null,
      accuracy: insertFile.accuracy || null,
      metadata: insertFile.metadata || null
    };
    this.geotaggedFiles.push(file);
    return file;
  }

  async getGeotaggedFilesByLocation(lat: number, lng: number, radiusKm: number): Promise<GeotaggedFile[]> {
    return this.geotaggedFiles.filter(file => {
      const distance = this.calculateDistance(lat, lng, file.lat, file.lng);
      return distance <= radiusKm;
    });
  }

  async deleteGeotaggedFile(id: string): Promise<boolean> {
    const index = this.geotaggedFiles.findIndex(f => f.id === id);
    if (index === -1) return false;
    
    this.geotaggedFiles.splice(index, 1);
    return true;
  }

  async searchAll(query: SearchQuery): Promise<SearchResult[]> {
    const searchTerm = query.q.toLowerCase();
    const results: SearchResult[] = [];
    
    // Search waypoints
    if (!query.filters?.type || query.filters.type === 'waypoint') {
      for (const waypoint of this.waypoints) {
        if (!waypoint.isActive) continue;
        
        const score = this.calculateSearchScore(searchTerm, [
          waypoint.name,
          waypoint.description || '',
          waypoint.type,
          JSON.stringify(waypoint.intelligenceData || {})
        ]);
        
        if (score > 0) {
          results.push({
            id: waypoint.id,
            type: 'waypoint',
            title: waypoint.name,
            snippet: this.createSnippet(searchTerm, [waypoint.name, waypoint.description || '', waypoint.type]),
            tags: [waypoint.type],
            timestamp: waypoint.timestamp.toISOString(),
            score,
            location: { lat: waypoint.lat, lng: waypoint.lng },
            context: { type: waypoint.type, description: waypoint.description }
          });
        }
      }
    }
    
    // Search geotagged files
    if (!query.filters?.type || query.filters.type === 'geotagged') {
      for (const file of this.geotaggedFiles) {
        const score = this.calculateSearchScore(searchTerm, [
          file.filename,
          file.source,
          JSON.stringify(file.metadata || {})
        ]);
        
        if (score > 0) {
          results.push({
            id: file.id,
            type: 'geotagged',
            title: file.filename,
            snippet: this.createSnippet(searchTerm, [file.filename, file.source]),
            tags: [file.source],
            timestamp: file.timestamp.toISOString(),
            score,
            location: { lat: file.lat, lng: file.lng },
            context: { source: file.source, metadata: file.metadata }
          });
        }
      }
    }
    
    // Search PMESII analysis results
    if (!query.filters?.type || query.filters.type === 'pmesii') {
      for (const result of this.analysisResults) {
        if (result.analysisType !== 'pmesii') continue;
        
        const score = this.calculateSearchScore(searchTerm, [
          result.region || '',
          result.source || '',
          JSON.stringify(result.results),
          JSON.stringify(result.aoiData || {}),
          JSON.stringify(result.sourceMetadata || {})
        ]);
        
        if (score > 0) {
          const sourcePrefix = result.source ? `[${result.source.toUpperCase()}] ` : '';
          results.push({
            id: result.id,
            type: 'pmesii',
            title: `${sourcePrefix}PMESII Analysis - ${result.region || 'Unknown Region'}`,
            snippet: this.createSnippet(searchTerm, [result.region || '', JSON.stringify(result.results)]),
            tags: ['pmesii', 'analysis', ...(result.source ? [result.source] : [])],
            timestamp: result.timestamp.toISOString(),
            score,
            context: { 
              region: result.region, 
              analysisType: result.analysisType,
              source: result.source || undefined,
              sourceMetadata: result.sourceMetadata 
            }
          });
        }
      }
    }
    
    // Search intelligence analysis results
    if (!query.filters?.type || query.filters.type === 'intelligence') {
      for (const result of this.analysisResults) {
        if (result.analysisType === 'pmesii') continue;
        
        const score = this.calculateSearchScore(searchTerm, [
          result.analysisType,
          result.region || '',
          result.source || '',
          JSON.stringify(result.results),
          JSON.stringify(result.sourceMetadata || {})
        ]);
        
        if (score > 0) {
          const sourcePrefix = result.source ? `[${result.source.toUpperCase()}] ` : '';
          results.push({
            id: result.id,
            type: 'intelligence',
            title: `${sourcePrefix}${result.analysisType} Analysis - ${result.region || 'Unknown Region'}`,
            snippet: this.createSnippet(searchTerm, [result.analysisType, JSON.stringify(result.results)]),
            tags: [result.analysisType, 'analysis', ...(result.source ? [result.source] : [])],
            timestamp: result.timestamp.toISOString(),
            score,
            context: { 
              region: result.region, 
              analysisType: result.analysisType,
              source: result.source || undefined,
              sourceMetadata: result.sourceMetadata 
            }
          });
        }
      }
    }
    
    // Note: Social media search functionality moved to DatabaseStorage
    /*
      for (const post of this.socialMediaPosts) {
        const score = this.calculateSearchScore(searchTerm, [
          post.message,
          post.senderScreenName,
          post.location || '',
          post.country || '',
          post.sentiment || '',
          JSON.stringify({ 
            retweets: post.retweets, 
            favorites: post.favorites,
            followers: post.senderFollowersCount 
          })
        ]);
        
        if (score > 0) {
          results.push({
            id: post.id,
            type: 'intelligence',
            title: `${post.socialNetwork} - @${post.senderScreenName}`,
            snippet: this.createSnippet(searchTerm, [post.message, post.location || '']),
            tags: ['social-media', post.socialNetwork.toLowerCase(), ...(post.sentiment ? [post.sentiment.toLowerCase()] : [])],
            timestamp: post.timestamp.toISOString(),
            score,
            location: post.lat && post.lng ? { lat: post.lat, lng: post.lng } : undefined,
            context: { 
              sentiment: post.sentiment,
              location: post.location,
              engagement: {
                retweets: post.retweets,
                favorites: post.favorites,
                followers: post.senderFollowersCount
              }
            }
          });
        }
      }
    */
    
    // Search risk assessments
    if (!query.filters?.type || query.filters.type === 'risk') {
      for (const assessment of this.riskAssessments) {
        const aoiName = (assessment.aoi as any)?.name || '';
        const riskFactors = Array.isArray(assessment.riskFactors) ? assessment.riskFactors.join(' ') : '';
        
        const score = this.calculateSearchScore(searchTerm, [
          aoiName,
          riskFactors,
          assessment.riskScore.toString()
        ]);
        
        if (score > 0) {
          results.push({
            id: assessment.id,
            type: 'risk',
            title: `Risk Assessment - ${aoiName}`,
            snippet: this.createSnippet(searchTerm, [aoiName, riskFactors]),
            tags: ['risk', 'assessment'],
            timestamp: assessment.timestamp.toISOString(),
            score,
            location: (assessment.aoi as any)?.lat && (assessment.aoi as any)?.lng ? 
              { lat: (assessment.aoi as any).lat, lng: (assessment.aoi as any).lng } : undefined,
            context: { riskScore: assessment.riskScore, aoi: assessment.aoi }
          });
        }
      }
    }
    
    // Apply filters
    let filteredResults = results;
    
    if (query.filters?.region) {
      const { lat, lng, radius } = query.filters.region;
      filteredResults = results.filter(result => {
        if (!result.location) return false;
        const distance = this.calculateDistance(lat, lng, result.location.lat, result.location.lng);
        return distance <= radius;
      });
    }
    
    if (query.filters?.timeRange) {
      const start = new Date(query.filters.timeRange.start);
      const end = new Date(query.filters.timeRange.end);
      filteredResults = filteredResults.filter(result => {
        const timestamp = new Date(result.timestamp);
        return timestamp >= start && timestamp <= end;
      });
    }
    
    // Sort by score (descending) and limit results
    return filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 50);
  }
  
  private calculateSearchScore(searchTerm: string, fields: string[]): number {
    let score = 0;
    
    for (const field of fields) {
      const fieldLower = field.toLowerCase();
      
      // Exact match gets highest score
      if (fieldLower === searchTerm) {
        score += 1.0;
      }
      // Starts with search term gets high score
      else if (fieldLower.startsWith(searchTerm)) {
        score += 0.8;
      }
      // Contains search term gets medium score
      else if (fieldLower.includes(searchTerm)) {
        score += 0.6;
      }
      // Word boundary matches get lower score
      else if (new RegExp(`\\b${searchTerm}\\b`).test(fieldLower)) {
        score += 0.4;
      }
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }
  
  private createSnippet(searchTerm: string, fields: string[]): string {
    for (const field of fields) {
      const fieldLower = field.toLowerCase();
      const index = fieldLower.indexOf(searchTerm);
      
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(field.length, index + searchTerm.length + 30);
        let snippet = field.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < field.length) snippet = snippet + '...';
        
        return snippet;
      }
    }
    
    // Return first non-empty field if no match found
    return fields.find(f => f.trim().length > 0)?.substring(0, 100) || '';
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private initializeExternalIntelligence(): void {
    // Seerist threat intelligence reports
    this.analysisResults.push({
      id: "seerist-dhaka-civil-unrest-001",
      fileId: null,
      analysisType: 'intelligence',
      results: {
        title: "Security Alert: Heightened Civil Unrest Risk in Dhaka",
        severity: 7,
        category: "Political Violence",
        summary: "Seerist AI has detected elevated risk indicators for civil unrest in Dhaka metropolitan area. Social media sentiment analysis shows increasing anti-government discourse, while economic indicators suggest growing public dissatisfaction.",
        threats: [
          "Student protests likely to escalate near university campuses",
          "Transportation hubs at high risk for disruption",
          "Government buildings may see increased security presence"
        ],
        riskFactors: [
          "Youth unemployment at 15-month high",
          "Recent fuel price increases",
          "Opposition party mobilization activities"
        ],
        confidence: {
          source: 0.89,
          timing: 0.72,
          impact: 0.84,
          overall: 0.82
        }
      },
      region: "Dhaka, Bangladesh",
      aoiData: {
        name: "Dhaka Metropolitan Area",
        lat: 23.8103,
        lng: 90.4125,
        radiusKm: 25
      },
      source: "seerist",
      sourceMetadata: {
        reportId: "SR-2025-BD-001",
        analystId: "AI-Engine-001",
        dataSourceCount: 2847,
        osintSources: 156,
        socialMediaPosts: 12453,
        newsArticles: 89,
        governmentAlerts: 3
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    });

    this.analysisResults.push({
      id: "seerist-south-asia-infrastructure-002",
      fileId: null,
      analysisType: 'intelligence',
      results: {
        title: "Critical Infrastructure Vulnerability Assessment",
        severity: 9,
        category: "Infrastructure Security",
        summary: "Seerist analysis indicates potential vulnerabilities in power grid infrastructure across South Asia region. Cyber threat indicators suggest coordinated reconnaissance activities targeting electrical substations.",
        threats: [
          "SCADA system intrusion attempts detected",
          "Physical surveillance of electrical facilities reported",
          "Supply chain compromises affecting critical components"
        ],
        riskFactors: [
          "Aging infrastructure with limited cybersecurity measures",
          "Geopolitical tensions affecting regional stability",
          "Increased dependency on foreign technology components"
        ],
        confidence: {
          source: 0.95,
          timing: 0.88,
          impact: 0.91,
          overall: 0.91
        }
      },
      region: "South Asia",
      aoiData: {
        name: "South Asia Power Grid",
        lat: 23.5,
        lng: 78.0,
        radiusKm: 2000
      },
      source: "seerist",
      sourceMetadata: {
        reportId: "SR-2025-SA-003",
        analystId: "Control-Risks-Expert-007",
        dataSourceCount: 1245,
        governmentSources: 12,
        industrialPartners: 8,
        classificationLevel: "UNCLASSIFIED//FOR OFFICIAL USE ONLY"
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    });

    // Fraym geospatial intelligence reports
    this.analysisResults.push({
      id: "fraym-population-displacement-001",
      fileId: null,
      analysisType: 'intelligence',
      results: {
        title: "Population Displacement Patterns in Border Regions",
        category: "Humanitarian Intelligence",
        summary: "Fraym's high-resolution demographic analysis reveals significant population displacement patterns along the Myanmar-Bangladesh border. Satellite imagery combined with mobile phone data indicates 15,000+ individuals have relocated in the past 30 days.",
        insights: [
          "Cox's Bazar district showing 23% population increase",
          "Rural areas experiencing highest displacement rates",
          "Women and children comprise 67% of displaced population"
        ],
        demographics: {
          totalDisplaced: 15847,
          averageAge: 28.5,
          householdSize: 4.2,
          childrenUnder15: 0.34,
          femaleRatio: 0.52
        },
        economicImpact: {
          localGdpReduction: 0.08,
          unemploymentIncrease: 0.12,
          infrastructureStrain: "HIGH"
        }
      },
      region: "Cox's Bazar, Bangladesh",
      aoiData: {
        name: "Myanmar-Bangladesh Border Region",
        lat: 21.4272,
        lng: 92.0058,
        radiusKm: 50
      },
      source: "fraym",
      sourceMetadata: {
        datasetId: "FRAYM-BD-DISP-2025-Q1",
        resolutionKm: 1,
        satelliteImageryDate: "2025-01-15",
        mobileDataPoints: 245783,
        surveyResponses: 1247,
        confidenceInterval: 0.95,
        methodology: "ML-Enhanced Geospatial Analysis"
      },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    this.analysisResults.push({
      id: randomUUID(),
      fileId: null,
      analysisType: 'pmesii',
      results: {
        political: {
          stability: 6.2,
          governance: "Moderate local government capacity, increasing refugee registration efforts",
          keyActors: ["Local government officials", "UNHCR representatives", "Community leaders"]
        },
        military: {
          presence: "Limited border patrol activity, humanitarian security coordination",
          capability: 4.1,
          threats: "Cross-border tensions, potential for spillover violence"
        },
        economic: {
          conditions: "Local economy strained by population influx, aid dependency increasing",
          gdpImpact: -8.3,
          employmentRate: 0.71
        },
        social: {
          cohesion: "Tensions between host and displaced communities emerging",
          services: "Healthcare and education systems at capacity",
          culturalFactors: "Language barriers affecting integration"
        },
        information: {
          connectivity: "Mobile network coverage improving, information access limited",
          mediaInfluence: "Local radio primary information source",
          misinformation: "Moderate risk of rumors affecting community relations"
        },
        infrastructure: {
          capacity: "Water and sanitation systems severely strained",
          transportation: "Road networks congested, emergency access limited",
          utilities: "Power grid unstable, temporary solutions deployed"
        }
      },
      region: "Cox's Bazar District",
      aoiData: {
        name: "Cox's Bazar Humanitarian Zone",
        lat: 21.4272,
        lng: 92.0058,
        radiusKm: 25
      },
      source: "fraym",
      sourceMetadata: {
        datasetId: "FRAYM-BD-PMESII-2025-001",
        indicatorCount: 47,
        householdSurveys: 2845,
        keyInformantInterviews: 156,
        satelliteAnalysis: true,
        fieldTeamReports: 23
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });
  }

  async getTimelineEvents(query: TimelineQuery): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];
    const { limit = 100, filters } = query;
    
    // Add chat messages as timeline events
    if (!filters?.types || filters.types.includes('chat')) {
      for (const message of this.chatMessages) {
        events.push({
          id: message.id,
          type: 'chat',
          title: `Chat Message - ${message.role}`,
          description: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
          timestamp: message.timestamp.toISOString(),
          metadata: { role: message.role, contextIds: message.contextIds }
        });
      }
    }
    
    // Add intelligence analysis results as timeline events  
    if (!filters?.types || filters.types.includes('intelligence')) {
      for (const result of this.analysisResults) {
        if (result.analysisType === 'pmesii') continue; // Handle PMESII separately
        
        const resultData = result.results as any;
        const severity = this.mapSeverityToLevel(resultData.severity);
        const sourcePrefix = result.source ? `[${result.source.toUpperCase()}] ` : '';
        
        events.push({
          id: result.id,
          type: 'intelligence',
          title: `${sourcePrefix}${resultData.title || 'Intelligence Report'}`,
          description: resultData.summary || resultData.description || 'Intelligence analysis completed',
          timestamp: result.timestamp.toISOString(),
          severity,
          location: result.aoiData && (result.aoiData as any)?.lat && (result.aoiData as any)?.lng ? 
            { lat: (result.aoiData as any).lat, lng: (result.aoiData as any).lng } : undefined,
          source: result.source || undefined,
          metadata: { 
            analysisType: result.analysisType, 
            region: result.region,
            sourceMetadata: result.sourceMetadata
          }
        });
      }
    }
    
    // Add PMESII analysis results as timeline events
    if (!filters?.types || filters.types.includes('pmesii')) {
      for (const result of this.analysisResults) {
        if (result.analysisType !== 'pmesii') continue;
        
        const sourcePrefix = result.source ? `[${result.source.toUpperCase()}] ` : '';
        events.push({
          id: result.id,
          type: 'pmesii',
          title: `${sourcePrefix}PMESII Analysis - ${result.region}`,
          description: `Multi-factor analysis completed for ${result.region}`,
          timestamp: result.timestamp.toISOString(),
          severity: 'MEDIUM', // PMESII analyses are generally medium priority
          location: result.aoiData && (result.aoiData as any)?.lat && (result.aoiData as any)?.lng ? 
            { lat: (result.aoiData as any).lat, lng: (result.aoiData as any).lng } : undefined,
          source: result.source || undefined,
          metadata: { 
            analysisType: result.analysisType, 
            region: result.region,
            sourceMetadata: result.sourceMetadata 
          }
        });
      }
    }
    
    // Add risk assessments as timeline events
    if (!filters?.types || filters.types.includes('risk')) {
      for (const assessment of this.riskAssessments) {
        const aoiName = (assessment.aoi as any)?.name || 'Unknown Area';
        const riskLevel = assessment.riskScore > 0.8 ? 'CRITICAL' : 
                         assessment.riskScore > 0.6 ? 'HIGH' :
                         assessment.riskScore > 0.4 ? 'MEDIUM' : 'LOW';
        
        events.push({
          id: assessment.id,
          type: 'risk',
          title: `Risk Assessment - ${aoiName}`,
          description: `Risk score: ${Math.round(assessment.riskScore * 100)}% - ${riskLevel} risk level`,
          timestamp: assessment.timestamp.toISOString(),
          severity: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          location: (assessment.aoi as any)?.lat && (assessment.aoi as any)?.lng ? 
            { lat: (assessment.aoi as any).lat, lng: (assessment.aoi as any).lng } : undefined,
          metadata: { riskScore: assessment.riskScore, aoi: assessment.aoi, riskFactors: assessment.riskFactors }
        });
      }
    }
    
    // Add waypoints as timeline events
    if (!filters?.types || filters.types.includes('waypoint')) {
      for (const waypoint of this.waypoints) {
        if (!waypoint.isActive) continue;
        
        events.push({
          id: waypoint.id,
          type: 'waypoint',
          title: `Waypoint Created - ${waypoint.name}`,
          description: waypoint.description || `${waypoint.type} waypoint at ${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}`,
          timestamp: waypoint.timestamp.toISOString(),
          severity: waypoint.type === 'target' ? 'HIGH' : 
                   waypoint.type === 'safe_house' ? 'MEDIUM' : 'LOW',
          location: { lat: waypoint.lat, lng: waypoint.lng },
          metadata: { 
            type: waypoint.type, 
            description: waypoint.description,
            intelligenceData: waypoint.intelligenceData 
          }
        });
      }
    }
    
    // Add geotagged files as timeline events
    if (!filters?.types || filters.types.includes('file')) {
      for (const file of this.geotaggedFiles) {
        events.push({
          id: file.id,
          type: 'file',
          title: `File Upload - ${file.filename}`,
          description: `Geotagged file uploaded from ${file.source} at ${file.lat.toFixed(4)}, ${file.lng.toFixed(4)}`,
          timestamp: file.timestamp.toISOString(),
          severity: 'LOW', // Files are generally low priority events
          location: { lat: file.lat, lng: file.lng },
          metadata: { 
            filename: file.filename, 
            source: file.source, 
            metadata: file.metadata 
          }
        });
      }
    }
    
    // Add weather data and alerts as timeline events
    if (!filters?.types || filters.types.includes('weather')) {
      // Add weather alerts
      for (const alert of this.weatherAlerts) {
        events.push({
          id: alert.id,
          type: 'weather',
          title: `Weather Alert - ${alert.title}`,
          description: alert.description,
          timestamp: alert.timestamp.toISOString(),
          severity: alert.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          location: { lat: alert.lat, lng: alert.lng },
          source: 'weather',
          metadata: { 
            alertType: alert.alertType,
            location: alert.location,
            isActive: alert.isActive,
            startTime: alert.startTime,
            endTime: alert.endTime,
            weatherData: alert.weatherData
          }
        });
      }
      
      // Add significant weather data (only current weather and notable conditions)
      for (const weather of this.weatherData) {
        if (!weather.isCurrentWeather) continue; // Only current weather for timeline
        
        // Only add notable weather conditions to timeline
        const isNotable = 
          weather.temperature < 0 || weather.temperature > 35 || // Extreme temperatures
          (weather.windSpeed && weather.windSpeed > 50) || // High winds
          (weather.precipitation && weather.precipitation > 10) || // Heavy precipitation
          (weather.visibility && weather.visibility < 5); // Poor visibility
          
        if (!isNotable) continue;
        
        const weatherDescription = `Current weather: ${weather.temperature}°C, ${
          weather.precipitation && weather.precipitation > 0 ? `${weather.precipitation}mm rain, ` : ''
        }${weather.windSpeed ? `wind ${weather.windSpeed}km/h` : ''}${
          weather.visibility ? `, visibility ${weather.visibility}km` : ''
        }`;
        
        events.push({
          id: weather.id,
          type: 'weather',
          title: `Weather Update - ${weather.location}`,
          description: weatherDescription,
          timestamp: weather.timestamp.toISOString(),
          severity: isNotable ? (
            weather.temperature < -10 || weather.temperature > 40 || 
            (weather.windSpeed && weather.windSpeed > 80) ||
            (weather.precipitation && weather.precipitation > 50) ? 'HIGH' : 'MEDIUM'
          ) : 'LOW',
          location: { lat: weather.lat, lng: weather.lng },
          source: weather.dataSource || 'open-meteo',
          metadata: { 
            temperature: weather.temperature,
            weatherCode: weather.weatherCode,
            windSpeed: weather.windSpeed,
            precipitation: weather.precipitation,
            visibility: weather.visibility
          }
        });
      }
    }
    
    // Apply filters
    let filteredEvents = events;
    
    // Filter by date range
    if (filters?.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    // Filter by severity
    if (filters?.severity && filters.severity.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        event.severity && filters.severity!.includes(event.severity)
      );
    }
    
    // Filter by sources
    if (filters?.sources && filters.sources.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        event.source && filters.sources!.includes(event.source)
      );
    }
    
    // Sort by timestamp (most recent first) and limit
    return filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  // Weather operations
  async getWeatherData(lat?: number, lng?: number, isCurrentOnly?: boolean): Promise<WeatherData[]> {
    let data = this.weatherData;
    
    // Filter by location if provided
    if (lat !== undefined && lng !== undefined) {
      data = data.filter(w => 
        Math.abs(w.lat - lat) < 0.1 && Math.abs(w.lng - lng) < 0.1
      );
    }
    
    // Filter by current weather only if requested
    if (isCurrentOnly) {
      data = data.filter(w => w.isCurrentWeather);
    }
    
    return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createWeatherData(insertWeather: InsertWeatherData): Promise<WeatherData> {
    const id = randomUUID();
    const weather: WeatherData = {
      id,
      lat: insertWeather.lat,
      lng: insertWeather.lng,
      location: insertWeather.location,
      weatherCode: insertWeather.weatherCode,
      temperature: insertWeather.temperature,
      apparentTemperature: insertWeather.apparentTemperature ?? null,
      humidity: insertWeather.humidity ?? null,
      dewPoint: insertWeather.dewPoint ?? null,
      precipitation: insertWeather.precipitation ?? null,
      precipitationProbability: insertWeather.precipitationProbability ?? null,
      windSpeed: insertWeather.windSpeed ?? null,
      windDirection: insertWeather.windDirection ?? null,
      windGusts: insertWeather.windGusts ?? null,
      pressure: insertWeather.pressure ?? null,
      visibility: insertWeather.visibility ?? null,
      cloudCover: insertWeather.cloudCover ?? null,
      uvIndex: insertWeather.uvIndex ?? null,
      isCurrentWeather: insertWeather.isCurrentWeather ?? false,
      forecastTime: insertWeather.forecastTime ?? null,
      dataSource: insertWeather.dataSource ?? "open-meteo",
      timestamp: new Date()
    };
    this.weatherData.push(weather);
    return weather;
  }

  async getWeatherAlerts(lat?: number, lng?: number, activeOnly?: boolean): Promise<WeatherAlert[]> {
    let alerts = this.weatherAlerts;
    
    // Filter by location if provided
    if (lat !== undefined && lng !== undefined) {
      alerts = alerts.filter(a => 
        Math.abs(a.lat - lat) < 0.1 && Math.abs(a.lng - lng) < 0.1
      );
    }
    
    // Filter by active alerts only if requested
    if (activeOnly) {
      const now = new Date();
      alerts = alerts.filter(a => 
        a.isActive && 
        new Date(a.startTime) <= now && 
        (!a.endTime || new Date(a.endTime) >= now)
      );
    }
    
    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createWeatherAlert(insertAlert: InsertWeatherAlert): Promise<WeatherAlert> {
    const id = randomUUID();
    const alert: WeatherAlert = {
      id,
      lat: insertAlert.lat,
      lng: insertAlert.lng,
      location: insertAlert.location,
      alertType: insertAlert.alertType,
      severity: insertAlert.severity,
      title: insertAlert.title,
      description: insertAlert.description,
      startTime: insertAlert.startTime,
      endTime: insertAlert.endTime ?? null,
      isActive: insertAlert.isActive ?? true,
      weatherData: insertAlert.weatherData ?? null,
      timestamp: new Date()
    };
    this.weatherAlerts.push(alert);
    return alert;
  }

  async updateWeatherAlert(id: string, updates: Partial<InsertWeatherAlert>): Promise<WeatherAlert | null> {
    const alertIndex = this.weatherAlerts.findIndex(a => a.id === id);
    if (alertIndex === -1) return null;
    
    const updatedAlert = { ...this.weatherAlerts[alertIndex], ...updates };
    this.weatherAlerts[alertIndex] = updatedAlert;
    return updatedAlert;
  }

  // Social media operations implementation
  async getSocialMediaPosts(filters?: {
    lat?: number; lng?: number; radiusKm?: number;
    sentiment?: string; country?: string; limit?: number;
  }): Promise<SocialMediaPost[]> {
    let posts = [...this.socialMediaPosts];
    
    if (filters) {
      if (filters.lat && filters.lng && filters.radiusKm) {
        posts = posts.filter(post => {
          if (!post.lat || !post.lng) return false;
          const distance = this.calculateDistance(filters.lat!, filters.lng!, post.lat, post.lng);
          return distance <= filters.radiusKm!;
        });
      }
      
      if (filters.sentiment) {
        posts = posts.filter(post => post.sentiment === filters.sentiment);
      }
      
      if (filters.country) {
        posts = posts.filter(post => post.country === filters.country);
      }
      
      if (filters.limit) {
        posts = posts.slice(0, filters.limit);
      }
    }
    
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createSocialMediaPost(insertPost: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const id = randomUUID();
    const post: SocialMediaPost = {
      ...insertPost,
      id,
      timestamp: new Date(),
      senderListedName: insertPost.senderListedName || null,
      senderProfileImgUrl: insertPost.senderProfileImgUrl || null,
      senderProfileLink: insertPost.senderProfileLink || null,
      senderFollowersCount: insertPost.senderFollowersCount || null,
      senderInfluencerScore: insertPost.senderInfluencerScore || null,
      senderAge: insertPost.senderAge || null,
      senderGender: insertPost.senderGender || null,
      originalAuthor: insertPost.originalAuthor || null,
      originalAuthorProfileLink: insertPost.originalAuthorProfileLink || null,
      title: insertPost.title || null,
      language: insertPost.language || null,
      languageCode: insertPost.languageCode || null,
      countryCode: insertPost.countryCode || null,
      mediaTypeList: insertPost.mediaTypeList || null,
      domain: insertPost.domain || null,
      retweets: insertPost.retweets || 0,
      tweetGenerator: insertPost.tweetGenerator || null,
      favorites: insertPost.favorites || 0,
      sentiment: insertPost.sentiment || null,
      location: insertPost.location || null,
      country: insertPost.country || null,
      state: insertPost.state || null,
      city: insertPost.city || null,
      lat: insertPost.lat || null,
      lng: insertPost.lng || null,
      conversationId: insertPost.conversationId || null,
      campaignName: insertPost.campaignName || null,
      isSpam: insertPost.isSpam || false,
      platform: insertPost.platform || null
    };
    this.socialMediaPosts.push(post);
    return post;
  }

  async createSocialMediaPostsBulk(insertPosts: InsertSocialMediaPost[]): Promise<SocialMediaPost[]> {
    const posts: SocialMediaPost[] = [];
    for (const insertPost of insertPosts) {
      const post = await this.createSocialMediaPost(insertPost);
      posts.push(post);
    }
    return posts;
  }

  async getSocialMediaPostsByLocation(lat: number, lng: number, radiusKm: number): Promise<SocialMediaPost[]> {
    return this.getSocialMediaPosts({ lat, lng, radiusKm });
  }

  async getSocialMediaPostsBySentiment(sentiment: string): Promise<SocialMediaPost[]> {
    return this.getSocialMediaPosts({ sentiment });
  }

  async getSocialMediaInfluencers(minFollowers: number = 1000): Promise<SocialMediaPost[]> {
    return this.socialMediaPosts
      .filter(post => (post.senderFollowersCount || 0) >= minFollowers)
      .sort((a, b) => (b.senderFollowersCount || 0) - (a.senderFollowersCount || 0))
      .slice(0, 50);
  }

  // Uploaded sources operations (Priority #5: Real source feeds)
  async getUploadedSources(region?: string): Promise<UploadedSource[]> {
    let sources = this.uploadedSources;
    if (region) {
      sources = sources.filter(s => s.region === region || !s.region);
    }
    return sources.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getUploadedSourceById(id: string): Promise<UploadedSource | undefined> {
    return this.uploadedSources.find(s => s.id === id);
  }

  async createUploadedSource(source: InsertUploadedSource): Promise<UploadedSource> {
    const id = randomUUID();
    const newSource: UploadedSource = {
      id,
      filename: source.filename,
      originalFilename: source.originalFilename,
      mimeType: source.mimeType,
      fileSize: source.fileSize,
      sourceType: source.sourceType,
      extractedText: source.extractedText ?? null,
      summary: source.summary ?? null,
      pmesiiCategories: (source.pmesiiCategories as string[]) || [],
      relevanceScore: source.relevanceScore ?? null,
      lat: source.lat ?? null,
      lng: source.lng ?? null,
      region: source.region ?? null,
      isProcessed: source.isProcessed ?? false,
      processingError: source.processingError ?? null,
      timestamp: new Date(),
    };
    this.uploadedSources.push(newSource);
    console.log(`[Sources] Created uploaded source: ${source.originalFilename} (${id})`);
    return newSource;
  }

  async updateUploadedSource(id: string, updates: Partial<InsertUploadedSource>): Promise<UploadedSource | null> {
    const index = this.uploadedSources.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    const existing = this.uploadedSources[index];
    this.uploadedSources[index] = {
      ...existing,
      ...updates,
      pmesiiCategories: updates.pmesiiCategories 
        ? (updates.pmesiiCategories as string[]) 
        : existing.pmesiiCategories,
    };
    console.log(`[Sources] Updated source: ${id}`);
    return this.uploadedSources[index];
  }

  async deleteUploadedSource(id: string): Promise<boolean> {
    const index = this.uploadedSources.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.uploadedSources.splice(index, 1);
    console.log(`[Sources] Deleted source: ${id}`);
    return true;
  }

  async getProcessedSources(region?: string): Promise<UploadedSource[]> {
    let sources = this.uploadedSources.filter(s => s.isProcessed === true);
    if (region) {
      sources = sources.filter(s => s.region === region || !s.region);
    }
    return sources.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private async initializeSampleSocialMediaData() {
    // Add sample social media posts from Bangladesh with geolocation and sentiment data
    const samplePosts: InsertSocialMediaPost[] = [
      {
        universalMessageId: "TWITTER_SAMPLE_001",
        socialNetwork: "TWITTER",
        platform: "Twitter",
        senderUserId: "bangladeshi_user_001",
        senderScreenName: "dhaka_observer",
        senderListedName: "Dhaka City Observer",
        message: "Peaceful protest gathering at Shahbag Square demanding justice. Large crowd maintaining order. #DhakaUpdate #Bangladesh",
        messageType: "X Update",
        createdTime: Date.now() / 1000 - 3600,
        countryCode: "BD",
        permalink: "https://twitter.com/dhaka_observer/status/sample001",
        sentiment: "NEUTRAL",
        location: "Shahbag, Dhaka",
        country: "Bangladesh",
        state: "Dhaka",
        city: "Dhaka",
        lat: 23.8103,
        lng: 90.4125,
        senderFollowersCount: 5420,
        retweets: 23,
        favorites: 67
      },
      {
        universalMessageId: "FACEBOOK_SAMPLE_002", 
        socialNetwork: "FACEBOOK",
        platform: "Facebook",
        senderUserId: "chittagong_news_bd",
        senderScreenName: "ChittagongNews",
        senderListedName: "Chittagong News Network",
        message: "Great news! New economic zone creating thousands of jobs in Chittagong. Development continues! 🇧🇩 #EconomicGrowth #Bangladesh",
        messageType: "Facebook Post",
        createdTime: Date.now() / 1000 - 7200,
        countryCode: "BD",
        permalink: "https://facebook.com/ChittagongNews/post/sample002",
        sentiment: "POSITIVE",
        location: "Chittagong, Bangladesh", 
        country: "Bangladesh",
        state: "Chittagong",
        city: "Chittagong",
        lat: 22.3569,
        lng: 91.7832,
        senderFollowersCount: 12500,
        retweets: 89,
        favorites: 245
      },
      {
        universalMessageId: "INSTAGRAM_SAMPLE_003",
        socialNetwork: "INSTAGRAM",
        platform: "Instagram",
        senderUserId: "dhaka_street_photographer",
        senderScreenName: "DhakaStreets",
        senderListedName: "Dhaka Street Photography",
        message: "Capturing the vibrant life of Old Dhaka markets. The colors and energy here are incredible! #DhakaLife #StreetPhotography #Bangladesh",
        messageType: "Instagram Post",
        createdTime: Date.now() / 1000 - 5400,
        countryCode: "BD", 
        permalink: "https://instagram.com/p/sample003",
        sentiment: "POSITIVE",
        location: "Old Dhaka, Bangladesh",
        country: "Bangladesh",
        state: "Dhaka",
        city: "Dhaka",
        lat: 23.7104,
        lng: 90.4074,
        senderFollowersCount: 3250,
        retweets: 0,
        favorites: 156
      },
      {
        universalMessageId: "WHATSAPP_SAMPLE_004",
        socialNetwork: "WHATSAPP",
        platform: "WhatsApp",
        senderUserId: "sylhet_community_group",
        senderScreenName: "SylhetCommunity",
        senderListedName: "Sylhet Community Updates",
        message: "Weather alert: Heavy rains expected in Sylhet region today. Please stay safe and avoid unnecessary travel. Community centers open for shelter.",
        messageType: "WhatsApp Message",
        createdTime: Date.now() / 1000 - 1800,
        countryCode: "BD",
        permalink: "whatsapp://group/sylhet_community",
        sentiment: "NEUTRAL",
        location: "Sylhet, Bangladesh",
        country: "Bangladesh", 
        state: "Sylhet",
        city: "Sylhet",
        lat: 24.8949,
        lng: 91.8687,
        senderFollowersCount: 890,
        retweets: 0,
        favorites: 23
      },
      {
        universalMessageId: "TELEGRAM_SAMPLE_005",
        socialNetwork: "TELEGRAM",
        platform: "Telegram",
        senderUserId: "bangladesh_cyber_security",
        senderScreenName: "BDCyberWatch",
        senderListedName: "Bangladesh Cyber Security Alert",
        message: "⚠️ Security Alert: Increased phishing attempts targeting banking customers. Do not click suspicious links. Report to authorities immediately.",
        messageType: "Telegram Message",
        createdTime: Date.now() / 1000 - 9600,
        countryCode: "BD",
        permalink: "https://t.me/bd_cyber_security/sample005",
        sentiment: "NEGATIVE",
        location: "Dhaka, Bangladesh",
        country: "Bangladesh",
        state: "Dhaka", 
        city: "Dhaka",
        lat: 23.8103,
        lng: 90.4125,
        senderFollowersCount: 15600,
        retweets: 45,
        favorites: 78
      },
      {
        universalMessageId: "TIKTOK_SAMPLE_006",
        socialNetwork: "TIKTOK",
        platform: "TikTok",
        senderUserId: "bangladesh_youth_voice",
        senderScreenName: "BDYouthVoice",
        senderListedName: "Bangladesh Youth Voice",
        message: "Young entrepreneurs in Dhaka are revolutionizing tech startups! Innovation is our strength 💪 #BangladeshTech #Youth #Innovation",
        messageType: "TikTok Video",
        createdTime: Date.now() / 1000 - 14400,
        countryCode: "BD",
        permalink: "https://tiktok.com/@bdyouthvoice/video/sample006", 
        sentiment: "POSITIVE",
        location: "Dhaka, Bangladesh",
        country: "Bangladesh",
        state: "Dhaka",
        city: "Dhaka",
        lat: 23.8103,
        lng: 90.4125,
        senderFollowersCount: 28900,
        retweets: 234,
        favorites: 1250
      },
      {
        universalMessageId: "TWITTER_SAMPLE_003",
        socialNetwork: "TWITTER",
        platform: "Twitter", 
        senderUserId: "sylhet_student_union",
        senderScreenName: "SylhetStudents",
        senderListedName: "Sylhet Student Union",
        message: "University administration ignoring student demands again. This is unacceptable! We demand immediate action. #StudentRights #Sylhet",
        messageType: "X Update",
        createdTime: Date.now() / 1000 - 1800,
        countryCode: "BD",
        permalink: "https://twitter.com/SylhetStudents/status/sample003",
        sentiment: "NEGATIVE",
        location: "Sylhet, Bangladesh",
        country: "Bangladesh", 
        state: "Sylhet",
        city: "Sylhet",
        lat: 24.8949,
        lng: 91.8687,
        senderFollowersCount: 3200,
        retweets: 156,
        favorites: 402
      }
    ];

    // Initialize with sample data
    for (const post of samplePosts) {
      await this.createSocialMediaPost(post);
    }
  }

  private async initializeSampleWeatherData() {
    // Add sample current weather for Dhaka (tactical operations area)
    await this.createWeatherData({
      lat: 23.8103,
      lng: 90.4125,
      location: "Dhaka, Bangladesh",
      weatherCode: "3", // Overcast
      temperature: 28.5,
      apparentTemperature: 32.1,
      humidity: 78,
      dewPoint: 24.2,
      precipitation: 0,
      precipitationProbability: 15,
      windSpeed: 12,
      windDirection: 220,
      windGusts: 18,
      pressure: 1012,
      visibility: 8.5,
      cloudCover: 85,
      uvIndex: 6,
      isCurrentWeather: true,
      forecastTime: null,
      dataSource: "open-meteo"
    });

    // Add sample weather alert for operational awareness
    await this.createWeatherAlert({
      lat: 23.8103,
      lng: 90.4125,
      location: "Dhaka Metropolitan Area",
      alertType: "severe_weather",
      severity: "MEDIUM",
      title: "Thunderstorm Watch",
      description: "Moderate thunderstorms possible this evening. Reduced visibility and gusty winds expected. Monitor conditions for tactical operations.",
      startTime: new Date(),
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      isActive: true,
      weatherData: {
        thunderstormProbability: 65,
        gustWindSpeed: 45,
        visibility: 2.5
      }
    });
  }
  
  private mapSeverityToLevel(severity?: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined {
    if (typeof severity !== 'number') return undefined;
    if (severity >= 9) return 'CRITICAL';
    if (severity >= 7) return 'HIGH';
    if (severity >= 4) return 'MEDIUM';
    return 'LOW';
  }

  // Graph node operations
  async getGraphNodes(filters?: GraphFilter): Promise<{ nodes: GraphNode[]; total: number }> {
    let results = [...this.graphNodes];
    
    if (filters) {
      // Text search on labels
      if (filters.q) {
        const query = filters.q.toLowerCase();
        results = results.filter(n => 
          n.label.toLowerCase().includes(query) || 
          n.description?.toLowerCase().includes(query)
        );
      }
      
      // Type filter
      if (filters.type_in?.length) {
        results = results.filter(n => filters.type_in!.includes(n.nodeType as any));
      }
      
      // Layer filter
      if (filters.layer_in?.length) {
        results = results.filter(n => filters.layer_in!.includes(n.layer as any));
      }
      
      // Status filter
      if (filters.status_in?.length) {
        results = results.filter(n => n.status && filters.status_in!.includes(n.status as any));
      }
      
      // Severity filter
      if (filters.severity_in?.length) {
        results = results.filter(n => n.severity && filters.severity_in!.includes(n.severity as any));
      }
      
      // Sensitivity filter
      if (filters.sensitivity_in?.length) {
        results = results.filter(n => n.sensitivity && filters.sensitivity_in!.includes(n.sensitivity as any));
      }
      
      // Time range filter (createdAt)
      if (filters.time_from) {
        const from = new Date(filters.time_from);
        results = results.filter(n => n.createdAt >= from);
      }
      if (filters.time_to) {
        const to = new Date(filters.time_to);
        results = results.filter(n => n.createdAt <= to);
      }
      
      // Due date filter (for milestones)
      if (filters.due_from) {
        const from = new Date(filters.due_from);
        results = results.filter(n => n.dueDate && n.dueDate >= from);
      }
      if (filters.due_to) {
        const to = new Date(filters.due_to);
        results = results.filter(n => n.dueDate && n.dueDate <= to);
      }
      
      // Owner filter
      if (filters.owner) {
        results = results.filter(n => n.owner === filters.owner);
      }
      
      // Team filter
      if (filters.team) {
        results = results.filter(n => n.team === filters.team);
      }
      
      // Has location filter
      if (filters.has_location !== undefined) {
        if (filters.has_location) {
          results = results.filter(n => n.lat != null && n.lng != null);
        } else {
          results = results.filter(n => n.lat == null || n.lng == null);
        }
      }
    }
    
    const total = results.length;
    
    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 100;
    results = results.slice(offset, offset + limit);
    
    return { nodes: results, total };
  }

  async getGraphNodeById(id: string): Promise<GraphNode | undefined> {
    return this.graphNodes.find(n => n.id === id);
  }

  async createGraphNode(node: InsertGraphNode): Promise<GraphNode> {
    const now = new Date();
    const newNode: GraphNode = {
      id: randomUUID(),
      label: node.label,
      description: node.description || null,
      nodeType: node.nodeType,
      layer: node.layer,
      status: node.status || "open",
      severity: node.severity || null,
      sensitivity: node.sensitivity || "internal",
      createdAt: now,
      updatedAt: now,
      dueDate: node.dueDate ? new Date(node.dueDate as any) : null,
      lat: node.lat || null,
      lng: node.lng || null,
      locationName: node.locationName || null,
      owner: node.owner || null,
      team: node.team || null,
      linkedEntityType: node.linkedEntityType || null,
      linkedEntityId: node.linkedEntityId || null,
      metadata: node.metadata || null,
      tags: (node.tags as string[]) || [],
    };
    this.graphNodes.push(newNode);
    return newNode;
  }

  async updateGraphNode(id: string, updates: Partial<InsertGraphNode>): Promise<GraphNode | null> {
    const index = this.graphNodes.findIndex(n => n.id === id);
    if (index === -1) return null;
    
    this.graphNodes[index] = {
      ...this.graphNodes[index],
      ...updates,
      updatedAt: new Date(),
    } as GraphNode;
    
    return this.graphNodes[index];
  }

  async deleteGraphNode(id: string): Promise<boolean> {
    const index = this.graphNodes.findIndex(n => n.id === id);
    if (index === -1) return false;
    this.graphNodes.splice(index, 1);
    // Also delete related edges
    this.graphEdges = this.graphEdges.filter(e => e.sourceNodeId !== id && e.targetNodeId !== id);
    return true;
  }

  // Graph edge operations
  async getGraphEdges(nodeId?: string): Promise<GraphEdge[]> {
    if (nodeId) {
      return this.graphEdges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
    }
    return [...this.graphEdges];
  }

  async createGraphEdge(edge: InsertGraphEdge): Promise<GraphEdge> {
    const newEdge: GraphEdge = {
      id: randomUUID(),
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      edgeType: edge.edgeType,
      label: edge.label || null,
      weight: edge.weight || 1,
      metadata: edge.metadata || null,
      createdAt: new Date(),
    };
    this.graphEdges.push(newEdge);
    return newEdge;
  }

  async deleteGraphEdge(id: string): Promise<boolean> {
    const index = this.graphEdges.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.graphEdges.splice(index, 1);
    return true;
  }

  // GIA Session operations
  async getAssistantSessions(status?: string): Promise<AssistantSession[]> {
    let sessions = [...this.assistantSessions];
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }
    return sessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getAssistantSessionById(id: string): Promise<AssistantSession | undefined> {
    return this.assistantSessions.find(s => s.id === id);
  }

  async createAssistantSession(session: InsertAssistantSession): Promise<AssistantSession> {
    const now = new Date();
    const newSession: AssistantSession = {
      id: randomUUID(),
      name: session.name,
      aoiLabel: session.aoiLabel ?? null,
      aoiGeometry: session.aoiGeometry ?? null,
      timeFrom: session.timeFrom ?? null,
      timeTo: session.timeTo ?? null,
      trainingCountry: session.trainingCountry ?? null,
      isExercise: session.isExercise ?? false,
      defaultMode: session.defaultMode ?? "SITREP",
      sensitivityMax: session.sensitivityMax ?? "Internal",
      status: session.status ?? "active",
      createdAt: now,
      updatedAt: now,
    };
    this.assistantSessions.push(newSession);
    return newSession;
  }

  async updateAssistantSession(id: string, updates: Partial<InsertAssistantSession>): Promise<AssistantSession | null> {
    const index = this.assistantSessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.assistantSessions[index] = {
      ...this.assistantSessions[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.assistantSessions[index];
  }

  async deleteAssistantSession(id: string): Promise<boolean> {
    const index = this.assistantSessions.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.assistantSessions.splice(index, 1);
    // Also delete related messages and runs
    this.assistantMessages = this.assistantMessages.filter(m => m.sessionId !== id);
    this.assistantRuns = this.assistantRuns.filter(r => r.sessionId !== id);
    return true;
  }

  // GIA Message operations
  async getAssistantMessages(sessionId: string, limit: number = 50): Promise<AssistantMessage[]> {
    return this.assistantMessages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-limit);
  }

  async createAssistantMessage(message: InsertAssistantMessage): Promise<AssistantMessage> {
    const newMessage: AssistantMessage = {
      id: randomUUID(),
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      mode: message.mode ?? null,
      contextOverrides: message.contextOverrides ?? null,
      status: message.status ?? "queued",
      createdAt: new Date(),
    };
    this.assistantMessages.push(newMessage);
    return newMessage;
  }

  async updateAssistantMessage(id: string, updates: Partial<InsertAssistantMessage>): Promise<AssistantMessage | null> {
    const index = this.assistantMessages.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.assistantMessages[index] = {
      ...this.assistantMessages[index],
      ...updates,
    };
    return this.assistantMessages[index];
  }

  // GIA Run operations
  async getAssistantRuns(sessionId: string, limit: number = 10): Promise<AssistantRun[]> {
    return this.assistantRuns
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getAssistantRunById(id: string): Promise<AssistantRun | undefined> {
    return this.assistantRuns.find(r => r.id === id);
  }

  async createAssistantRun(run: InsertAssistantRun): Promise<AssistantRun> {
    const newRun: AssistantRun = {
      id: randomUUID(),
      sessionId: run.sessionId,
      messageId: run.messageId ?? null,
      mode: run.mode,
      prompt: run.prompt ?? null,
      contextSnapshot: run.contextSnapshot ?? null,
      engineState: run.engineState ?? "AI_ONLINE",
      result: run.result ?? null,
      toolsUsed: run.toolsUsed ?? [],
      policyFlags: run.policyFlags ?? [],
      status: run.status ?? "pending",
      errorMessage: run.errorMessage ?? null,
      createdAt: new Date(),
      completedAt: run.completedAt ?? null,
    };
    this.assistantRuns.push(newRun);
    return newRun;
  }

  async updateAssistantRun(id: string, updates: Partial<InsertAssistantRun>): Promise<AssistantRun | null> {
    const index = this.assistantRuns.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.assistantRuns[index] = {
      ...this.assistantRuns[index],
      ...updates,
    };
    return this.assistantRuns[index];
  }

  private async initializeSampleGraphNodes() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const sampleNodes: InsertGraphNode[] = [
      {
        label: "Intelligence Report: Dhaka Political Climate",
        description: "Assessment of current political environment and stability indicators",
        nodeType: "artifact",
        layer: "evidence",
        status: "done",
        severity: "medium",
        sensitivity: "cui",
        owner: "Intel Team Alpha",
        team: "SOCOM J2",
        tags: ["political", "dhaka", "assessment"],
      },
      {
        label: "Phase 2 Milestone: Partner Force Training",
        description: "Complete initial training program for local partner forces",
        nodeType: "milestone",
        layer: "execution",
        status: "in_progress",
        severity: "high",
        sensitivity: "internal",
        dueDate: nextWeek as any,
        owner: "CPT Rodriguez",
        team: "Training Cell",
        tags: ["training", "partner", "phase2"],
      },
      {
        label: "Risk: Supply Chain Disruption",
        description: "Port congestion may delay equipment delivery by 2-3 weeks",
        nodeType: "risk",
        layer: "risk",
        status: "open",
        severity: "high",
        sensitivity: "internal",
        lat: 22.3569,
        lng: 91.7832,
        locationName: "Chittagong Port",
        owner: "Logistics Officer",
        team: "S4",
        tags: ["logistics", "port", "delay"],
      },
      {
        label: "Dependency: Host Nation Approval",
        description: "Awaiting formal approval from host nation defense ministry",
        nodeType: "dependency",
        layer: "dependencies",
        status: "pending",
        severity: "critical",
        sensitivity: "cui",
        owner: "LNO Team",
        team: "Embassy",
        tags: ["approval", "host nation", "legal"],
      },
      {
        label: "Decision: Alternate Route Selection",
        description: "Command decision on primary vs alternate movement corridor",
        nodeType: "decision",
        layer: "execution",
        status: "closed",
        severity: "medium",
        sensitivity: "internal",
        owner: "OIC Movement",
        team: "Operations",
        tags: ["movement", "routes", "decision"],
      },
      {
        label: "Partner: Bangladesh Army 46th Brigade",
        description: "Primary partner force for joint training exercises",
        nodeType: "partner",
        layer: "people_orgs",
        status: "open",
        severity: "low",
        sensitivity: "internal",
        lat: 23.8103,
        lng: 90.4125,
        locationName: "Dhaka Cantonment",
        owner: "Partnership Officer",
        team: "J5",
        tags: ["partner", "bangladesh army", "training"],
      },
    ];

    for (const node of sampleNodes) {
      await this.createGraphNode(node);
    }

    // Create some sample edges between nodes
    if (this.graphNodes.length >= 3) {
      await this.createGraphEdge({
        sourceNodeId: this.graphNodes[1].id, // Milestone
        targetNodeId: this.graphNodes[3].id, // Dependency
        edgeType: "depends_on",
        label: "Requires approval before training",
      });
      
      await this.createGraphEdge({
        sourceNodeId: this.graphNodes[2].id, // Risk
        targetNodeId: this.graphNodes[1].id, // Milestone
        edgeType: "blocks",
        label: "May delay milestone",
      });
    }
  }
  
  // GDELT Intel operations (in-memory implementation)
  private gdeltEvents: IntelGdeltEvent[] = [];
  private gdeltDocs: IntelGdeltDoc[] = [];
  private cacheStates: IntelCacheState[] = [];
  private refreshRuns: IntelRefreshRun[] = [];
  
  async getGdeltEvents(queryHash: string, limit: number = 250): Promise<IntelGdeltEvent[]> {
    return this.gdeltEvents
      .filter(e => e.queryHash === queryHash)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, limit);
  }
  
  async upsertGdeltEvent(event: InsertIntelGdeltEvent): Promise<IntelGdeltEvent> {
    const existing = this.gdeltEvents.find(e => e.globalEventId === event.globalEventId);
    if (existing) {
      Object.assign(existing, event, { fetchedAt: new Date() });
      return existing;
    }
    const newEvent: IntelGdeltEvent = {
      id: randomUUID(),
      globalEventId: event.globalEventId,
      eventDate: event.eventDate,
      eventCode: event.eventCode ?? null,
      eventBaseCode: event.eventBaseCode ?? null,
      eventRootCode: event.eventRootCode ?? null,
      quadClass: event.quadClass ?? null,
      goldsteinScale: event.goldsteinScale ?? null,
      numMentions: event.numMentions ?? null,
      numSources: event.numSources ?? null,
      numArticles: event.numArticles ?? null,
      avgTone: event.avgTone ?? null,
      actor1Name: event.actor1Name ?? null,
      actor1CountryCode: event.actor1CountryCode ?? null,
      actor1Type1Code: event.actor1Type1Code ?? null,
      actor2Name: event.actor2Name ?? null,
      actor2CountryCode: event.actor2CountryCode ?? null,
      actor2Type1Code: event.actor2Type1Code ?? null,
      actionGeoType: event.actionGeoType ?? null,
      actionGeoFullname: event.actionGeoFullname ?? null,
      actionGeoCountryCode: event.actionGeoCountryCode ?? null,
      actionGeoLat: event.actionGeoLat ?? null,
      actionGeoLon: event.actionGeoLon ?? null,
      sourceUrl: event.sourceUrl ?? null,
      raw: event.raw,
      queryHash: event.queryHash,
      fetchedAt: new Date(),
    };
    this.gdeltEvents.push(newEvent);
    return newEvent;
  }
  
  async upsertGdeltEventsBulk(events: InsertIntelGdeltEvent[]): Promise<number> {
    let count = 0;
    for (const event of events) {
      await this.upsertGdeltEvent(event);
      count++;
    }
    return count;
  }
  
  async getGdeltDocs(queryHash: string, limit: number = 250): Promise<IntelGdeltDoc[]> {
    return this.gdeltDocs
      .filter(d => d.queryHash === queryHash)
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }
  
  async upsertGdeltDoc(doc: InsertIntelGdeltDoc): Promise<IntelGdeltDoc> {
    const existing = this.gdeltDocs.find(d => d.docId === doc.docId);
    if (existing) {
      Object.assign(existing, doc, { fetchedAt: new Date() });
      return existing;
    }
    const newDoc: IntelGdeltDoc = {
      id: randomUUID(),
      docId: doc.docId,
      url: doc.url,
      urlMobile: doc.urlMobile ?? null,
      title: doc.title ?? null,
      seenDate: doc.seenDate ?? null,
      publishedAt: doc.publishedAt ?? null,
      domain: doc.domain ?? null,
      language: doc.language ?? null,
      sourceName: doc.sourceName ?? null,
      sourceCountry: doc.sourceCountry ?? null,
      theme: doc.theme ?? null,
      tone: doc.tone ?? null,
      positiveScore: doc.positiveScore ?? null,
      negativeScore: doc.negativeScore ?? null,
      polarity: doc.polarity ?? null,
      activityDensity: doc.activityDensity ?? null,
      selfGroup: doc.selfGroup ?? null,
      socialImage: doc.socialImage ?? null,
      socialVideo: doc.socialVideo ?? null,
      lat: doc.lat ?? null,
      lon: doc.lon ?? null,
      locationName: doc.locationName ?? null,
      locationCountry: doc.locationCountry ?? null,
      raw: doc.raw,
      queryHash: doc.queryHash,
      fetchedAt: new Date(),
    };
    this.gdeltDocs.push(newDoc);
    return newDoc;
  }
  
  async upsertGdeltDocsBulk(docs: InsertIntelGdeltDoc[]): Promise<number> {
    let count = 0;
    for (const doc of docs) {
      await this.upsertGdeltDoc(doc);
      count++;
    }
    return count;
  }
  
  async getCacheState(queryHash: string): Promise<IntelCacheState | undefined> {
    return this.cacheStates.find(c => c.queryHash === queryHash);
  }
  
  async upsertCacheState(state: InsertIntelCacheState): Promise<IntelCacheState> {
    const existing = this.cacheStates.find(c => c.queryHash === state.queryHash);
    if (existing) {
      Object.assign(existing, state, { updatedAt: new Date() });
      return existing;
    }
    const newState: IntelCacheState = {
      id: randomUUID(),
      queryHash: state.queryHash,
      aoiName: state.aoiName,
      aoiLat: state.aoiLat,
      aoiLon: state.aoiLon,
      radiusKm: state.radiusKm ?? null,
      timeWindowDays: state.timeWindowDays ?? null,
      eventsCount: state.eventsCount ?? null,
      docsCount: state.docsCount ?? null,
      lastRefreshAt: state.lastRefreshAt ?? null,
      lastRefreshStatus: state.lastRefreshStatus ?? null,
      ttlMinutes: state.ttlMinutes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cacheStates.push(newState);
    return newState;
  }
  
  async createRefreshRun(run: InsertIntelRefreshRun): Promise<IntelRefreshRun> {
    const newRun: IntelRefreshRun = {
      id: randomUUID(),
      queryHash: run.queryHash,
      aoiName: run.aoiName,
      aoiLat: run.aoiLat,
      aoiLon: run.aoiLon,
      radiusKm: run.radiusKm ?? null,
      timeWindowDays: run.timeWindowDays ?? null,
      status: run.status ?? "pending",
      eventsCount: run.eventsCount ?? null,
      docsCount: run.docsCount ?? null,
      errorMessage: run.errorMessage ?? null,
      completedAt: run.completedAt ?? null,
      durationMs: run.durationMs ?? null,
      startedAt: new Date(),
    };
    this.refreshRuns.push(newRun);
    return newRun;
  }
  
  async updateRefreshRun(id: string, updates: Partial<InsertIntelRefreshRun>): Promise<IntelRefreshRun | null> {
    const run = this.refreshRuns.find(r => r.id === id);
    if (!run) return null;
    Object.assign(run, updates);
    return run;
  }
  
  async getRecentRefreshRuns(limit: number = 20): Promise<IntelRefreshRun[]> {
    return this.refreshRuns
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }
}

import { DatabaseStorage } from "./storage-db";

export const storage = new DatabaseStorage();
