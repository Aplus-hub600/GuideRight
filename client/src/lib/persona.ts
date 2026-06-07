export const ROLES = [
  "Intelligence Analyst",
  "SOF Operator",
  "Commander",
  "Civil Affairs Officer",
  "Psychological Operations Officer",
  "Planner",
  "Security Cooperation Officer",
  "Diplomatic Security Officer",
  "Executive Decision Maker",
  "Port Operations Analyst",
] as const;

export const EXPERIENCE_LEVELS = ["Junior", "Intermediate", "Senior", "Expert"] as const;

export const MISSION_CONTEXTS = [
  "Garrison",
  "Training",
  "Deployment",
  "Crisis Response",
  "Planning",
  "Assessment",
  "Competition",
  "Conflict",
  "Port Operations",
] as const;

export const RESPONSE_DEPTHS = ["Executive Summary", "Balanced", "Deep Analysis"] as const;

export const PRIORITY_LENSES = [
  "Threat Activity",
  "Human Activity",
  "Infrastructure",
  "Logistics",
  "Information Environment",
  "Political Activity",
  "Economic Activity",
  "Weather / Environmental",
] as const;

export type Role = (typeof ROLES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type MissionContext = (typeof MISSION_CONTEXTS)[number];
export type ResponseDepth = (typeof RESPONSE_DEPTHS)[number];
export type PriorityLens = (typeof PRIORITY_LENSES)[number];
export type TemporalHorizon = "6h" | "24h" | "72h" | "7d" | "14d" | "30d" | "90d";

export const TEMPORAL_HORIZON_DEFAULTS: Record<Role, TemporalHorizon> = {
  "SOF Operator": "6h",
  "Diplomatic Security Officer": "24h",
  "Commander": "24h",
  "Executive Decision Maker": "24h",
  "Intelligence Analyst": "72h",
  "Port Operations Analyst": "72h",
  "Civil Affairs Officer": "7d",
  "Psychological Operations Officer": "14d",
  "Planner": "30d",
  "Security Cooperation Officer": "90d",
};

export const TEMPORAL_HORIZON_LABELS: Record<TemporalHorizon, string> = {
  "6h": "6-hour window",
  "24h": "24-hour window",
  "72h": "72-hour window",
  "7d": "7-day window",
  "14d": "14-day window",
  "30d": "30-day window",
  "90d": "90-day window",
};

export const PRIORITY_LENS_DEFAULTS: Record<Role, PriorityLens[]> = {
  "Intelligence Analyst": ["Threat Activity", "Information Environment", "Infrastructure"],
  "SOF Operator": ["Threat Activity", "Logistics", "Human Activity"],
  "Commander": ["Threat Activity", "Infrastructure", "Political Activity"],
  "Civil Affairs Officer": ["Human Activity", "Infrastructure", "Political Activity"],
  "Psychological Operations Officer": ["Information Environment", "Political Activity", "Human Activity"],
  "Planner": ["Infrastructure", "Logistics", "Threat Activity"],
  "Security Cooperation Officer": ["Political Activity", "Infrastructure", "Human Activity"],
  "Diplomatic Security Officer": ["Threat Activity", "Infrastructure", "Logistics"],
  "Executive Decision Maker": ["Threat Activity", "Political Activity", "Infrastructure"],
  "Port Operations Analyst": ["Logistics", "Infrastructure", "Economic Activity"],
};

export const ROLE_OPTIMIZATIONS: Record<Role, string[]> = {
  "Intelligence Analyst": [
    "Source traceability and confidence scoring",
    "Competing hypotheses and analytical gaps",
    "PMESII-PT factor breakdown",
    "Evidence-grounded uncertainty framing",
  ],
  "SOF Operator": [
    "Operationally relevant threats and immediate changes",
    "Movement constraints and route exposure",
    "High-signal, concise summaries",
    "Force protection indicators",
  ],
  "Commander": [
    "Executive synthesis and decision implications",
    "COA comparison and risk framing",
    "Key information gaps affecting decisions",
    "Bottom-line-up-front structure",
  ],
  "Civil Affairs Officer": [
    "Population impacts and human terrain",
    "Infrastructure service status",
    "Community stability indicators",
    "Civil-military engagement planning",
  ],
  "Psychological Operations Officer": [
    "Dominant narratives and sentiment shifts",
    "Information environment amplification patterns",
    "Influence indicators and adversarial messaging",
    "Target audience analysis",
  ],
  "Planner": [
    "Constraints, dependencies, and planning assumptions",
    "Scenario comparison and COA development",
    "Logistics and timeline analysis",
    "Risk identification and mitigation options",
  ],
  "Security Cooperation Officer": [
    "Partner capacity and capability assessment",
    "Stability indicators and engagement windows",
    "Political-military dynamics",
    "Program risk and regional context",
  ],
  "Diplomatic Security Officer": [
    "Threats to personnel and facilities",
    "Route risk and mobility constraints",
    "Civil unrest indicators and triggers",
    "Advance work and facility proximity risk",
  ],
  "Executive Decision Maker": [
    "Top-line risk with likelihood and impact",
    "Strategic implications and key tradeoffs",
    "Concise recommended areas for attention",
    "Confidence level in one sentence",
  ],
  "Port Operations Analyst": [
    "Vessel arrival forecasting and disruption",
    "Yard congestion and dwell time analysis",
    "Gate demand and labor optimization",
    "Cascade effects of delays on throughput",
  ],
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  "Intelligence Analyst": "Signal detection, source analysis, PMESII",
  "SOF Operator": "Direct action, rapid SA, movement analysis",
  "Commander": "Decision support, COA comparison, risk",
  "Civil Affairs Officer": "Human terrain, infrastructure, engagement",
  "Psychological Operations Officer": "Narratives, influence, sentiment",
  "Planner": "COA development, wargaming, logistics",
  "Security Cooperation Officer": "Partner forces, engagement windows",
  "Diplomatic Security Officer": "Threat to persons, facility security",
  "Executive Decision Maker": "BLUF only, top-line decisions",
  "Port Operations Analyst": "Vessel flow, yard, gate, disruption",
};

export const CONTEXT_DESCRIPTIONS: Record<MissionContext, string> = {
  "Garrison": "Steady-state, home station",
  "Training": "Exercise or academic environment",
  "Deployment": "Forward-deployed, operational",
  "Crisis Response": "Immediate crisis, heightened urgency",
  "Planning": "Pre-mission or campaign planning",
  "Assessment": "Evaluation or survey mission",
  "Competition": "Gray zone, below threshold",
  "Conflict": "Active conflict environment",
  "Port Operations": "Terminal or logistics hub operations",
};

export function getTemporalHorizonForPersona(persona: UserPersona): TemporalHorizon {
  return persona.temporalHorizon ?? TEMPORAL_HORIZON_DEFAULTS[persona.role] ?? "72h";
}

export function getEffectiveLenses(persona: UserPersona): PriorityLens[] {
  if (persona.priorityLenses && persona.priorityLenses.length > 0) {
    return persona.priorityLenses;
  }
  return PRIORITY_LENS_DEFAULTS[persona.role] ?? [];
}

const LENS_TO_ACTION_PRIORITY: Record<string, string[]> = {
  "Threat Activity":        ["THREAT", "RISK", "SITREP", "BLUF", "DECISION"],
  "Human Activity":         ["HUMANTERRAIN", "HUMINT", "KEYLEADERS", "IMPACT"],
  "Infrastructure":         ["INFRA", "FACILITY", "LOGISTIC"],
  "Logistics":              ["ROUTE", "LOGISTIC", "GATE", "LABOR", "VESSEL"],
  "Information Environment":["NARRATIVES", "SENTIMENT", "INFLUENCERS", "MESSAGES"],
  "Political Activity":     ["PMESII", "PARTNER", "ENGAGEMENT", "PROTEST"],
  "Economic Activity":      ["VESSEL", "YARD", "GATE", "LABOR", "DISRUPT"],
  "Weather / Environmental":["SITREP", "PMESII"],
};

export function getOrderedQuickActions(role: Role, priorityLenses?: PriorityLens[]): QuickAction[] {
  const actions = getQuickActionsForRole(role);
  if (!priorityLenses || priorityLenses.length === 0) return actions;

  const scores = new Map<string, number>();
  priorityLenses.forEach((lens, lensIdx) => {
    const actionIds = LENS_TO_ACTION_PRIORITY[lens] ?? [];
    actionIds.forEach((actionId, actionRank) => {
      const weight = (3 - lensIdx) * 10 - actionRank;
      scores.set(actionId, (scores.get(actionId) ?? 0) + weight);
    });
  });

  return [...actions].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
}

export interface UserPersona {
  callsign: string;
  role: Role;
  experienceLevel: ExperienceLevel;
  missionContext: MissionContext;
  temporalHorizon?: TemporalHorizon;
  responseDepth?: ResponseDepth;
  priorityLenses?: PriorityLens[];
  lastActive?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  shortcut: string;
  colorClass: string;
}

const DEFAULT_PERSONA: UserPersona = {
  callsign: "Analyst",
  role: "Intelligence Analyst",
  experienceLevel: "Intermediate",
  missionContext: "Deployment",
};

const STORAGE_KEY = "guideright_persona";

export function loadPersona(): UserPersona | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserPersona;
  } catch {
    return null;
  }
}

