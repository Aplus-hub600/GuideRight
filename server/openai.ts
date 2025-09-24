// Based on javascript_openai integration blueprint
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TacticalAnalysisResult {
  summary: string;
  keyFindings: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  confidence: number;
}

export interface PMESIIAnalysis {
  political: {
    summary: string;
    keyPoints: string[];
    stabilityScore: number;
  };
  military: {
    summary: string;
    threats: string[];
    capabilities: string[];
    readinessScore: number;
  };
  economic: {
    summary: string;
    indicators: string[];
    stabilityScore: number;
  };
  social: {
    summary: string;
    demographics: string[];
    tensions: string[];
    stabilityScore: number;
  };
  information: {
    summary: string;
    mediaControl: string;
    propaganda: string[];
    reliabilityScore: number;
  };
  infrastructure: {
    summary: string;
    criticalAssets: string[];
    vulnerabilities: string[];
    integrityScore: number;
  };
}

// Mock tactical query results for development when OpenAI is unavailable
function getMockTacticalResult(query: string, context?: string[]): TacticalAnalysisResult {
  const queryLower = query.toLowerCase()
  
  // Analyze query content to provide appropriate mock response
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  let mockType = 'general'
  
  if (queryLower.includes('critical') || queryLower.includes('immediate') || queryLower.includes('urgent') || 
      queryLower.includes('emergency') || queryLower.includes('action') || queryLower.includes('requiring action') ||
      queryLower.includes('analyze immediate') || queryLower.includes('active threat')) {
    riskLevel = 'CRITICAL'
    mockType = 'critical'
  } else if (queryLower.includes('threat') || queryLower.includes('attack') || queryLower.includes('hostile')) {
    riskLevel = 'HIGH'
    mockType = 'threat'
  } else if (queryLower.includes('urban') || queryLower.includes('operation') || queryLower.includes('tactical')) {
    riskLevel = 'MEDIUM' 
    mockType = 'operational'
  } else if (queryLower.includes('assessment') || queryLower.includes('analysis') || queryLower.includes('intelligence')) {
    riskLevel = 'MEDIUM'
    mockType = 'intelligence'
  }
  
  const mockResponses = {
    critical: {
      summary: "CRITICAL THREAT ASSESSMENT: Immediate tactical response required. Multiple high-priority threat indicators detected requiring coordinated emergency action protocols.",
      keyFindings: [
        "IMMEDIATE THREAT: Active hostile elements identified in operational area",
        "CRITICAL TIMELINE: Window for preventive action rapidly closing",
        "HIGH-PRIORITY ASSETS: Critical infrastructure and personnel at immediate risk",
        "COORDINATION REQUIRED: Multi-domain response protocols must be activated NOW"
      ],
      recommendations: [
        "IMMEDIATE ACTION: Initiate emergency response protocols",
        "CRITICAL PRIORITY: Deploy rapid response teams to threat zones",
        "URGENT COORDINATION: Contact all relevant security elements immediately",
        "EMERGENCY MEASURES: Prepare evacuation and containment procedures"
      ]
    },
    threat: {
      summary: "Threat assessment indicates elevated risk profile with multiple convergent factors requiring tactical awareness and coordinated response protocols.",
      keyFindings: [
        "Elevated threat indicators detected across operational zones",
        "Pattern analysis suggests coordinated hostile activities", 
        "Intelligence fusion indicates 72-hour operational window",
        "Resource signatures consistent with advanced planning phases"
      ],
      recommendations: [
        "Implement enhanced threat monitoring protocols",
        "Coordinate with regional security elements",
        "Deploy additional reconnaissance assets",
        "Prepare rapid response contingency procedures"
      ]
    },
    operational: {
      summary: "Operational assessment reveals complex multi-domain environment requiring coordinated tactical approach with emphasis on urban terrain considerations.",
      keyFindings: [
        "Urban terrain analysis indicates mixed threat/opportunity zones",
        "Population density creates both challenges and advantages",
        "Infrastructure mapping reveals critical vulnerability points", 
        "Communication networks show moderate resilience patterns"
      ],
      recommendations: [
        "Conduct detailed urban terrain analysis",
        "Establish secure communication protocols",
        "Coordinate with local security forces",
        "Implement graduated response procedures"
      ]
    },
    intelligence: {
      summary: "Intelligence analysis completed successfully. Current operational picture shows moderate complexity with mixed indicators requiring continued monitoring.",
      keyFindings: [
        "Multi-source intelligence correlation completed",
        "Confidence levels vary across intelligence domains",
        "Pattern recognition indicates stable baseline conditions",
        "No immediate critical threats identified in current assessment"
      ],
      recommendations: [
        "Continue routine intelligence collection protocols",
        "Monitor for pattern changes in baseline indicators", 
        "Maintain coordination with intelligence fusion centers",
        "Update assessment based on emerging information"
      ]
    },
    general: {
      summary: "Tactical query processed successfully. Analysis indicates standard operational parameters with manageable risk factors and clear recommended actions.",
      keyFindings: [
        "Query processed within tactical intelligence framework",
        "Standard operational parameters identified",
        "Risk factors assessed and categorized appropriately",
        "Actionable intelligence recommendations prepared"
      ],
      recommendations: [
        "Implement standard tactical procedures",
        "Monitor situation for developments",
        "Coordinate with relevant operational elements",
        "Maintain situational awareness protocols"
      ]
    }
  }
  
  const baseResponse = mockResponses[mockType as keyof typeof mockResponses] || mockResponses.general
  
  // Include context information if provided
  let contextualSummary = baseResponse.summary
  if (context && context.length > 0) {
    contextualSummary += " Analysis incorporates relevant contextual intelligence from previous assessments and operations."
  }
  
  return {
    summary: contextualSummary,
    keyFindings: baseResponse.keyFindings,
    riskLevel,
    recommendations: baseResponse.recommendations,
    confidence: 0.75 + Math.random() * 0.2 // Random confidence between 0.75-0.95
  }
}

