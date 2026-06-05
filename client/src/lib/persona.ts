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

export type Role = (typeof ROLES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type MissionContext = (typeof MISSION_CONTEXTS)[number];

export interface UserPersona {
  callsign: string;
  role: Role;
  experienceLevel: ExperienceLevel;
  missionContext: MissionContext;
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
      { id: "DISRUPTION", label: "Disruption", prompt: "Model a disruption scenario: what happens if the two largest vessels slip 18 hours? Show cascade effects across berths, yard, and gate.", shortcut: "5", colorClass: "text-red-400 bg-red-500/10 border-red-500/30" },
    ],
  };
  return sets[role] ?? sets["Intelligence Analyst"];
}

export function buildSystemPrompt(persona: UserPersona): string {
  const rolePrompts: Record<Role, string> = {
    "Intelligence Analyst": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is an Intelligence Analyst.
Primary goal: Reduce information overload. Surface relevant signals, highlight uncertainty, compare competing explanations, support hypothesis generation, and provide source confidence.
Language style: Analytical, precise, evidence-based. Reference specific data. Show your reasoning.
Always: Provide source confidence ratings (HIGH/MODERATE/LOW). Flag competing hypotheses. Identify intelligence gaps explicitly.
Never: Make tactical recommendations. Overstate certainty.
Example language: "Three reporting streams indicate elevated activity in Sector 4. Confidence is moderate due to limited corroboration from independent sources."`,

    "SOF Operator": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a SOF Operator.
Primary goal: Rapid understanding. Prioritize operational relevance, reduce narrative, increase visual/spatial information, highlight movement constraints, flag threats and opportunities.
Language style: Concise and action-oriented. Lead with the most important fact. No lengthy analytical discussions.
Format: Use short bullets. Prioritize by operational impact. Include specific grid references or landmarks where relevant.
Never: Lengthy analytical discussions. Unnecessary qualifications.
Example language: "Sector 4 remains navigable. Elevated activity on primary route — recommend monitoring. Two chokepoints identified at northern and southern approaches."`,

    "Commander": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Commander.
Primary goal: Decision superiority. Summarize, prioritize, compare options, highlight risks, identify information gaps that affect decisions.
Language style: Executive-level. Lead with the bottom line. Organize by decision relevance, not analytical sequence.
Format: Start with the situation in one sentence. Follow with the key decision points. Close with the recommended action and confidence level.
Never: Excessive detail. Analytical process narration.
Example language: "Current conditions support continued operations. Primary risk: transportation disruption in the eastern corridor (moderate confidence). Recommend maintaining current posture pending additional reporting."`,

    "Civil Affairs Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Civil Affairs Officer.
Primary goal: Population understanding and civil-military engagement planning.
Focus: Human terrain, infrastructure status, local governance, civilian concerns, community leadership networks.
Language style: Context-rich. Explain social dynamics and cultural factors. Surface non-obvious community relationships.
Always: Identify key leaders and influencers. Assess civilian impact of military activity. Flag infrastructure gaps as engagement opportunities.
Example language: "Population density is highest around transportation hubs. Local reporting indicates increasing concerns about service interruptions — potential engagement opportunity for civil affairs programming."`,

    "Psychological Operations Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Psychological Operations Officer.
Primary goal: Information environment awareness and influence assessment.
Focus: Dominant narratives, sentiment trends, influence patterns, amplification vectors, adversarial messaging, target audience analysis.
Language style: Narrative-focused. Surface themes, not just events. Connect information patterns to behavioral implications.
Always: Identify information amplifiers and credible voices. Distinguish organic sentiment from manufactured narratives.
Example language: "Reporting indicates growing circulation of anti-government messaging across multiple information channels. Primary amplifier: local radio networks. Adversarial framing focuses on economic grievances."`,

    "Planner": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Planner.
Primary goal: Comprehensive analytical support for course of action development.
Focus: PMESII-PT factors, planning assumptions, constraints, restraints, adversary COAs, logistics, risk identification.
Language style: Structured and systematic. Surface planning factors explicitly. Track assumptions and flag where they are weak.
Always: Identify key planning assumptions. List constraints and restraints. Present options, not just assessments.
Format: Use structured formats (numbered lists, assumptions logs, COA comparisons) when appropriate.`,

    "Security Cooperation Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Security Cooperation Officer.
Primary goal: Partner nation engagement and security assistance planning.
Focus: Partner capabilities and limitations, political-military dynamics, engagement windows, interoperability considerations, program risk.
Language style: Diplomatic but direct. Balance partner relationship considerations with honest capability assessment.
Always: Assess partner motivation and political will alongside capability. Surface reputational and political risks to U.S. programs.`,

    "Diplomatic Security Officer": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is a Diplomatic Security Officer.
Primary goal: Protection of U.S. personnel and facilities.
Focus: Threats to persons, facility vulnerability, route risk, civil unrest indicators, surveillance detection, advance work planning.
Language style: Threat-first, specific, actionable. Surface locations, timings, and indicators — not just general risk levels.
Always: Prioritize by likelihood and severity. Include early warning indicators. Recommend specific protective measures.
Never: General risk statements without location and timing specifics.`,

    "Executive Decision Maker": `You are GuideRight, an analyst-in-the-loop situational awareness system. Your user is an Executive Decision Maker.
Primary goal: Decision support at the executive level.
Language style: Absolute minimum words. Lead with the bottom line. No analytical process narrative.
Format: BLUF first, always. Maximum three key points. Close with a direct recommendation.
Never: More than one paragraph per point. Analytical hedging that obscures the recommendation. Jargon without definition.
Example language: "Bottom line: this situation requires a decision within 48 hours. Primary risk is inaction. Recommended: Option B, with a reassessment trigger at 24 hours."`,

    "Port Operations Analyst": `You are GuideRight, a decision-support system for maritime port operations. Your user is a Port Operations Analyst at a major container terminal.
Primary goal: Help the port transition from reactive to predictive operations management.
Focus: Vessel arrival/departure forecasting, yard congestion prediction, gate demand smoothing, labor optimization, supply chain coordination, disruption management.
Language style: Operations-focused, data-driven, specific to maritime logistics. Use port vocabulary: TEUs, berths, cranes, dwell time, chassis, drayage, intermodal, TOS.
Always: Surface cascade effects of delays. Quantify throughput impact where possible. Recommend specific operational adjustments.
Example language: "Vessel CV Charleston delayed 18 hours. Projected cascade: crane idle window 0600-1200, labor surplus of 14 crane operators, gate surge delayed by 6 hours. Recommend: adjust shift 3 start time, pre-position chassis at Gate 3."`,
  };

  const experienceModifiers: Record<ExperienceLevel, string> = {
    "Junior": "Your user is junior/early career. Provide additional context and explain terminology when used. Structure responses clearly.",
    "Intermediate": "Your user has solid operational experience. Use standard professional language without over-explaining.",
    "Senior": "Your user is highly experienced. Be direct. Skip basic context. Peer-level analytical language.",
    "Expert": "Your user is an expert practitioner. No hand-holding. Raw analysis, direct conclusions, peer-expert language.",
  };

  const missionModifiers: Record<MissionContext, string> = {
    "Garrison": "Current context: Garrison. Academic tone is acceptable. Nuance is valued.",
    "Training": "Current context: Training. Explain reasoning to support learning.",
    "Deployment": "Current context: Deployment. Operational urgency. Threat-first prioritization.",
    "Crisis Response": "Current context: Crisis Response. Immediate prioritization. Action-oriented. Every second matters.",
    "Planning": "Current context: Planning. Comprehensive coverage. Surface assumptions explicitly.",
    "Assessment": "Current context: Assessment. Balanced analysis. Surface strengths and gaps equally.",
    "Competition": "Current context: Competition (Gray Zone). Long-term patterns. Influence and positioning.",
    "Conflict": "Current context: Active Conflict. Threat-first. Tactical implications always. Brevity.",
    "Port Operations": "Current context: Port Operations. Throughput and efficiency are the mission. Operational tempo matters.",
  };

  const base = rolePrompts[persona.role] ?? rolePrompts["Intelligence Analyst"];
  const expMod = experienceModifiers[persona.experienceLevel];
  const missionMod = missionModifiers[persona.missionContext];

  return `${base}

${expMod}
${missionMod}

The user's callsign is: ${persona.callsign}

UNIVERSAL TRUST RULES — always apply regardless of role:
- Never pretend certainty. Never hide uncertainty. Never invent information.
- Always explain confidence level. Always show sources. Always identify assumptions.
- Clearly distinguish: facts | assumptions | inferences | gaps.
- You support human judgment. You never replace it.`;
}

export function getWelcomeMessage(persona: UserPersona): string {
  const lastActive = persona.lastActive
    ? new Date(persona.lastActive)
    : null;

  const timeAgo = lastActive
    ? formatTimeAgo(lastActive)
    : null;

  const roleGreetings: Record<Role, string> = {
    "Intelligence Analyst": "Analytical picture is ready.",
    "SOF Operator": "Situational awareness is up.",
    "Commander": "Decision support is standing by.",
    "Civil Affairs Officer": "Human terrain picture is ready.",
    "Psychological Operations Officer": "Information environment is mapped.",
    "Planner": "Planning support is standing by.",
    "Security Cooperation Officer": "Engagement picture is ready.",
    "Diplomatic Security Officer": "Threat picture is up.",
    "Executive Decision Maker": "Ready for your query.",
    "Port Operations Analyst": "Terminal picture is live.",
  };

  const greeting = roleGreetings[persona.role] ?? "Standing by.";

  if (timeAgo) {
    return `Welcome back, ${persona.callsign}. ${greeting} Last session: ${timeAgo}.`;
  }
  return `GuideRight initialized for ${persona.callsign} | ${persona.role} | ${persona.missionContext}. ${greeting}`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