export function savePersona(persona: UserPersona): void {
  persona.lastActive = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
}

export function clearPersona(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getWelcomeMessage(persona: UserPersona): string {
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 17 ? "Good afternoon" : "Good evening";
  const callsign = persona.callsign || "Analyst";

  const roleMessages: Record<Role, string> = {
    "Intelligence Analyst": `${greeting}, ${callsign}. Ready for analysis. Your workspace is configured for ${persona.missionContext} context — source-traced, gap-aware, and uncertainty-explicit.`,
    "SOF Operator": `${greeting}, ${callsign}. Systems up. ${persona.missionContext} posture active — threat-first, concise, operationally relevant.`,
    "Commander": `${greeting}, ${callsign}. GuideRight ready. Decision-support mode active for ${persona.missionContext} environment.`,
    "Civil Affairs Officer": `${greeting}, ${callsign}. Human terrain and infrastructure analysis ready for ${persona.missionContext} context.`,
    "Psychological Operations Officer": `${greeting}, ${callsign}. Information environment analysis ready. Narrative tracking and sentiment monitoring active.`,
    "Planner": `${greeting}, ${callsign}. Planning support ready. PMESII, COA, and constraints analysis available for ${persona.missionContext}.`,
    "Security Cooperation Officer": `${greeting}, ${callsign}. Partner capacity and engagement analysis ready for ${persona.missionContext} context.`,
    "Diplomatic Security Officer": `${greeting}, ${callsign}. Security analysis ready. Threat-to-persons and facility risk tracking active.`,
    "Executive Decision Maker": `${greeting}, ${callsign}. GuideRight ready. BLUF mode active — top-line decisions only.`,
    "Port Operations Analyst": `${greeting}, ${callsign}. Port operations support ready. Vessel forecasting and throughput optimization available.`,
  };

  return roleMessages[persona.role] ?? `${greeting}, ${callsign}. GuideRight ready.`;
}

export function getQuickActionsForRole(role: Role): QuickAction[] {
  const sets: Record<Role, QuickAction[]> = {
    "Intelligence Analyst": [
      { id: "PMESII", label: "PMESII", prompt: "Provide a comprehensive PMESII analysis for the current area of interest, with source confidence ratings and competing hypotheses.", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "THREAT", label: "Threats", prompt: "Identify and assess current threats, adversary capabilities, and force protection considerations. Highlight uncertainty and gaps.", shortcut: "2", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
      { id: "SITREP", label: "SITREP", prompt: "Generate a structured situation report for the current area of interest.", shortcut: "3", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
      { id: "SOURCES", label: "Sources", prompt: "Evaluate available intelligence sources for this area. What is confirmed, what is single-source, and what are the critical information gaps?", shortcut: "4", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { id: "GAPS", label: "Intel Gaps", prompt: "Identify the most critical intelligence gaps and priority information requirements for this area.", shortcut: "5", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    ],
    "SOF Operator": [
      { id: "THREAT", label: "Threats", prompt: "What are the immediate threats to force protection? Be direct, prioritized, and brief.", shortcut: "1", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
      { id: "ROUTE", label: "Routes", prompt: "Analyze movement corridors, chokepoints, and route exposure in this area. Focus on threats and constraints.", shortcut: "2", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "INFRA", label: "Key Terrain", prompt: "Identify critical infrastructure and key terrain. Focus on what matters for small unit operations.", shortcut: "3", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { id: "HUMINT", label: "HUMINT", prompt: "What do we know about the human terrain? Key actors, attitudes toward outside forces, and indicators of hostile intent.", shortcut: "4", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      { id: "SITREP", label: "SITREP", prompt: "Quick situation summary. What do I need to know right now?", shortcut: "5", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
    ],
    "Commander": [
      { id: "SITREP", label: "SITREP", prompt: "Provide an executive situation report. Prioritize by decision relevance.", shortcut: "1", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
      { id: "OPTIONS", label: "Options", prompt: "Compare available courses of action for the current situation. Include key risks and resource requirements.", shortcut: "2", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "RISK", label: "Risk", prompt: "What are the top three risks to mission success? Include confidence levels.", shortcut: "3", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
      { id: "GAPS", label: "Info Gaps", prompt: "What are the critical information gaps affecting my decision? What do I need to know before committing?", shortcut: "4", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "DECISION", label: "Decision", prompt: "Give me a bottom-line-up-front assessment with a recommended course of action.", shortcut: "5", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    ],
    "Civil Affairs Officer": [
      { id: "HUMANTERRAIN", label: "Human Terrain", prompt: "Analyze the human terrain: population demographics, key communities, displacement patterns, and civilian concerns.", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "INFRA", label: "Infrastructure", prompt: "Assess critical infrastructure status — medical, utilities, education, government services. What is functional, degraded, or absent?", shortcut: "2", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { id: "KEYLEADERS", label: "Key Leaders", prompt: "Identify key leaders, influencers, and community stakeholders relevant to civil affairs engagement.", shortcut: "3", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "PMESII", label: "PMESII", prompt: "Provide a PMESII analysis with emphasis on social and infrastructure factors and their impact on the civilian population.", shortcut: "4", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      { id: "IMPACT", label: "Civil Impact", prompt: "What are the likely civilian impacts of current or planned operations in this area?", shortcut: "5", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
    ],
    "Psychological Operations Officer": [
      { id: "NARRATIVES", label: "Narratives", prompt: "What are the dominant narratives in the information environment for this area? Identify competing narratives and their reach.", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "SENTIMENT", label: "Sentiment", prompt: "Analyze public sentiment and attitude shifts in this area. What is driving changes?", shortcut: "2", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "INFLUENCERS", label: "Influencers", prompt: "Who are the key information influencers in this environment? Identify amplifiers, credible voices, and adversarial actors.", shortcut: "3", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      { id: "THREAT", label: "Info Threats", prompt: "What adversarial information operations are active in this area? Identify themes, vectors, and target audiences.", shortcut: "4", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
      { id: "MESSAGES", label: "Messages", prompt: "Suggest key messages and themes for information operations engagement in this environment.", shortcut: "5", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
    ],
    "Planner": [
      { id: "PMESII", label: "PMESII", prompt: "Provide a comprehensive PMESII-PT analysis for planning purposes. Include key assumptions and planning considerations.", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "COA", label: "COA Dev", prompt: "Identify the key factors, constraints, and assumptions that should shape course of action development for this area.", shortcut: "2", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      { id: "WARGAME", label: "Wargame", prompt: "What are the most likely adversary courses of action and potential points of friction? Walk through a basic wargame for this area.", shortcut: "3", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "LOGISTIC", label: "Logistics", prompt: "Identify logistical considerations, support requirements, and potential constraints for operations in this area.", shortcut: "4", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { id: "RISK", label: "Risk", prompt: "Conduct a risk assessment for the planning environment. Identify top risks, probability, and mitigation options.", shortcut: "5", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
    ],
    "Security Cooperation Officer": [
      { id: "PARTNER", label: "Partner Forces", prompt: "Assess partner nation military capabilities, limitations, and interoperability considerations.", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "ENGAGEMENT", label: "Engagement", prompt: "Identify current and near-term security cooperation engagement windows and program opportunities.", shortcut: "2", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
      { id: "INFRA", label: "Infrastructure", prompt: "Assess defense infrastructure and logistics network capacity relevant to security cooperation programs.", shortcut: "3", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { id: "PMESII", label: "PMESII", prompt: "PMESII analysis focused on political-military factors affecting security cooperation.", shortcut: "4", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      { id: "RISK", label: "Risk", prompt: "What are the security cooperation risks: political, operational, and reputational?", shortcut: "5", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
    ],
    "Diplomatic Security Officer": [
      { id: "THREAT", label: "Threat to Persons", prompt: "What are the current threats to U.S. personnel and facilities? Prioritize by likelihood and severity.", shortcut: "1", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
      { id: "FACILITY", label: "Facility Security", prompt: "Assess the security environment for U.S. diplomatic facilities in this area.", shortcut: "2", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "ROUTE", label: "Route Analysis", prompt: "Analyze primary and alternate routes. Identify chokepoints, surveillance indicators, and exposure zones.", shortcut: "3", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "PROTEST", label: "Civil Unrest", prompt: "What is the current civil unrest risk? Identify triggers, key locations, and indicators of escalation.", shortcut: "4", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      { id: "ADVANCE", label: "Advance Work", prompt: "What do I need to know for advance work in this area? Surface high-risk locations and recommended mitigations.", shortcut: "5", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
    ],
    "Executive Decision Maker": [
      { id: "BLUF", label: "BLUF", prompt: "Bottom line up front: what is the single most important thing I need to know about this situation?", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "RISK", label: "Top Risks", prompt: "What are the top three risks? Give me likelihood and impact for each. No more than three sentences per risk.", shortcut: "2", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
      { id: "OPTIONS", label: "Options", prompt: "Summarize the available options in one paragraph each. What are the key tradeoffs?", shortcut: "3", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "DECISION", label: "Recommend", prompt: "What is the recommended course of action and why? Be direct.", shortcut: "4", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
      { id: "SITREP", label: "SITREP", prompt: "Give me the executive situation report in five sentences or fewer.", shortcut: "5", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    ],
    "Port Operations Analyst": [
      { id: "VESSEL", label: "Vessel Forecast", prompt: "Forecast vessel arrivals and departures for the next 24-72 hours. Flag any delays and their downstream impact.", shortcut: "1", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
      { id: "YARD", label: "Yard Status", prompt: "Assess current yard congestion. Identify hotspots, dwell time issues, and recommended repositioning actions.", shortcut: "2", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      { id: "GATE", label: "Gate Demand", prompt: "Forecast gate demand by time of day and carrier. Recommend appointment adjustments to smooth flow.", shortcut: "3", colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
      { id: "LABOR", label: "Labor Opt.", prompt: "Optimize labor shift assignments based on forecasted inbound volume. Identify overtime risk.", shortcut: "4", colorClass: "text-green-400 bg-green-500/10 border-green-500/30" },
      { id: "DISRUPT", label: "Disruption", prompt: "What disruptions are active or likely in the next 48 hours? Assess cascade effects on terminal throughput.", shortcut: "5", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
    ],
  };

  return sets[role] ?? sets["Intelligence Analyst"];
}
