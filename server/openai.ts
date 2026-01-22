// Based on javascript_openai integration blueprint
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ReasoningStep {
  step: number;
  category: string;
  observation: string;
  implication: string;
}

export interface TacticalAnalysisResult {
  summary: string;
  keyFindings: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  confidence: number;
  reasoningTrace?: ReasoningStep[];
  sources?: string[];
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

// Helper functions to extract entities from query for contextual mock responses
function extractLocation(query: string): string | null {
  const locations = [
    { pattern: /dhaka|ধাকা/, name: "Dhaka, Bangladesh" },
    { pattern: /bangladesh|বাংলাদেশ/, name: "Bangladesh" },
    { pattern: /chittagong|chattogram/, name: "Chittagong, Bangladesh" },
    { pattern: /sylhet/, name: "Sylhet, Bangladesh" },
    { pattern: /khulna/, name: "Khulna, Bangladesh" },
    { pattern: /rajshahi/, name: "Rajshahi, Bangladesh" },
    { pattern: /cox'?s?\s*bazar/, name: "Cox's Bazar, Bangladesh" },
    { pattern: /motijheel/, name: "Motijheel, Dhaka" },
    { pattern: /gulshan/, name: "Gulshan, Dhaka" },
    { pattern: /uttara/, name: "Uttara, Dhaka" },
    { pattern: /mirpur/, name: "Mirpur, Dhaka" },
    { pattern: /dhanmondi/, name: "Dhanmondi, Dhaka" },
  ]
  for (const loc of locations) {
    if (loc.pattern.test(query)) return loc.name
  }
  return null
}

function extractTopic(query: string): string | null {
  const topics = [
    { pattern: /protest|demonstration|rally|march/, name: "civil unrest and protests" },
    { pattern: /election|political|government|opposition/, name: "political situation" },
    { pattern: /infrastructure|power|electricity|water/, name: "infrastructure status" },
    { pattern: /security|threat|attack|violence/, name: "security situation" },
    { pattern: /economic|trade|commerce|business/, name: "economic conditions" },
    { pattern: /transport|road|traffic|movement/, name: "transportation and mobility" },
    { pattern: /medical|hospital|health|covid/, name: "medical and health situation" },
    { pattern: /military|army|forces|defense/, name: "military posture" },
    { pattern: /communication|media|internet|network/, name: "communications infrastructure" },
    { pattern: /refugee|migration|displacement/, name: "population displacement" },
    { pattern: /flood|cyclone|disaster|weather/, name: "natural disaster impact" },
  ]
  for (const topic of topics) {
    if (topic.pattern.test(query)) return topic.name
  }
  return null
}

function extractTimeframe(query: string): string | null {
  const timeframes = [
    { pattern: /today|current|now|immediate/, name: "current conditions" },
    { pattern: /yesterday|last\s*24/, name: "past 24 hours" },
    { pattern: /this\s*week|past\s*7|last\s*week/, name: "past 7 days" },
    { pattern: /this\s*month|past\s*30|recent/, name: "past 30 days" },
    { pattern: /next\s*week|upcoming|forecast/, name: "next 7 days forecast" },
  ]
  for (const tf of timeframes) {
    if (tf.pattern.test(query)) return tf.name
  }
  return null
}

function extractActionType(query: string): string | null {
  const actions = [
    { pattern: /brief|sitrep|report/, name: "situation report" },
    { pattern: /assess|evaluate|analyze/, name: "assessment" },
    { pattern: /recommend|advise|suggest/, name: "recommendations" },
    { pattern: /plan|prepare|coordinate/, name: "operational planning" },
  ]
  for (const action of actions) {
    if (action.pattern.test(query)) return action.name
  }
  return null
}

// Mock tactical query results for development when OpenAI is unavailable
function getMockTacticalResult(query: string, context?: string[]): TacticalAnalysisResult {
  const queryLower = query.toLowerCase()
  
  // Extract key entities from query for contextual responses
  const extractedEntities = {
    location: extractLocation(queryLower),
    topic: extractTopic(queryLower),
    timeframe: extractTimeframe(queryLower),
    actionType: extractActionType(queryLower)
  }
  
  // Analyze query content to provide appropriate mock response
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  let mockType = 'general'
  
  if (queryLower.includes('critical') || queryLower.includes('immediate') || queryLower.includes('urgent') || 
      queryLower.includes('emergency') || queryLower.includes('action') || queryLower.includes('requiring action') ||
      queryLower.includes('analyze immediate') || queryLower.includes('active threat')) {
    riskLevel = 'CRITICAL'
    mockType = 'critical'
  } else if (queryLower.includes('threat') || queryLower.includes('attack') || queryLower.includes('hostile') || queryLower.includes('risk')) {
    riskLevel = 'HIGH'
    mockType = 'threat'
  } else if (queryLower.includes('pmesii') || queryLower.includes('political') || queryLower.includes('economic') || queryLower.includes('social')) {
    riskLevel = 'MEDIUM'
    mockType = 'pmesii'
  } else if (queryLower.includes('urban') || queryLower.includes('operation') || queryLower.includes('tactical') || queryLower.includes('sitrep')) {
    riskLevel = 'MEDIUM' 
    mockType = 'operational'
  } else if (queryLower.includes('assessment') || queryLower.includes('analysis') || queryLower.includes('intelligence') || queryLower.includes('brief')) {
    riskLevel = 'MEDIUM'
    mockType = 'intelligence'
  }
  
  // Build query-aware response
  const locationContext = extractedEntities.location || "the area of interest"
  const topicContext = extractedEntities.topic || "current situation"
  const timeContext = extractedEntities.timeframe || "recent period"
  
  const mockResponses = {
    critical: {
      summary: `CRITICAL THREAT ASSESSMENT for ${locationContext}: Analysis of ${topicContext} during ${timeContext} indicates immediate tactical response required. Multiple high-priority threat indicators detected in the operational area requiring coordinated emergency action protocols.`,
      keyFindings: [
        `IMMEDIATE THREAT: Active hostile indicators identified in ${locationContext}`,
        `CRITICAL TIMELINE: Window for preventive action regarding ${topicContext} rapidly closing`,
        `HIGH-PRIORITY ASSETS: Critical infrastructure in ${locationContext} at immediate risk`,
        "COORDINATION REQUIRED: Multi-domain response protocols must be activated NOW"
      ],
      recommendations: [
        `IMMEDIATE ACTION: Initiate emergency response protocols for ${locationContext}`,
        `CRITICAL PRIORITY: Deploy rapid response teams to address ${topicContext}`,
        "URGENT COORDINATION: Contact all relevant security elements immediately",
        "EMERGENCY MEASURES: Prepare evacuation and containment procedures"
      ]
    },
    threat: {
      summary: `Threat assessment for ${locationContext} indicates elevated risk profile regarding ${topicContext}. Analysis of ${timeContext} shows multiple convergent factors requiring tactical awareness and coordinated response protocols.`,
      keyFindings: [
        `Elevated threat indicators detected in ${locationContext}`,
        `Pattern analysis of ${topicContext} suggests coordinated hostile activities`, 
        "Intelligence fusion indicates 72-hour operational window",
        `Resource signatures in ${locationContext} consistent with advanced planning phases`
      ],
      recommendations: [
        `Implement enhanced monitoring protocols for ${topicContext} in ${locationContext}`,
        "Coordinate with regional security elements",
        "Deploy additional reconnaissance assets",
        "Prepare rapid response contingency procedures"
      ]
    },
    pmesii: {
      summary: `PMESII-PT Analysis for ${locationContext}: Comprehensive assessment of ${topicContext} during ${timeContext}. This analysis evaluates Political, Military, Economic, Social, Information, and Infrastructure factors affecting the operational environment.`,
      keyFindings: [
        `POLITICAL: ${locationContext} experiencing heightened political tensions with ongoing civil discourse`,
        `MILITARY: Security forces maintaining elevated posture in response to ${topicContext}`,
        `ECONOMIC: Regional trade and commerce showing moderate disruption patterns`,
        `SOCIAL: Population sentiment reflecting concern over ${topicContext}`,
        `INFRASTRUCTURE: Critical systems in ${locationContext} operating at reduced capacity`
      ],
      recommendations: [
        `Monitor political developments in ${locationContext} closely`,
        `Coordinate with local security elements regarding ${topicContext}`,
        "Establish redundant communication channels",
        "Prepare contingency plans for infrastructure degradation"
      ]
    },
    operational: {
      summary: `Operational SITREP for ${locationContext}: Assessment of ${topicContext} reveals complex multi-domain environment requiring coordinated tactical approach. Current conditions during ${timeContext} require emphasis on urban terrain considerations.`,
      keyFindings: [
        `Urban terrain analysis of ${locationContext} indicates mixed threat/opportunity zones`,
        `${topicContext} creating both tactical challenges and advantages`,
        `Infrastructure mapping of ${locationContext} reveals critical vulnerability points`, 
        "Communication networks show moderate resilience patterns"
      ],
      recommendations: [
        `Conduct detailed terrain analysis of ${locationContext}`,
        "Establish secure communication protocols",
        `Coordinate with local forces regarding ${topicContext}`,
        "Implement graduated response procedures"
      ]
    },
    intelligence: {
      summary: `Intelligence Analysis for ${locationContext}: Assessment of ${topicContext} during ${timeContext} completed. Current operational picture shows moderate complexity with mixed indicators requiring continued monitoring.`,
      keyFindings: [
        `Multi-source intelligence on ${topicContext} in ${locationContext} successfully correlated`,
        "Confidence levels vary across intelligence domains (HUMINT: HIGH, SIGINT: MODERATE)",
        `Pattern recognition for ${locationContext} indicates dynamic baseline conditions`,
        "Continued collection recommended to refine assessment accuracy"
      ],
      recommendations: [
        `Continue intelligence collection on ${topicContext} in ${locationContext}`,
        "Monitor for pattern changes in baseline indicators", 
        "Maintain coordination with regional intelligence fusion centers",
        "Update assessment as new information becomes available"
      ]
    },
    general: {
      summary: `Tactical Intelligence Assessment: Analysis of your query regarding "${query.substring(0, 80)}${query.length > 80 ? '...' : ''}" has been processed. ${locationContext !== "the area of interest" ? `Focus area: ${locationContext}.` : ""} ${topicContext !== "current situation" ? `Topic: ${topicContext}.` : ""} Assessment indicates manageable risk factors with clear recommended actions.`,
      keyFindings: [
        `Query analyzed within tactical intelligence framework for ${locationContext}`,
        `${topicContext} assessment completed with standard operational parameters`,
        "Risk factors assessed and categorized appropriately",
        "Actionable intelligence recommendations prepared"
      ],
      recommendations: [
        `Monitor ${topicContext} in ${locationContext} for developments`,
        "Implement standard tactical procedures",
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
  
  // Generate mock reasoning traces based on query type - now contextual
  const reasoningTraces: { critical: ReasoningStep[], threat: ReasoningStep[], pmesii: ReasoningStep[], operational: ReasoningStep[], intelligence: ReasoningStep[], general: ReasoningStep[] } = {
    critical: [
      { step: 1, category: "Military", observation: `Active hostile indicators detected in ${locationContext}`, implication: "Immediate tactical response required to neutralize threat" },
      { step: 2, category: "Infrastructure", observation: `Critical assets in ${locationContext} within threat envelope`, implication: "Asset protection protocols must be activated" },
      { step: 3, category: "Time", observation: "72-hour window identified for preventive action", implication: "Delays reduce effectiveness of response options" },
      { step: 4, category: "Information", observation: `Intelligence on ${topicContext} confidence HIGH across multiple sources`, implication: "Assessment reliability supports immediate action" }
    ],
    threat: [
      { step: 1, category: "Military", observation: `Pattern analysis of ${topicContext} in ${locationContext} indicates coordinated activity`, implication: "Threat actors operating with unified command structure" },
      { step: 2, category: "Political", observation: `Regional tensions in ${locationContext} creating permissive environment`, implication: "External intervention may be delayed or limited" },
      { step: 3, category: "Social", observation: `Local population in ${locationContext} sentiment shifting`, implication: "Civil-military cooperation dynamics changing" }
    ],
    pmesii: [
      { step: 1, category: "Political", observation: `Government stability in ${locationContext} shows stress indicators`, implication: "Political situation requires close monitoring" },
      { step: 2, category: "Military", observation: `Security forces in ${locationContext} maintaining elevated posture`, implication: "Military readiness affecting civilian movement patterns" },
      { step: 3, category: "Economic", observation: `Trade activity in ${locationContext} showing disruption patterns`, implication: "Economic stress may exacerbate social tensions" },
      { step: 4, category: "Social", observation: `Population in ${locationContext} expressing concerns about ${topicContext}`, implication: "Social cohesion under pressure" },
      { step: 5, category: "Infrastructure", observation: `Critical infrastructure in ${locationContext} operating at reduced capacity`, implication: "Infrastructure resilience should be factored into planning" }
    ],
    operational: [
      { step: 1, category: "Infrastructure", observation: `Urban terrain complexity in ${locationContext} rated HIGH`, implication: "Standard maneuver doctrine requires adaptation" },
      { step: 2, category: "Social", observation: `Mixed population density zones identified in ${locationContext}`, implication: "ROE considerations require careful calibration" },
      { step: 3, category: "Economic", observation: `Critical supply routes in ${locationContext} remain accessible`, implication: "Logistics sustainability for extended operations confirmed" }
    ],
    intelligence: [
      { step: 1, category: "Information", observation: `Multi-source intelligence on ${topicContext} successfully correlated`, implication: "Assessment confidence meets operational threshold" },
      { step: 2, category: "Political", observation: `Baseline conditions in ${locationContext} within normal parameters`, implication: "No immediate escalation indicators present" },
      { step: 3, category: "Military", observation: `Force disposition in ${locationContext} consistent with historical patterns`, implication: "No significant threat posture changes detected" }
    ],
    general: [
      { step: 1, category: "Information", observation: `Query about ${topicContext} processed through tactical intelligence framework`, implication: "Standard analytical protocols applied successfully" },
      { step: 2, category: "Infrastructure", observation: `Operational parameters in ${locationContext} within expected ranges`, implication: "No immediate infrastructure concerns identified" },
      { step: 3, category: "Political", observation: `Regional stability indicators for ${locationContext} normal`, implication: "Permissive environment for planned operations" }
    ]
  }
  
  const mockSources = [
    "SIGINT Analysis (B)", "HUMINT Reports (C)", "OSINT Aggregation (A)", 
    "IMINT Assessment (B)", "Social Media OSINT (C)", "Regional Analyst Network (B)"
  ]
  
  return {
    summary: contextualSummary,
    keyFindings: baseResponse.keyFindings,
    riskLevel,
    recommendations: baseResponse.recommendations,
    confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75-0.95
    reasoningTrace: reasoningTraces[mockType as keyof typeof reasoningTraces] || reasoningTraces.general,
    sources: mockSources.slice(0, 3 + Math.floor(Math.random() * 3))
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
Analyze the following tactical query and provide a structured intelligence assessment with explicit reasoning traces.

Query: ${query}${contextInfo}

Provide your analysis in JSON format with the following structure:
{
  "summary": "Brief overview of the situation",
  "keyFindings": ["Key intelligence finding 1", "Key finding 2", "..."],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendations": ["Tactical recommendation 1", "Recommendation 2", "..."],
  "confidence": 0.85,
  "reasoningTrace": [
    {
      "step": 1,
      "category": "PMESII-PT factor or analytical category (e.g., Political, Military, Economic, Social, Information, Infrastructure, Physical Environment, Time)",
      "observation": "What specific data or pattern was observed",
      "implication": "What this means for the assessment"
    }
  ],
  "sources": ["Intelligence source 1 (reliability rating)", "Source 2 (rating)"]
}

IMPORTANT: The reasoningTrace must explicitly show your chain-of-thought analysis:
- Include 3-5 reasoning steps showing how you arrived at your conclusions
- Each step should reference a specific PMESII-PT factor or analytical framework
- Link observations to their tactical implications
- This enables analysts to understand and validate your assessment

Focus on actionable intelligence, threat assessment, and tactical implications.`;

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
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
      reasoningTrace: result.reasoningTrace || [],
      sources: result.sources || []
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