export async function processTacticalQuery(
  query: string,
  context?: string[]
): Promise<TacticalAnalysisResult> {
  const contextInfo = context && context.length > 0 
    ? `\n\nRelevant context:\n${context.join('\n')}`
    : '';

  const prompt = `You are GuideRight, an advanced tactical intelligence assistant for USSOCOM operations. 
Analyze the following tactical query and provide a structured intelligence assessment.

Query: ${query}${contextInfo}

Provide your analysis in JSON format with the following structure:
{
  "summary": "Brief overview of the situation",
  "keyFindings": ["Key intelligence finding 1", "Key finding 2", "..."],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendations": ["Tactical recommendation 1", "Recommendation 2", "..."],
  "confidence": 0.85
}

Focus on actionable intelligence, threat assessment, and tactical implications. Consider PMESII factors where relevant.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      summary: result.summary || "Analysis completed",
      keyFindings: result.keyFindings || [],
      riskLevel: result.riskLevel || 'MEDIUM',
      recommendations: result.recommendations || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7))
    };
  } catch (error) {
    console.error("OpenAI tactical analysis error:", error);
    
    // In development environment, provide mock results when OpenAI is unavailable
    if (process.env.NODE_ENV === 'development' && 
        (error.message?.includes('quota') || error.message?.includes('429') || error.code === 'insufficient_quota')) {
      console.log('OpenAI quota exceeded, using mock tactical analysis results for development');
      return getMockTacticalResult(query, context);
    }
    
    throw new Error("Failed to process tactical query: " + error.message);
  }
}

export async function generatePMESIIAnalysis(
  region: string,
  additionalContext?: string,
  aoi?: { lat: number; lng: number; radiusKm?: number }
): Promise<PMESIIAnalysis> {
  // Gather social media intelligence for the region
  let socialMediaContext = '';
  
  try {
    const { storage } = await import('./storage');
    
    if (aoi?.lat && aoi?.lng) {
      const socialPosts = await storage.getSocialMediaPostsByLocation(
        aoi.lat, 
        aoi.lng, 
        aoi.radiusKm || 50
      );
      
      if (socialPosts.length > 0) {
        const sentimentCounts = socialPosts.reduce((acc, post) => {
          const sentiment = post.sentiment?.toLowerCase() || 'neutral';
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const messages = socialPosts.map(p => p.message).join(' ');
        const hashtags = messages.match(/#\w+/g) || [];
        const topHashtags = [...new Set(hashtags)].slice(0, 5);
        
        const influencers = socialPosts.filter(p => (p.senderFollowersCount || 0) > 1000);
        
        socialMediaContext = `

SOCIAL MEDIA INTELLIGENCE:
- Total posts analyzed: ${socialPosts.length}
- Sentiment breakdown: ${Object.entries(sentimentCounts).map(([k,v]) => `${k}: ${v}`).join(', ')}
- Key topics/hashtags: ${topHashtags.join(', ')}
- Influencer posts: ${influencers.length}
- Geographic coverage: Posts from ${socialPosts.filter(p => p.location).length} geotagged locations
- Sample messages: ${socialPosts.slice(0, 3).map(p => `"${p.message.substring(0, 100)}..."`).join('; ')}`;
      }
    }
  } catch (error) {
    console.warn("Could not fetch social media data for PMESII analysis:", error);
  }

  const prompt = `You are GuideRight, analyzing the PMESII factors for ${region}.
${additionalContext ? `Additional context: ${additionalContext}` : ''}${socialMediaContext}

Provide a comprehensive PMESII (Political, Military, Economic, Social, Information, Infrastructure) analysis in JSON format:

{
  "political": {
    "summary": "Political situation overview",
    "keyPoints": ["Key political factor 1", "Factor 2"],
    "stabilityScore": 0.6
  },
  "military": {
    "summary": "Military situation overview", 
    "threats": ["Threat 1", "Threat 2"],
    "capabilities": ["Capability 1", "Capability 2"],
    "readinessScore": 0.7
  },
  "economic": {
    "summary": "Economic situation overview",
    "indicators": ["GDP impact", "Employment rate"],
    "stabilityScore": 0.5
  },
  "social": {
    "summary": "Social dynamics overview",
    "demographics": ["Population info", "Key groups"],
    "tensions": ["Social tension 1", "Tension 2"],
    "stabilityScore": 0.6
  },
  "information": {
    "summary": "Information environment overview",
    "mediaControl": "Government/Independent/Mixed",
    "propaganda": ["Propaganda theme 1", "Theme 2"],
    "reliabilityScore": 0.4
  },
  "infrastructure": {
    "summary": "Infrastructure status overview",
    "criticalAssets": ["Asset 1", "Asset 2"],
    "vulnerabilities": ["Vulnerability 1", "Vulnerability 2"],
    "integrityScore": 0.8
  }
}

All scores should be between 0 and 1. Focus on current intelligence and operational relevance.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI PMESII analysis error:", error);
    throw new Error("Failed to generate PMESII analysis: " + error.message);
  }
}

