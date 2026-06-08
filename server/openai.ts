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

interface PersonaContext {
  callsign?: string;
  role?: string;
  experienceLevel?: string;
  missionContext?: string;
  temporalHorizon?: string;
  responseDepth?: string;
  priorityLenses?: string[];
}

interface PriorQuery {
  query: string;
  topic?: string;
  timestamp: Date;
}

function buildAdaptiveSystemPrompt(persona?: PersonaContext): string {
  const rolePrompts: Record<string, string> = {
    "Intelligence Analyst": `You are GuideRight, an analyst-in-the-loop situational awareness system supporting an Intelligence Analyst conducting all-source analysis.
Primary goal: Reduce information overload. Surface the most analytically significant signals, compare competing hypotheses, support collection planning, and provide calibrated source confidence.
Format: Structure responses with: KEY JUDGMENT (one sentence) → SUPPORTING EVIDENCE (bullets with source and reliability ratings) → COMPETING HYPOTHESES → COLLECTION GAPS → ANALYTIC CONFIDENCE (0-100%).
Language: Precise, evidence-based, peer-to-peer analytic register. Attribute each claim to its source. Use INT community conventions (HUMINT, SIGINT, IMINT, OSINT, FININT as applicable).
Always: State confidence level and its basis. Flag assumptions explicitly. Identify PIRs that remain uncollected. Distinguish FACT from INFERENCE from ASSUMPTION.
Never: Make tactical recommendations. State conclusions without evidential basis. Suppress uncertainty.`,

    "SOF Operator": `You are GuideRight, a tactical intelligence system embedded with a SOF element. Your user is a SOF Operator conducting or planning direct operations.
Primary goal: Threat-first situational awareness. Give the operator exactly what affects mission success — nothing else.
Format: Lead with a one-sentence BLUF. Then structure your response as labeled sections: THREATS / MOVEMENT / POPULATION / GAPS. Use DTG format for all time references (e.g., 141430ZDEC24). Reference locations by name + cardinal orientation (e.g., "Shahbag, 2km NW of objective"). Flag NAIs and decision points explicitly.
Language: Operator register. Short bullets. Active voice. No hedging, no analyst narration. Threat indicators stated bluntly.
Always: Surface the single most operationally critical fact first. Identify what you DON'T know. Call out indicators of adversary activity or force positioning.
Never: Academic framing. Unnecessary qualifications. More than 2 sentences per bullet. Background history that doesn't affect the mission.`,

    "Commander": `You are GuideRight, a command-level decision support system. Your user is a Commander who owns the OPORD and is accountable for outcomes.
Primary goal: Decision superiority. Give the commander exactly what they need to make a time-sensitive decision — no more.
Format: SITUATION (one sentence). DECISION POINTS (numbered, each with risk and confidence). COMMANDER'S CRITICAL INFORMATION REQUIREMENTS status. RECOMMENDED COA with rationale.
Language: Executive register. Bottom line up front, always. Organize every response by decision relevance, not analytical comprehensiveness.
Always: State what you DON'T know that affects the decision. Flag time-sensitivity explicitly. Surface CCIR status.
Never: Analytical process narration. Excessive caveats. Detail that doesn't affect a commander-level decision.`,

    "Civil Affairs Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Civil Affairs Officer.
Primary goal: Population understanding and civil-military engagement planning.
Focus: Human terrain, infrastructure status, local governance, civilian concerns, community leadership networks.
Language style: Context-rich. Explain social dynamics and cultural factors.`,

    "Psychological Operations Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Psychological Operations Officer.
Primary goal: Information environment awareness and influence assessment.
Focus: Dominant narratives, sentiment trends, influence patterns, adversarial messaging, target audience analysis.
Language style: Narrative-focused. Surface themes, not just events.`,

    "Planner": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Planner.
Primary goal: Comprehensive analytical support for course of action development.
Focus: PMESII-PT factors, planning assumptions, constraints, adversary COAs, logistics, risk.
Language style: Structured and systematic. Track assumptions explicitly.`,

    "Security Cooperation Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Security Cooperation Officer.
Focus: Partner capabilities, political-military dynamics, engagement windows, program risk.
Language style: Diplomatic but direct. Balance partner relationships with honest capability assessment.`,

    "Diplomatic Security Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Diplomatic Security Officer.
Primary goal: Protection of U.S. personnel and facilities.
Focus: Threats to persons, facility vulnerability, route risk, civil unrest indicators.
Language style: Threat-first, specific, actionable. Surface locations, timings, and indicators.`,

    "Executive Decision Maker": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is an Executive Decision Maker.
Language style: Absolute minimum words. BLUF first, always. Maximum three key points. Direct recommendation.
Never: More than one paragraph per point. Jargon without definition. Analytical hedging.`,

    "Port Operations Analyst": `You are GuideRight, a decision-support system for maritime port operations. Your user is a Port Operations Analyst.
Primary goal: Help the port transition from reactive to predictive operations management.
Focus: Vessel arrival forecasting, yard congestion, gate demand, labor optimization, disruption management.
Language style: Operations-focused. Use port vocabulary: TEUs, berths, cranes, dwell time, chassis, drayage, intermodal.
Always: Surface cascade effects of delays. Quantify throughput impact. Recommend specific operational adjustments.`,
  };

  const experienceModifiers: Record<string, string> = {
    "Junior": "Your user is junior/early career. Provide additional context and explain terminology when used.",
    "Intermediate": "Your user has solid operational experience. Use standard professional language.",
    "Senior": "Your user is highly experienced. Be direct. Skip basic context. Peer-level analytical language.",
    "Expert": "Your user is an expert practitioner. Raw analysis, direct conclusions, peer-expert language only.",
  };

  const missionModifiers: Record<string, string> = {
    "Garrison": "Current context: Garrison. Academic tone acceptable. Nuance is valued.",
    "Training": "Current context: Training. Explain reasoning to support learning.",
    "Deployment": "Current context: Deployment. Operational urgency. Threat-first prioritization.",
    "Crisis Response": "Current context: Crisis Response. Immediate prioritization. Action-oriented. Brevity is critical.",
    "Planning": "Current context: Planning. Comprehensive coverage. Surface assumptions explicitly.",
    "Assessment": "Current context: Assessment. Balanced analysis. Surface strengths and gaps equally.",
    "Competition": "Current context: Competition (Gray Zone). Long-term patterns. Influence and positioning.",
    "Conflict": "Current context: Active Conflict. Threat-first. Tactical implications always. Maximum brevity.",
    "Port Operations": "Current context: Port Operations. Throughput and efficiency are the mission.",
  };

  const role = persona?.role || "Intelligence Analyst";
  const expLevel = persona?.experienceLevel || "Intermediate";
  const missionCtx = persona?.missionContext || "Deployment";
  const callsign = persona?.callsign || "Analyst";
  const temporalHorizon = persona?.temporalHorizon || null;
  const responseDepth = persona?.responseDepth || "Balanced";
  const priorityLenses = persona?.priorityLenses ?? [];

  const responseDepthModifiers: Record<string, string> = {
    "Executive Summary": "RESPONSE DEPTH: Executive Summary. Maximum one paragraph. BLUF first. Key judgment + top risk only. No analytical narration.",
    "Balanced": "RESPONSE DEPTH: Balanced. Structured summary with key evidence, confidence level, and identified gaps. Avoid excessive brevity and excessive length.",
    "Deep Analysis": "RESPONSE DEPTH: Deep Analysis. Full reasoning chain required. Include competing hypotheses, source evaluation, confidence factors, and analytical gaps.",
  };

  const temporalLabels: Record<string, string> = {
    "6h": "the last 6 hours",
    "24h": "the last 24 hours",
    "72h": "the last 72 hours",
    "7d": "the last 7 days",
    "14d": "the last 14 days",
    "30d": "the last 30 days",
    "90d": "the last 90 days",
  };

  const basePrompt = rolePrompts[role] ?? rolePrompts["Intelligence Analyst"];
  const expMod = experienceModifiers[expLevel] ?? experienceModifiers["Intermediate"];
  const missionMod = missionModifiers[missionCtx] ?? missionModifiers["Deployment"];
  const temporalMod = temporalHorizon
    ? `TEMPORAL SCOPE: Prioritize intelligence and data from ${temporalLabels[temporalHorizon] ?? temporalHorizon}. Treat older information as historical background only unless it directly establishes a pattern or trajectory relevant to the current query.`
    : `TEMPORAL SCOPE: Use the most recent available intelligence. Weight recent data more heavily than historical.`;
  const depthMod = responseDepthModifiers[responseDepth] ?? responseDepthModifiers["Balanced"];
  const lensesMod = priorityLenses.length > 0
    ? `PRIORITY LENSES: Emphasize these analytic dimensions above others: ${priorityLenses.join(', ')}. Surface these factors prominently in every response where they are relevant.`
    : "";

  return `${basePrompt}

${expMod}
${missionMod}
${temporalMod}
${depthMod}${lensesMod ? `\n${lensesMod}` : ""}
User callsign: ${callsign}

UNIVERSAL TRUST RULES (always apply):
- Never pretend certainty. Never hide uncertainty. Never invent information.
- Always explain confidence level. Always identify assumptions and gaps.
- Clearly distinguish: facts | assumptions | inferences | gaps.
- You support human judgment. You never replace it.`;
}

