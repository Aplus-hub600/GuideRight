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
  type InsertGeotaggedFile
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