// Mock analysis results for development when OpenAI is unavailable
function getMockAnalysisResult(content: string, base64Image?: string, analysisType: string = 'general'): TacticalAnalysisResult {
  const mockResults = {
    intelligence: {
      summary: "Intelligence analysis completed successfully. Document contains strategic operational information with moderate threat indicators.",
      keyFindings: [
        "Location coordinates identified: Strategic operational zone",
        "Communication patterns suggest coordinated activity", 
        "Resource allocation indicates medium-scale operations",
        "Timeline analysis reveals 72-hour operational window"
      ],
      riskLevel: "MEDIUM" as const,
      recommendations: [
        "Increase surveillance in identified operational zones",
        "Coordinate with regional intelligence units",
        "Monitor communication channels for 72-hour period",
        "Deploy additional reconnaissance assets"
      ],
      confidence: 0.83
    },
    pmesii: {
      summary: "PMESII analysis reveals complex multi-domain operational environment with interconnected political, military, and social factors.",
      keyFindings: [
        "Political stability indicators show moderate volatility",
        "Military readiness assessed at 75% operational capacity",
        "Economic infrastructure shows resilience patterns",
        "Social cohesion metrics indicate stable population",
        "Information warfare signatures detected",
        "Infrastructure vulnerabilities in power and communications"
      ],
      riskLevel: "HIGH" as const,
      recommendations: [
        "Monitor political developments closely",
        "Assess military capability changes",
        "Evaluate economic stability factors",
        "Track social sentiment indicators"
      ],
      confidence: 0.78
    },
    threat: {
      summary: "Threat assessment indicates elevated risk profile with multiple convergent factors requiring immediate attention.",
      keyFindings: [
        "Elevated threat indicators across multiple domains",
        "Pattern recognition suggests coordinated threat activity",
        "Timeline analysis indicates imminent operational window",
        "Resource signatures consistent with hostile preparations"
      ],
      riskLevel: "CRITICAL" as const,
      recommendations: [
        "Immediate threat mitigation protocols required",
        "Coordinate with security response teams",
        "Implement enhanced surveillance measures",
        "Prepare contingency response procedures"
      ],
      confidence: 0.91
    },
    general: {
      summary: "General intelligence analysis completed. Content processed successfully with tactical intelligence extraction.",
      keyFindings: [
        "Document classification: Operational intelligence",
        "Content relevance: High tactical value",
        "Information quality: Reliable sources identified",
        "Analysis completeness: Comprehensive assessment"
      ],
      riskLevel: "LOW" as const,
      recommendations: [
        "Archive analysis results for future reference",
        "Cross-reference with existing intelligence",
        "Monitor for related intelligence updates",
        "Update operational awareness briefings"
      ],
      confidence: 0.75
    }
  }
  
  const baseResult = mockResults[analysisType as keyof typeof mockResults] || mockResults.general
  
  // Add image-specific analysis if image is provided
  if (base64Image) {
    return {
      ...baseResult,
      summary: baseResult.summary + " Visual intelligence analysis indicates photographic evidence supports textual findings.",
      keyFindings: [
        ...baseResult.keyFindings,
        "Visual analysis: Geospatial context confirmed",
        "Image metadata: Temporal and spatial markers validated"
      ]
    }
  }
  
  return baseResult
}