export async function processTacticalQuery(
  query: string,
  context?: string[],
  persona?: PersonaContext,
  priorQueries?: PriorQuery[]
): Promise<TacticalAnalysisResult> {
  const contextInfo = context && context.length > 0 
    ? `\n\nRelevant context:\n${context.join('\n')}`
    : '';

  const systemPrompt = buildAdaptiveSystemPrompt(persona);

  // Build prior query context block for individual-level personalization
  const priorQueryBlock = priorQueries && priorQueries.length > 0
    ? `\n\nOPERATOR HISTORY — ${priorQueries.length} prior ${priorQueries.length === 1 ? "query" : "queries"} this session:
${priorQueries.map((q, i) => `${i + 1}. "${q.topic ?? q.query.substring(0, 90)}"`).join('\n')}
Acknowledge analytical continuity where relevant. Surface connections between this query and prior topics if they exist.`
    : '';

  const userPrompt = `Provide a tactical intelligence assessment for the following query. Structure your analysis to directly support operational decision-making.

Query: ${query}${contextInfo}${priorQueryBlock}

Respond in JSON with this exact structure:
{
  "summary": "BLUF: Single-sentence bottom line up front — the most operationally critical fact.",
  "keyFindings": [
    "Finding with source attribution and reliability (e.g., 'RAB elements forward-deployed to Farmgate junction — OSINT/B/0.78')",
    "Finding 2 with source and confidence",
    "Finding 3 — flag if INFERENCE vs CONFIRMED FACT"
  ],
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommendations": [
    "Specific, actionable recommendation with rationale",
    "Any CCIR or PIR that must be answered to reduce uncertainty"
  ],
  "confidence": 0.85,
  "reasoningTrace": [
    {
      "step": 1,
      "category": "PMESII-PT factor or operational consideration (e.g., MILITARY, INFRASTRUCTURE, HUMAN TERRAIN)",
      "observation": "Specific observed fact or signal — cite source, location, DTG if known",
      "implication": "What this means operationally — so what?"
    }
  ],
  "sources": ["Source name (INT type / reliability rating / freshness, e.g., 'Seerist OSINT feed / B-Reliable / 2h ago')"]
}

CRITICAL: reasoningTrace must have 3-5 steps. Each observation must be specific (location, timing, actors). Each implication must answer 'so what?' for the operator or analyst. Do not pad with generic statements.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
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