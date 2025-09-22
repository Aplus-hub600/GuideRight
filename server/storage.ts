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
    
    // Initialize with external intelligence sources
    this.initializeExternalIntelligence();
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
              source: result.source,
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
              source: result.source,
              sourceMetadata: result.sourceMetadata 
            }
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
}

export const storage = new MemStorage();