export async function analyzeMultimodalContent(
  content: string,
  base64Image?: string,
  analysisType: 'pmesii' | 'intelligence' | 'threat' | 'general' = 'general'
): Promise<TacticalAnalysisResult> {
  const messages: any[] = [
    {
      role: "system",
      content: `You are GuideRight, a tactical intelligence analyst. Analyze the provided content for ${analysisType} intelligence purposes.`
    }
  ];

  const userMessage: any = {
    role: "user",
    content: []
  };

  if (content) {
    userMessage.content.push({
      type: "text",
      text: `Analyze this ${analysisType} content and provide tactical intelligence assessment:\n\n${content}\n\nProvide analysis in JSON format with summary, keyFindings, riskLevel (LOW/MEDIUM/HIGH/CRITICAL), recommendations, and confidence (0-1).`
    });
  }

  if (base64Image) {
    userMessage.content.push({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${base64Image}`
      }
    });
  }

  messages.push(userMessage);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages,
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      summary: result.summary || "Analysis completed",
      keyFindings: result.keyFindings || [],
      riskLevel: result.riskLevel || 'MEDIUM',
      recommendations: result.recommendations || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7))
    };
  } catch (error) {
    console.error("OpenAI multimodal analysis error:", error);
    
    // In development environment, provide mock results when OpenAI is unavailable
    if (process.env.NODE_ENV === 'development' && 
        (error.message?.includes('quota') || error.message?.includes('429') || error.code === 'insufficient_quota')) {
      console.log('OpenAI quota exceeded, using mock analysis results for development');
      return getMockAnalysisResult(content, base64Image, analysisType);
    }
    
    throw new Error("Failed to analyze multimodal content: " + error.message);
  }
}

export async function calculateRiskScore(
  aoi: { name: string; lat: number; lng: number; radiusKm: number },
  contextFactors?: string[]
): Promise<{ score: number; factors: string[]; assessment: string }> {
  const prompt = `You are GuideRight, analyzing risk factors for Area of Interest: ${aoi.name} (${aoi.lat}, ${aoi.lng}) with ${aoi.radiusKm}km radius.

${contextFactors ? `Consider these factors: ${contextFactors.join(', ')}` : ''}

Analyze and provide a risk assessment in JSON format:
{
  "score": 0.67,
  "factors": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
  "assessment": "Detailed risk assessment explanation"
}

Score should be 0-1 (0=no risk, 1=extreme risk). Consider:
- Security threats and insurgent activity
- Political stability and governance
- Infrastructure vulnerabilities  
- Social tensions and conflicts
- Economic factors affecting stability
- Geographic and environmental risks`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: Math.max(0, Math.min(1, result.score || 0.5)),
      factors: result.factors || [],
      assessment: result.assessment || "Risk assessment completed"
    };
  } catch (error) {
    console.error("OpenAI risk scoring error:", error);
    throw new Error("Failed to calculate risk score: " + error.message);
  }
}