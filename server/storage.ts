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
  type SearchQuery,
  type SearchResult
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatMessages: ChatMessage[];
  private analysisResults: AnalysisResult[];
  private riskAssessments: RiskAssessment[];
  private waypoints: Waypoint[];
  private geotaggedFiles: GeotaggedFile[];

  constructor() {
    this.users = new Map();
    this.chatMessages = [];
    this.analysisResults = [];
    this.riskAssessments = [];
    this.waypoints = [];
    this.geotaggedFiles = [];
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
      aoiData: insertResult.aoiData || null
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
          JSON.stringify(result.results),
          JSON.stringify(result.aoiData || {})
        ]);
        
        if (score > 0) {
          results.push({
            id: result.id,
            type: 'pmesii',
            title: `PMESII Analysis - ${result.region || 'Unknown Region'}`,
            snippet: this.createSnippet(searchTerm, [result.region || '', JSON.stringify(result.results)]),
            tags: ['pmesii', 'analysis'],
            timestamp: result.timestamp.toISOString(),
            score,
            context: { region: result.region, analysisType: result.analysisType }
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
          JSON.stringify(result.results)
        ]);
        
        if (score > 0) {
          results.push({
            id: result.id,
            type: 'intelligence',
            title: `${result.analysisType} Analysis - ${result.region || 'Unknown Region'}`,
            snippet: this.createSnippet(searchTerm, [result.analysisType, JSON.stringify(result.results)]),
            tags: [result.analysisType, 'analysis'],
            timestamp: result.timestamp.toISOString(),
            score,
            context: { region: result.region, analysisType: result.analysisType }
          });
        }
      }
    }
    
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
}

export const storage = new MemStorage();
