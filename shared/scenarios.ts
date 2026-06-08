export interface TimeWindow {
  id: string;
  label: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface SIGACTEvent {
  id: string;
  timestamp: string;
  category: "SECURITY" | "POLITICAL" | "ECONOMIC" | "SOCIAL" | "INFRASTRUCTURE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  source: string;
  reliability: "A" | "B" | "C" | "D" | "E" | "F";
  confidence: number;
  timeWindow: string;
  coordinates?: { lat: number; lng: number };
}

export interface PMESIIAssessment {
  timeWindow: string;
  political: { status: string; trend: "IMPROVING" | "STABLE" | "DEGRADING"; confidence: number; summary: string; indicators: string[] };
  military: { status: string; trend: "IMPROVING" | "STABLE" | "DEGRADING"; confidence: number; summary: string; indicators: string[] };
  economic: { status: string; trend: "IMPROVING" | "STABLE" | "DEGRADING"; confidence: number; summary: string; indicators: string[] };
  social: { status: string; trend: "IMPROVING" | "STABLE" | "DEGRADING"; confidence: number; summary: string; indicators: string[] };
  information: { status: string; trend: "IMPROVING" | "STABLE" | "DEGRADING"; confidence: number; summary: string; indicators: string[] };
  infrastructure: { status: string; trend: "IMPROVING" | "STABLE" | "DEGRADING"; confidence: number; summary: string; indicators: string[] };
}

export interface ASCOPEProfile {
  timeWindow: string;
  areas: { description: string; keyTerrain: string[]; significance: "LOW" | "MEDIUM" | "HIGH" };
  structures: { description: string; criticalFacilities: string[]; significance: "LOW" | "MEDIUM" | "HIGH" };
  capabilities: { description: string; available: string[]; significance: "LOW" | "MEDIUM" | "HIGH" };
  organizations: { description: string; keyActors: string[]; significance: "LOW" | "MEDIUM" | "HIGH" };
  people: { description: string; demographics: string[]; significance: "LOW" | "MEDIUM" | "HIGH" };
  events: { description: string; scheduled: string[]; significance: "LOW" | "MEDIUM" | "HIGH" };
}

export interface InfrastructureStatus {
  timeWindow: string;
  healthcare: { status: "OPERATIONAL" | "DEGRADED" | "DISRUPTED"; capacity: number; notes: string };
  transportation: { status: "OPERATIONAL" | "DEGRADED" | "DISRUPTED"; accessibility: number; notes: string };
  utilities: { status: "OPERATIONAL" | "DEGRADED" | "DISRUPTED"; coverage: number; notes: string };
  communications: { status: "OPERATIONAL" | "DEGRADED" | "DISRUPTED"; reliability: number; notes: string };
}

export interface RiskIndicator {
  id: string;
  category: string;
  indicator: string;
  currentState: string;
  threshold: string;
  trend: "INCREASING" | "STABLE" | "DECREASING";
  confidence: number;
  timeWindow: string;
  monitoringPriority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  location: { name: string; lat: number; lng: number; radiusKm: number };
  context: string;
  analyticNeed: string[];
  timeWindows: TimeWindow[];
  sigactEvents: SIGACTEvent[];
  pmesiiAssessments: PMESIIAssessment[];
  ascopeProfiles: ASCOPEProfile[];
  infrastructureStatus: InfrastructureStatus[];
  riskIndicators: RiskIndicator[];
  watchItems: string[];
  dataLimitations: string[];
}

export const DHAKA_POLITICAL_CRISIS: Scenario = {
  id: "dhaka-political-crisis-2024",
  name: "Dhaka Political Crisis - December 2024",
  description: "High-visibility political incident with protests, localized disruptions, and increased security activity across Dhaka.",
  location: { name: "Dhaka", lat: 23.8103, lng: 90.4125, radiusKm: 25 },
  context: "Following a high-visibility political incident in mid-December, there were reports of protests, localized disruptions, and increased security activity across parts of Dhaka. An interagency team is tasked with maintaining situational awareness and assessing near-term risks in a large, complex urban environment.",
  analyticNeed: [
    "Overall risk posture and how it may be changing over time",
    "Infrastructure considerations that could affect access and movement",
    "Areas of increased activity and confidence/limitations of reporting",
    "Indicators warranting closer monitoring over next 48-72 hours"
  ],
  timeWindows: [
    {
      id: "baseline",
      label: "Baseline",
      description: "12 months prior to incident - Normal operational environment",
      startDate: "2023-12-15",
      endDate: "2024-11-14"
    },
    {
      id: "focused",
      label: "Focused Window",
      description: "30 days before and after incident - Heightened activity period",
      startDate: "2024-11-15",
      endDate: "2025-01-15"
    },
    {
      id: "recent",
      label: "Recent",
      description: "Last 7-14 days - Current situational picture",
      startDate: "2025-01-05",
      endDate: "2025-01-19"
    }
  ],
  sigactEvents: [
    {
      id: "sig-001",
      timestamp: "2024-12-14T14:30:00Z",
      category: "POLITICAL",
      severity: "CRITICAL",
      who: "Opposition coalition supporters",
      what: "Large-scale protest march toward government district",
      where: "Shahbag to Secretariat Road corridor",
      when: "14 DEC 2024, 1430L",
      why: "Response to contested election results announcement",
      source: "Multiple OSINT streams, local media",
      reliability: "B",
      confidence: 0.85,
      timeWindow: "focused",
      coordinates: { lat: 23.7389, lng: 90.3958 }
    },
    {
      id: "sig-002",
      timestamp: "2024-12-14T18:45:00Z",
      category: "SECURITY",
      severity: "HIGH",
      who: "Rapid Action Battalion (RAB)",
      what: "Deployment of crowd control units to key intersections",
      where: "Motijheel, Farmgate, Mirpur Road junctions",
      when: "14 DEC 2024, 1845L",
      why: "Preemptive security posture ahead of evening protests",
      source: "Social media imagery, traffic monitoring",
      reliability: "B",
      confidence: 0.78,
      timeWindow: "focused",
      coordinates: { lat: 23.7285, lng: 90.4193 }
    },
    {
      id: "sig-003",
      timestamp: "2024-12-15T09:00:00Z",
      category: "INFRASTRUCTURE",
      severity: "MEDIUM",
      who: "Bangladesh Telecommunication Regulatory Commission",
      what: "Mobile internet throttling reported in central districts",
      where: "Dhaka metropolitan area",
      when: "15 DEC 2024, 0900L",
      why: "Suspected government-directed information control measure",
      source: "NetBlocks monitoring, user reports",
      reliability: "A",
      confidence: 0.92,
      timeWindow: "focused",
      coordinates: { lat: 23.8103, lng: 90.4125 }
    },
    {
      id: "sig-004",
      timestamp: "2024-12-16T11:20:00Z",
      category: "SOCIAL",
      severity: "HIGH",
      who: "Student organizations (Chhatra League factions)",
      what: "Campus walkouts and solidarity marches",
      where: "Dhaka University, BUET, Jagannath University",
      when: "16 DEC 2024, 1120L",
      why: "Support for broader opposition movement",
      source: "Campus social media, local stringers",
      reliability: "B",
      confidence: 0.75,
      timeWindow: "focused",
      coordinates: { lat: 23.7340, lng: 90.3925 }
    },
    {
      id: "sig-005",
      timestamp: "2024-12-18T07:00:00Z",
      category: "ECONOMIC",
      severity: "MEDIUM",
      who: "Garment Workers Federation",
      what: "Work stoppages at 12+ factories in industrial zone",
      where: "Gazipur, Ashulia industrial corridors",
      when: "18 DEC 2024, 0700L",
      why: "Solidarity action; also wage grievances",
      source: "Industry contacts, labor monitoring",
      reliability: "B",
      confidence: 0.72,
      timeWindow: "focused",
      coordinates: { lat: 23.9912, lng: 90.4200 }
    },
    {
      id: "sig-006",
      timestamp: "2024-12-20T16:00:00Z",
      category: "POLITICAL",
      severity: "HIGH",
      who: "Government officials",
      what: "Curfew announced for select districts effective 2000L",
      where: "Gulshan, Banani, Motijheel",
      when: "20 DEC 2024, 1600L announcement",
      why: "Restore order following 5 days of protests",
      source: "Official government broadcast",
      reliability: "A",
      confidence: 0.95,
      timeWindow: "focused",
      coordinates: { lat: 23.7925, lng: 90.4078 }
    },
    {
      id: "sig-007",
      timestamp: "2025-01-08T10:30:00Z",
      category: "SECURITY",
      severity: "MEDIUM",
      who: "Unknown actors",
      what: "Small explosive device detonated near transit hub",
      where: "Kamalapur Railway Station vicinity",
      when: "08 JAN 2025, 1030L",
      why: "Under investigation; no immediate claim",
      source: "Police reports, local media",
      reliability: "B",
      confidence: 0.68,
      timeWindow: "recent",
      coordinates: { lat: 23.7326, lng: 90.4265 }
    },
    {
      id: "sig-008",
      timestamp: "2025-01-12T14:00:00Z",
      category: "POLITICAL",
      severity: "MEDIUM",
      who: "Opposition leaders",
      what: "Press conference announcing 'National Unity March' for Jan 20",
      where: "Dhaka Press Club",
      when: "12 JAN 2025, 1400L",
      why: "Renewed push for electoral reforms",
      source: "Live broadcast, verified accounts",
      reliability: "A",
      confidence: 0.90,
      timeWindow: "recent",
      coordinates: { lat: 23.7280, lng: 90.4050 }
    },
    {
      id: "sig-009",
      timestamp: "2025-01-15T08:00:00Z",
      category: "INFRASTRUCTURE",
      severity: "LOW",
      who: "Dhaka WASA (Water Authority)",
      what: "Scheduled maintenance affecting water supply in 3 zones",
      where: "Mirpur, Pallabi, Kafrul",
      when: "15-17 JAN 2025",
      why: "Infrastructure maintenance",
      source: "Official utility notice",
      reliability: "A",
      confidence: 0.95,
      timeWindow: "recent",
      coordinates: { lat: 23.8223, lng: 90.3654 }
    },
    {
      id: "sig-010",
      timestamp: "2025-01-17T19:30:00Z",
      category: "SOCIAL",
      severity: "MEDIUM",
      who: "Religious leaders coalition",
      what: "Friday sermon coordination calling for peaceful resolution",
      where: "Baitul Mukarram and major mosques citywide",
      when: "17 JAN 2025, 1930L",
      why: "De-escalation messaging ahead of planned march",
      source: "Religious affairs monitoring",
      reliability: "B",
      confidence: 0.70,
      timeWindow: "recent",
      coordinates: { lat: 23.7333, lng: 90.4102 }
    },
    {
      id: "sig-011",
      timestamp: "2025-01-19T03:15:00Z",
      category: "SECURITY",
      severity: "CRITICAL",
      who: "Unknown armed element, est. 6-8 personnel",
      what: "Armed assault on BGB checkpoint; 2 BGB personnel wounded, checkpoint abandoned",
      where: "Teknaf-Cox's Bazar Highway, km marker 22, approx 800m north of Teknaf ferry crossing",
      when: "19 JAN 2025, 0315L",
      why: "Assessed: Arakan Army-affiliated element clearing border corridor for smuggling/transit operation; pattern consistent with 3 prior incidents in Dec 2024",
      source: "BGB incident report (RESTRICTED), local medical facility admission records",
      reliability: "A",
      confidence: 0.87,
      timeWindow: "recent",
      coordinates: { lat: 20.8634, lng: 92.3084 }
    },
    {
      id: "sig-012",
      timestamp: "2025-01-19T11:00:00Z",
      category: "INFRASTRUCTURE",
      severity: "HIGH",
      who: "Unknown actors (IED emplacement team)",
      what: "Improvised device (command-wire, approx 5kg ANFO-equivalent) discovered and rendered safe by EOD; primary route N1 closed 4 hours",
      where: "N1 National Highway underpass, Kanchpur Bridge approach, 14km NE of Dhaka",
      when: "19 JAN 2025, 1100L (discovery); EOD clear 1520L",
      why: "Under investigation; location selected for maximum route disruption effect on Dhaka-Chittagong corridor; no claim of responsibility",
      source: "DGFI reporting, police EOD log, traffic authority advisory",
      reliability: "A",
      confidence: 0.91,
      timeWindow: "recent",
      coordinates: { lat: 23.8667, lng: 90.5333 }
    },
    {
      id: "sig-013",
      timestamp: "2025-01-20T07:45:00Z",
      category: "POLITICAL",
      severity: "CRITICAL",
      who: "Government of Bangladesh (Prime Minister's Office)",
      what: "Nationwide state of emergency declared; military authorized for internal security operations; all public gatherings banned; border crossings restricted",
      where: "Nationwide (highest concentration of enforcement in Dhaka, Chittagong)",
      when: "20 JAN 2025, 0745L — announced via state broadcaster BTV",
      why: "Government response to sustained unrest and Jan 19 security incidents; emergency powers invoke CRPCO 1970",
      source: "Official government broadcast (A1), diplomatic cable summary, UN OCHA flash report",
      reliability: "A",
      confidence: 0.98,
      timeWindow: "recent",
      coordinates: { lat: 23.8103, lng: 90.4125 }
    }
  ],
  pmesiiAssessments: [
    {
      timeWindow: "baseline",
      political: {
        status: "STABLE",
        trend: "STABLE",
        confidence: 0.80,
        summary: "Ruling party maintains parliamentary majority; opposition activity within normal parameters for pre-election period.",
        indicators: ["Regular parliamentary sessions", "Scheduled local elections proceeding", "Diplomatic engagement normal"]
      },
      military: {
        status: "ROUTINE POSTURE",
        trend: "STABLE",
        confidence: 0.85,
        summary: "Armed forces in standard peacetime posture; border security normal; internal security role minimal.",
        indicators: ["Normal garrison activity", "Routine border patrols", "Training exercises on schedule"]
      },
      economic: {
        status: "MODERATE STRESS",
        trend: "STABLE",
        confidence: 0.75,
        summary: "Garment exports stable; currency under pressure; inflation elevated but managed.",
        indicators: ["Taka at 110/USD", "Remittance flows steady", "Foreign reserves adequate"]
      },
      social: {
        status: "CALM",
        trend: "STABLE",
        confidence: 0.70,
        summary: "No significant unrest; student activity limited to campus issues; labor relations normal.",
        indicators: ["University sessions normal", "Labor disputes localized", "Religious harmony maintained"]
      },
      information: {
        status: "OPEN",
        trend: "STABLE",
        confidence: 0.78,
        summary: "Media operating normally; social media unrestricted; some self-censorship on political topics.",
        indicators: ["Internet speeds normal", "Press conferences held regularly", "Social media engagement typical"]
      },
      infrastructure: {
        status: "FUNCTIONAL",
        trend: "STABLE",
        confidence: 0.82,
        summary: "Power supply adequate; transportation networks operational; healthcare system at normal capacity.",
        indicators: ["Load shedding minimal", "Traffic patterns normal", "Hospital occupancy 65%"]
      }
    },
    {
      timeWindow: "focused",
      political: {
        status: "HIGHLY VOLATILE",
        trend: "DEGRADING",
        confidence: 0.75,
        summary: "Contested election results triggered mass protests; opposition demands new elections; government imposing emergency measures.",
        indicators: ["Curfews in 3 districts", "Opposition leaders detained briefly", "International observer concerns raised", "Parliament sessions suspended"]
      },
      military: {
        status: "ELEVATED PRESENCE",
        trend: "DEGRADING",
        confidence: 0.80,
        summary: "Military units deployed in support of civil authority; checkpoints established; potential for expanded role.",
        indicators: ["Army checkpoints at key intersections", "RAB conducting crowd control", "Border alert status raised", "Cantonment leaves cancelled"]
      },
      economic: {
        status: "DISRUPTED",
        trend: "DEGRADING",
        confidence: 0.72,
        summary: "Business closures widespread; garment shipments delayed; banking sector operating reduced hours; currency volatility.",
        indicators: ["Dhaka Stock Exchange suspended 2 days", "Factory production down 40%", "Taka dropped to 118/USD", "Import delays at ports"]
      },
      social: {
        status: "TENSE",
        trend: "DEGRADING",
        confidence: 0.68,
        summary: "Student movements mobilized; labor solidarity actions; religious leaders calling for calm; communal tensions elevated.",
        indicators: ["University campuses closed", "Worker strikes in industrial zones", "Mosque coordination on messaging", "Minority community concerns reported"]
      },
      information: {
        status: "RESTRICTED",
        trend: "DEGRADING",
        confidence: 0.85,
        summary: "Mobile internet throttled; social media platforms intermittently blocked; foreign journalist movements restricted.",
        indicators: ["4G speeds reduced 80%", "Facebook/WhatsApp disrupted", "Press access limited to briefings", "VPN usage spiking"]
      },
      infrastructure: {
        status: "STRAINED",
        trend: "DEGRADING",
        confidence: 0.70,
        summary: "Transportation disrupted by protests and checkpoints; healthcare facilities treating protest injuries; power supply maintained.",
        indicators: ["Major roads blocked intermittently", "Hospitals at 90% capacity", "Public transit reduced service", "Fuel distribution prioritized"]
      }
    },
    {
      timeWindow: "recent",
      political: {
        status: "VOLATILE",
        trend: "STABLE",
        confidence: 0.65,
        summary: "Situation remains tense but stabilizing; opposition planning new march; government signaling willingness for dialogue.",
        indicators: ["Curfew lifted in 2 of 3 districts", "Dialogue committee formed", "Opposition march announced for Jan 20", "International mediation offered"]
      },
      military: {
        status: "ELEVATED",
        trend: "STABLE",
        confidence: 0.75,
        summary: "Security forces maintaining presence but posture less aggressive; checkpoints reduced but not eliminated.",
        indicators: ["Checkpoint density reduced 30%", "Army visible but not engaging", "RAB returned to barracks in some areas", "Night patrols continuing"]
      },
      economic: {
        status: "RECOVERING",
        trend: "IMPROVING",
        confidence: 0.68,
        summary: "Businesses reopening; factory production resuming; banking returning to normal hours; some shipment backlogs clearing.",
        indicators: ["Stock exchange resumed trading", "Factory output at 70% of normal", "Taka stabilized at 115/USD", "Port operations normalizing"]
      },
      social: {
        status: "WATCHFUL",
        trend: "STABLE",
        confidence: 0.60,
        summary: "Universities partially reopened; labor returned to work; religious messaging emphasizing peace; underlying grievances unresolved.",
        indicators: ["Limited campus activities resumed", "Most workers returned", "Friday prayers focused on unity", "Social media sentiment mixed"]
      },
      information: {
        status: "PARTIALLY RESTORED",
        trend: "IMPROVING",
        confidence: 0.72,
        summary: "Internet speeds improving; social media access restored; media operating with some restrictions; information environment remains contested.",
        indicators: ["4G at 60% normal speed", "Facebook/WhatsApp functional", "Press access expanded slightly", "Misinformation campaigns active"]
      },
      infrastructure: {
        status: "RECOVERING",
        trend: "IMPROVING",
        confidence: 0.75,
        summary: "Transportation normalizing; healthcare managing remaining casualties; utilities stable; some infrastructure damage from protests being assessed.",
        indicators: ["Major roads open", "Hospital census declining", "Full transit service resuming", "Damage assessment underway"]
      }
    }
  ],
  ascopeProfiles: [
    {
      timeWindow: "focused",
      areas: {
        description: "Urban megacity with distinct political, commercial, and residential zones; key terrain concentrated in central districts",
        keyTerrain: ["Secretariat complex", "Shahbag intersection", "Motijheel business district", "Gulshan diplomatic zone", "University campuses"],
        significance: "HIGH"
      },
      structures: {
        description: "Mix of colonial-era government buildings, modern high-rises, dense informal settlements; critical infrastructure nodes identified",
        criticalFacilities: ["Dhaka Medical College Hospital", "Kamalapur Railway Station", "Hazrat Shahjalal Airport", "National Parliament", "Central Bank"],
        significance: "HIGH"
      },
      capabilities: {
        description: "Major manufacturing base (garments); financial services hub; limited medical surge capacity; robust telecommunications backbone",
        available: ["Hospital beds: 25,000 city-wide", "Police: 35,000 officers", "Fire stations: 12", "Ambulances: 200+", "Mobile network: 95% coverage"],
        significance: "MEDIUM"
      },
      organizations: {
        description: "Complex web of political parties, student groups, labor unions, religious institutions, NGOs, and business associations",
        keyActors: ["Awami League (ruling)", "BNP (opposition)", "Chhatra League (students)", "Jamaat-e-Islami (religious)", "BGMEA (garment industry)", "Religious affairs ministry"],
        significance: "HIGH"
      },
      people: {
        description: "22M+ metro population; young demographic (median age 27); high mobile penetration; significant urban poor in informal settlements",
        demographics: ["60% under 30 years", "Literacy: 75%", "Mobile penetration: 90%", "Urban poor: 35% in slums", "Religious: 90% Muslim, 9% Hindu"],
        significance: "HIGH"
      },
      events: {
        description: "Political calendar dominated by crisis response; religious observances continuing; economic events disrupted",
        scheduled: ["Opposition march Jan 20", "Dialogue committee meeting Jan 18", "Friday prayers (weekly)", "Factory reopening schedule", "University exam postponements"],
        significance: "HIGH"
      }
    }
  ],
  infrastructureStatus: [
    {
      timeWindow: "baseline",
      healthcare: { status: "OPERATIONAL", capacity: 65, notes: "Normal operations; routine patient loads" },
      transportation: { status: "OPERATIONAL", accessibility: 85, notes: "Typical Dhaka congestion; all routes functional" },
      utilities: { status: "OPERATIONAL", coverage: 92, notes: "Power stable; minimal load shedding" },
      communications: { status: "OPERATIONAL", reliability: 95, notes: "Full network coverage; normal speeds" }
    },
    {
      timeWindow: "focused",
      healthcare: { status: "DEGRADED", capacity: 90, notes: "Surge from protest injuries; elective procedures postponed; blood supply adequate" },
      transportation: { status: "DISRUPTED", accessibility: 40, notes: "Major routes blocked; checkpoints causing delays; airport access maintained" },
      utilities: { status: "OPERATIONAL", coverage: 88, notes: "Priority supply to critical facilities; some planned maintenance deferred" },
      communications: { status: "DISRUPTED", reliability: 35, notes: "Government-imposed throttling; social media intermittent; landlines functional" }
    },
    {
      timeWindow: "recent",
      healthcare: { status: "DEGRADED", capacity: 78, notes: "Managing backlog; returning to elective procedures; some staff fatigue" },
      transportation: { status: "DEGRADED", accessibility: 70, notes: "Most routes open; some checkpoints remain; public transit at 80%" },
      utilities: { status: "OPERATIONAL", coverage: 90, notes: "Normal operations; scheduled maintenance resuming in Mirpur" },
      communications: { status: "DEGRADED", reliability: 65, notes: "Speeds improving but not fully restored; monitoring for new restrictions" }
    }
  ],
  riskIndicators: [
    {
      id: "ri-001",
      category: "Political Violence",
      indicator: "Opposition mobilization capacity",
      currentState: "High - March planned for Jan 20 with significant turnout expected",
      threshold: "If turnout exceeds 50,000, escalation likely",
      trend: "INCREASING",
      confidence: 0.72,
      timeWindow: "recent",
      monitoringPriority: "CRITICAL"
    },
    {
      id: "ri-002",
      category: "Civil Unrest",
      indicator: "Student organization coordination",
      currentState: "Medium - Campus activities resumed but organizing continues",
      threshold: "Coordinated walkout announcements would signal escalation",
      trend: "STABLE",
      confidence: 0.65,
      timeWindow: "recent",
      monitoringPriority: "HIGH"
    },
    {
      id: "ri-003",
      category: "Economic Disruption",
      indicator: "Garment sector labor stability",
      currentState: "Recovering - 70% production; some grievances unresolved",
      threshold: "Renewed strikes would compound economic pressure",
      trend: "STABLE",
      confidence: 0.68,
      timeWindow: "recent",
      monitoringPriority: "MEDIUM"
    },
    {
      id: "ri-004",
      category: "Security",
      indicator: "IED/explosive incidents",
      currentState: "Elevated - One incident Jan 8; investigation ongoing",
      threshold: "Additional incidents would indicate organized campaign",
      trend: "STABLE",
      confidence: 0.55,
      timeWindow: "recent",
      monitoringPriority: "HIGH"
    },
    {
      id: "ri-005",
      category: "Information Control",
      indicator: "Communications restrictions",
      currentState: "Partial - Internet at 65% speed; social media functional",
      threshold: "Full shutdown would precede major security operation",
      trend: "DECREASING",
      confidence: 0.75,
      timeWindow: "recent",
      monitoringPriority: "MEDIUM"
    },
    {
      id: "ri-006",
      category: "Humanitarian",
      indicator: "Healthcare system capacity",
      currentState: "Strained - At 78% capacity; staff fatigue reported",
      threshold: "If new casualties from protests, could exceed surge capacity",
      trend: "STABLE",
      confidence: 0.70,
      timeWindow: "recent",
      monitoringPriority: "MEDIUM"
    }
  ],
  watchItems: [
    "Opposition 'National Unity March' scheduled Jan 20 - primary near-term flashpoint",
    "Government-opposition dialogue committee meeting Jan 18 - outcome may defuse or escalate",
    "Student organization coordination for potential campus actions",
    "Garment sector labor sentiment - wage grievances remain unresolved",
    "Religious leader messaging - key influence on street sentiment",
    "Security force posture changes - any redeployments to city center"
  ],
  dataLimitations: [
    "Crowd size estimates have +/- 30% uncertainty due to aerial imagery gaps",
    "Social media sentiment analysis affected by VPN usage making geolocation unreliable",
    "Government casualty figures not independently verified",
    "Industrial zone reporting dependent on industry sources with potential bias",
    "Night-time activity less well-documented due to curfew and reduced OSINT",
    "Opposition internal deliberations not directly observable"
  ]
};

export const AVAILABLE_SCENARIOS: Scenario[] = [
  DHAKA_POLITICAL_CRISIS
];

export function getScenarioById(id: string): Scenario | undefined {
  return AVAILABLE_SCENARIOS.find(s => s.id === id);
}
