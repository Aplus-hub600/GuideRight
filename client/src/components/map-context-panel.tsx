import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronDown,
  ChevronUp,
  MapPin,
  Shield,
  FileText,
  AlertCircle,
  Clock,
  Database,
  Building2,
  Sparkles,
  ArrowRight,
  Languages
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MapLens } from "./map-lens-selector"
import type { InfrastructureNode } from "./map-infrastructure-layer"
import { TranslatableText } from "./translatable-text"

interface ContextSection {
  title: string
  content: string[]
  confidence?: number
  icon?: typeof MapPin
}

interface MapContextPanelProps {
  aoiName?: string
  activeLens: MapLens
  selectedNode?: InfrastructureNode | null
  onQuerySelect?: (query: string) => void
  className?: string
}

interface EvidenceItem {
  id: string
  originalText: string
  originalLanguage: string
  translatedText?: string
  source: string
  timestamp: string
}

const lensEvidence: Record<MapLens, EvidenceItem[]> = {
  infrastructure: [
    {
      id: "ev-1",
      originalText: "ঢাকা মেডিকেল কলেজ হাসপাতালে বিদ্যুৎ সংযোগ স্থাপনের কাজ সম্পন্ন হয়েছে।",
      originalLanguage: "bn",
      translatedText: "Electrical connection work at Dhaka Medical College Hospital has been completed.",
      source: "Prothom Alo",
      timestamp: "2025-01-09 08:42"
    },
    {
      id: "ev-2",
      originalText: "Construction of new water treatment facility in Mirpur sector 10 reached 78% completion according to WASA officials.",
      originalLanguage: "en",
      source: "Daily Star",
      timestamp: "2025-01-08 14:15"
    }
  ],
  "human-activity": [
    {
      id: "ev-3",
      originalText: "طلاب الجامعة يخططون لاحتجاج سلمي يوم الخميس",
      originalLanguage: "ar",
      translatedText: "University students planning peaceful protest on Thursday",
      source: "Social Media",
      timestamp: "2025-01-09 06:30"
    },
    {
      id: "ev-4",
      originalText: "শাহবাগ এলাকায় যানজট তীব্র, সাধারণ যাত্রীদের চরম দুর্ভোগ",
      originalLanguage: "bn",
      translatedText: "Severe traffic congestion in Shahbag area, extreme suffering for regular commuters",
      source: "BDNews24",
      timestamp: "2025-01-09 09:12"
    }
  ],
  "risk-stress": [
    {
      id: "ev-5",
      originalText: "Внимание: повышенный уровень угрозы в северных районах",
      originalLanguage: "ru",
      translatedText: "Attention: elevated threat level in northern districts",
      source: "Intel Report",
      timestamp: "2025-01-09 03:00"
    }
  ],
  logistics: [
    {
      id: "ev-6",
      originalText: "پل کی مرمت کے باعث راستہ بند",
      originalLanguage: "ur",
      translatedText: "Route closed due to bridge repair",
      source: "Local Report",
      timestamp: "2025-01-08 22:45"
    }
  ],
  intel: [
    {
      id: "ev-7",
      originalText: "Bangladesh Security Forces conduct joint operations in Chittagong Hill Tracts region.",
      originalLanguage: "en",
      source: "GDELT",
      timestamp: "2025-01-09 10:15"
    },
    {
      id: "ev-8",
      originalText: "গার্মেন্ট শ্রমিকদের ধর্মঘট গাজীপুর শিল্প এলাকায় তৃতীয় দিনে প্রবেশ করেছে",
      originalLanguage: "bn",
      translatedText: "Garment workers strike enters third day in Gazipur Industrial Zone",
      source: "GDELT/BDNews24",
      timestamp: "2025-01-09 08:30"
    }
  ]
}

const lensGuidedQuestions: Record<MapLens, string[]> = {
  infrastructure: [
    "Show healthcare access gaps",
    "Identify transport chokepoints",
    "Which wards are under-served?",
    "Map critical infrastructure dependencies"
  ],
  "human-activity": [
    "Types of public disorder observed",
    "Primary protest drivers",
    "Population movement patterns",
    "Comparison to adjacent districts"
  ],
  "risk-stress": [
    "Current threat assessment",
    "Historical incident patterns",
    "Escalation indicators",
    "Safe corridor identification"
  ],
  logistics: [
    "Optimal route analysis",
    "Supply line vulnerabilities",
    "Border crossing status",
    "Fuel and resupply points"
  ],
  intel: [
    "Recent security incidents",
    "Current protest activity",
    "Diplomatic developments",
    "Economic disruptions"
  ]
}

type LocationContextData = Record<MapLens, { summary: string; sections: ContextSection[] }>

const locationContextData: Record<string, LocationContextData> = {
  "Dhaka": {
    infrastructure: {
      summary: "The Dhaka metropolitan area exhibits a concentrated healthcare infrastructure in the central districts, with significant gaps in peripheral wards. Transport nodes are clustered around the historic core, creating potential chokepoints during high-activity periods.",
      sections: [
        {
          title: "Infrastructure Observations",
          icon: Building2,
          content: [
            "11 major healthcare facilities mapped within 20km radius",
            "Primary rail hub at Kamalapur serves as critical chokepoint",
            "Power infrastructure shows redundancy in central grid",
            "Water treatment capacity concentrated at Saidabad facility"
          ],
          confidence: 0.82
        },
        {
          title: "Coverage & Gaps",
          icon: AlertCircle,
          content: [
            "Eastern wards show sparse healthcare coverage",
            "Secondary transport links data is aging (6+ months)",
            "Utility infrastructure in northern expansion areas unverified",
            "Private healthcare facilities may be under-reported"
          ],
          confidence: 0.68
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "OpenStreetMap (verified: Dec 2025)",
            "Government health registry (partial)",
            "Satellite imagery analysis (Q4 2025)",
            "Field reports (limited availability)"
          ]
        }
      ]
    },
    "human-activity": {
      summary: "Activity patterns indicate elevated public gathering frequency in central Dhaka, with temporal clustering around market hours and prayer times. Recent data suggests increased civil activity in university districts.",
      sections: [
        {
          title: "Activity Patterns",
          icon: MapPin,
          content: [
            "Elevated activity in Shahbag area (university district)",
            "Regular market gatherings at Gulshan, Banani",
            "Prayer-time congregation patterns at major mosques",
            "Weekend activity shifts toward recreational areas"
          ],
          confidence: 0.71
        },
        {
          title: "Civil Activity Indicators",
          icon: AlertCircle,
          content: [
            "Low-level protest activity reported (3 events, 30 days)",
            "No significant violent incidents in observation period",
            "Political rally season approaching - monitor for escalation",
            "Labor disputes at garment district ongoing"
          ],
          confidence: 0.64
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Social media monitoring (real-time)",
            "News aggregation (24hr cycle)",
            "Partner agency reports (weekly)",
            "Satellite crowd detection (experimental)"
          ]
        }
      ]
    },
    "risk-stress": {
      summary: "Current threat assessment indicates moderate baseline risk with localized elevated concerns in specific districts. Infrastructure stress is primarily related to seasonal flooding patterns and transportation network capacity.",
      sections: [
        {
          title: "Threat Assessment",
          icon: Shield,
          content: [
            "Baseline security: MODERATE",
            "Localized elevation in Old Dhaka (petty crime)",
            "No active threat indicators from hostile actors",
            "Cyber risk elevated for financial sector"
          ],
          confidence: 0.76
        },
        {
          title: "Stress Indicators",
          icon: AlertCircle,
          content: [
            "Seasonal flood risk increasing (monsoon approach)",
            "Traffic congestion at critical chokepoints",
            "Healthcare system at 78% capacity (normal)",
            "Power grid stable, no anticipated outages"
          ],
          confidence: 0.79
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Security partner assessments",
            "Local authority reporting",
            "Historical incident database",
            "Environmental monitoring systems"
          ]
        }
      ]
    },
    logistics: {
      summary: "Primary logistics corridors remain operational with standard seasonal congestion. Airport and river port facilities maintain full operational status. Ground movement routes show predictable delay patterns during peak hours.",
      sections: [
        {
          title: "Route Status",
          icon: MapPin,
          content: [
            "Dhaka-Chittagong Highway: OPEN (normal congestion)",
            "Airport corridor: CLEAR (standard security)",
            "River crossings: OPERATIONAL (3/3 bridges)",
            "Rail network: ACTIVE (scheduled maintenance Wed)"
          ],
          confidence: 0.88
        },
        {
          title: "Supply & Resupply",
          icon: Building2,
          content: [
            "Fuel availability: ADEQUATE at major stations",
            "Medical supplies: CONSTRAINED (import delays)",
            "Food/water: STABLE distribution network",
            "Communications: Full cellular/internet coverage"
          ],
          confidence: 0.81
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Traffic monitoring systems",
            "Port authority status feeds",
            "Commercial logistics partners",
            "Ground sensor network"
          ]
        }
      ]
    },
    intel: {
      summary: "Real-time intelligence monitoring for Dhaka. GDELT-sourced open source intelligence covering security events, political developments, economic indicators, and social activity patterns.",
      sections: [
        {
          title: "Live Intel Summary",
          icon: AlertCircle,
          content: [
            "Active monitoring of regional events via GDELT",
            "Cross-referencing multiple open-source intelligence feeds",
            "Real-time correlation with tactical situation"
          ],
          confidence: 0.82
        },
        {
          title: "Recent Activity",
          icon: Clock,
          content: [
            "8 security-related events in past 7 days",
            "12 news articles covering regional developments",
            "Mixed sentiment across economic and political themes"
          ],
          confidence: 0.78
        }
      ]
    }
  },
  "Chittagong": {
    infrastructure: {
      summary: "Chittagong serves as Bangladesh's primary port city with concentrated maritime infrastructure. Industrial zones surround the port area with supporting logistics networks. Healthcare infrastructure is adequate but aging.",
      sections: [
        {
          title: "Infrastructure Observations",
          icon: Building2,
          content: [
            "Port of Chittagong handles 92% of national maritime trade",
            "6 major healthcare facilities in metropolitan area",
            "Industrial Export Processing Zone fully operational",
            "Rail connection to Dhaka corridor active"
          ],
          confidence: 0.85
        },
        {
          title: "Coverage & Gaps",
          icon: AlertCircle,
          content: [
            "Hill tract areas show limited infrastructure access",
            "Port congestion during peak shipping seasons",
            "Secondary road network quality varies significantly",
            "Emergency services coverage gaps in peripheral areas"
          ],
          confidence: 0.72
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Port Authority operational data",
            "Satellite imagery (current)",
            "Commercial shipping reports",
            "Government infrastructure registry"
          ]
        }
      ]
    },
    "human-activity": {
      summary: "Port and industrial activity dominates the local pattern. Labor union activity is historically significant. Commercial districts show regular trading patterns with seasonal fluctuations.",
      sections: [
        {
          title: "Activity Patterns",
          icon: MapPin,
          content: [
            "Port worker shift changes create traffic peaks",
            "Commercial activity concentrated in Agrabad district",
            "Regular fishing industry activity at harbor areas",
            "Religious gatherings at historic mosques"
          ],
          confidence: 0.74
        },
        {
          title: "Civil Activity Indicators",
          icon: AlertCircle,
          content: [
            "Port labor disputes: DORMANT (last incident 6 months)",
            "No active protests or demonstrations",
            "Industrial worker organizing activity monitored",
            "Refugee camp activity in Cox's Bazar corridor stable"
          ],
          confidence: 0.69
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Port operations monitoring",
            "Labor union communications",
            "Local news aggregation",
            "Partner agency field reports"
          ]
        }
      ]
    },
    "risk-stress": {
      summary: "Moderate risk profile with specific concerns around port security and industrial safety. Coastal flooding and cyclone exposure represent primary environmental stress factors.",
      sections: [
        {
          title: "Threat Assessment",
          icon: Shield,
          content: [
            "Baseline security: MODERATE",
            "Port security: ELEVATED awareness",
            "Industrial safety incidents: 2 minor (90 days)",
            "Maritime piracy risk: LOW in territorial waters"
          ],
          confidence: 0.78
        },
        {
          title: "Stress Indicators",
          icon: AlertCircle,
          content: [
            "Cyclone season preparedness: ACTIVE monitoring",
            "Coastal erosion affecting some infrastructure",
            "Port capacity utilization: 87% (near peak)",
            "Water salinity intrusion in coastal aquifers"
          ],
          confidence: 0.75
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Bangladesh Meteorological Department",
            "Port security assessments",
            "Industrial safety reports",
            "Environmental monitoring stations"
          ]
        }
      ]
    },
    logistics: {
      summary: "Critical logistics hub for national import/export. Port capacity near maximum with expansion projects underway. Road and rail connections to Dhaka corridor fully operational.",
      sections: [
        {
          title: "Route Status",
          icon: MapPin,
          content: [
            "Chittagong-Dhaka Highway: OPEN (heavy truck traffic)",
            "Port access roads: OPERATIONAL (congestion at gates)",
            "Airport: ACTIVE (limited international routes)",
            "Rail freight corridor: OPERATIONAL (backlog clearing)"
          ],
          confidence: 0.86
        },
        {
          title: "Supply & Resupply",
          icon: Building2,
          content: [
            "Fuel bunkering: AVAILABLE at port facilities",
            "Container handling: 48hr average turnaround",
            "Customs processing: Normal delays (3-5 days)",
            "Warehousing capacity: 75% utilized"
          ],
          confidence: 0.83
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Port Authority real-time data",
            "Customs processing reports",
            "Shipping line schedules",
            "Freight forwarder networks"
          ]
        }
      ]
    },
    intel: {
      summary: "Real-time intelligence monitoring for Chittagong. GDELT-sourced open source intelligence covering security events, political developments, economic indicators, and social activity patterns.",
      sections: [
        {
          title: "Live Intel Summary",
          icon: AlertCircle,
          content: [
            "Active monitoring of regional events via GDELT",
            "Cross-referencing multiple open-source intelligence feeds",
            "Real-time correlation with tactical situation"
          ],
          confidence: 0.82
        },
        {
          title: "Recent Activity",
          icon: Clock,
          content: [
            "8 security-related events in past 7 days",
            "12 news articles covering regional developments",
            "Mixed sentiment across economic and political themes"
          ],
          confidence: 0.78
        }
      ]
    }
  },
  "Sylhet": {
    infrastructure: {
      summary: "Sylhet Division features tea industry infrastructure and significant religious tourism sites. Healthcare coverage is moderate with concentration in urban center. Cross-border infrastructure with India is notable.",
      sections: [
        {
          title: "Infrastructure Observations",
          icon: Building2,
          content: [
            "4 major healthcare facilities in city proper",
            "Tea estate supporting infrastructure extensive",
            "Osmani International Airport operational",
            "Land ports at Tamabil and Sheola active"
          ],
          confidence: 0.73
        },
        {
          title: "Coverage & Gaps",
          icon: AlertCircle,
          content: [
            "Rural tea estate areas underserved",
            "Flood-prone lowland infrastructure vulnerable",
            "Border area monitoring limited",
            "Private healthcare predominates over public"
          ],
          confidence: 0.65
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Regional development authority data",
            "Tea Board infrastructure reports",
            "Border security observations",
            "Aviation authority records"
          ]
        }
      ]
    },
    "human-activity": {
      summary: "Religious pilgrimage traffic dominates activity patterns, particularly around Shah Jalal shrine. Tea estate labor patterns are seasonal. Cross-border movement with India is significant.",
      sections: [
        {
          title: "Activity Patterns",
          icon: MapPin,
          content: [
            "Pilgrimage activity at Hazrat Shah Jalal shrine (daily)",
            "Tea harvest season increases rural activity",
            "Cross-border travel peaks on Indian holidays",
            "Student population creates urban center activity"
          ],
          confidence: 0.68
        },
        {
          title: "Civil Activity Indicators",
          icon: AlertCircle,
          content: [
            "No significant protest activity",
            "Religious harmony generally maintained",
            "Tea worker labor disputes: INACTIVE",
            "Political activity lower than national average"
          ],
          confidence: 0.71
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Border crossing statistics",
            "Religious affairs monitoring",
            "Tea Board labor reports",
            "Local media aggregation"
          ]
        }
      ]
    },
    "risk-stress": {
      summary: "Lower baseline risk compared to major urban centers. Primary concerns relate to seasonal flooding and cross-border security. Religious site security requires ongoing attention.",
      sections: [
        {
          title: "Threat Assessment",
          icon: Shield,
          content: [
            "Baseline security: LOW-MODERATE",
            "Religious site security: ENHANCED",
            "Border area: Routine monitoring",
            "No active threat indicators"
          ],
          confidence: 0.74
        },
        {
          title: "Stress Indicators",
          icon: AlertCircle,
          content: [
            "Flash flood risk: HIGH (haor wetlands)",
            "Earthquake preparedness: MODERATE (seismic zone)",
            "Healthcare capacity: ADEQUATE",
            "Economic stress from remittance fluctuations"
          ],
          confidence: 0.72
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Disaster management authority",
            "Border Guard Bangladesh reports",
            "Seismic monitoring network",
            "Economic indicators"
          ]
        }
      ]
    },
    logistics: {
      summary: "Regional logistics hub with air connectivity and land border crossings. Road network connects to Dhaka corridor. Tea industry supply chains well-established.",
      sections: [
        {
          title: "Route Status",
          icon: MapPin,
          content: [
            "Sylhet-Dhaka Highway: OPEN (good condition)",
            "Tamabil Border: OPEN (normal traffic)",
            "Airport: OPERATIONAL (domestic + limited intl)",
            "Rail: ACTIVE (passenger service daily)"
          ],
          confidence: 0.81
        },
        {
          title: "Supply & Resupply",
          icon: Building2,
          content: [
            "Fuel availability: ADEQUATE",
            "Medical supplies: STANDARD",
            "Food supplies: STABLE (local production)",
            "Communications: GOOD coverage"
          ],
          confidence: 0.77
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Road transport authority",
            "Border crossing data",
            "Civil aviation authority",
            "Supply chain monitoring"
          ]
        }
      ]
    },
    intel: {
      summary: "Real-time intelligence monitoring for Sylhet. GDELT-sourced open source intelligence covering security events, political developments, economic indicators, and social activity patterns.",
      sections: [
        {
          title: "Live Intel Summary",
          icon: AlertCircle,
          content: [
            "Active monitoring of regional events via GDELT",
            "Cross-referencing multiple open-source intelligence feeds",
            "Real-time correlation with tactical situation"
          ],
          confidence: 0.82
        },
        {
          title: "Recent Activity",
          icon: Clock,
          content: [
            "8 security-related events in past 7 days",
            "12 news articles covering regional developments",
            "Mixed sentiment across economic and political themes"
          ],
          confidence: 0.78
        }
      ]
    }
  },
  "Cox's Bazar": {
    infrastructure: {
      summary: "Cox's Bazar combines tourism infrastructure with humanitarian response facilities due to Rohingya refugee presence. Healthcare infrastructure significantly expanded for humanitarian operations. Security presence elevated.",
      sections: [
        {
          title: "Infrastructure Observations",
          icon: Building2,
          content: [
            "Refugee camp infrastructure supports 900,000+ population",
            "Cox's Bazar International Airport operational",
            "Tourism infrastructure along 120km beach corridor",
            "Humanitarian logistics hub established"
          ],
          confidence: 0.87
        },
        {
          title: "Coverage & Gaps",
          icon: AlertCircle,
          content: [
            "Camp healthcare strained but functional",
            "Water/sanitation challenges in camps",
            "Local infrastructure competing with humanitarian needs",
            "Power grid capacity constraints"
          ],
          confidence: 0.79
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "UNHCR operational reports",
            "IOM infrastructure assessments",
            "Government camp management data",
            "Humanitarian coordination (ISCG)"
          ]
        }
      ]
    },
    "human-activity": {
      summary: "Dual population dynamics between local residents and refugee population. Humanitarian activities ongoing. Tourism sector recovering. Inter-community relations require monitoring.",
      sections: [
        {
          title: "Activity Patterns",
          icon: MapPin,
          content: [
            "Refugee camp population movement restricted",
            "Humanitarian distribution activities daily",
            "Tourism activity seasonal (winter peak)",
            "Fishing industry active along coast"
          ],
          confidence: 0.82
        },
        {
          title: "Civil Activity Indicators",
          icon: AlertCircle,
          content: [
            "Inter-community tensions: MONITORED",
            "Camp security incidents: OCCASIONAL (petty)",
            "Host community grievances: PRESENT",
            "Humanitarian access: MAINTAINED"
          ],
          confidence: 0.75
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "UNHCR protection monitoring",
            "Camp management reports",
            "Security incident tracking",
            "Community liaison feedback"
          ]
        }
      ]
    },
    "risk-stress": {
      summary: "Elevated risk environment due to humanitarian crisis complexity. Cyclone exposure is critical concern. Security situation requires active management. Resource competition between communities monitored.",
      sections: [
        {
          title: "Threat Assessment",
          icon: Shield,
          content: [
            "Baseline security: ELEVATED",
            "Camp security: ACTIVE monitoring",
            "Cross-border trafficking: CONCERN",
            "Violent extremism: LOW but monitored"
          ],
          confidence: 0.81
        },
        {
          title: "Stress Indicators",
          icon: AlertCircle,
          content: [
            "Cyclone exposure: CRITICAL (monsoon season)",
            "Environmental degradation from camps",
            "Healthcare capacity: STRAINED",
            "Food security: DEPENDENT on aid"
          ],
          confidence: 0.84
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Humanitarian coordination body",
            "Security sector reporting",
            "Environmental monitoring",
            "Food security assessments"
          ]
        }
      ]
    },
    logistics: {
      summary: "Humanitarian logistics infrastructure well-developed. Commercial logistics improving with airport expansion. Road network vulnerable to monsoon damage. Maritime access limited.",
      sections: [
        {
          title: "Route Status",
          icon: MapPin,
          content: [
            "Dhaka-Cox's Bazar Highway: OPEN (variable quality)",
            "Airport: EXPANDED (increased capacity)",
            "Camp access roads: OPERATIONAL (monsoon damage)",
            "Sea port: LIMITED (under development)"
          ],
          confidence: 0.79
        },
        {
          title: "Supply & Resupply",
          icon: Building2,
          content: [
            "Humanitarian supplies: PIPELINE active",
            "Fuel: ADEQUATE for operations",
            "Medical supplies: PRIORITIZED for camps",
            "Local markets: FUNCTIONAL but stressed"
          ],
          confidence: 0.82
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Logistics cluster coordination",
            "WFP supply chain data",
            "Airport authority reports",
            "Road transport monitoring"
          ]
        }
      ]
    },
    intel: {
      summary: "Real-time intelligence monitoring for Cox's Bazar. GDELT-sourced open source intelligence covering security events, political developments, economic indicators, and social activity patterns.",
      sections: [
        {
          title: "Live Intel Summary",
          icon: AlertCircle,
          content: [
            "Active monitoring of regional events via GDELT",
            "Cross-referencing multiple open-source intelligence feeds",
            "Real-time correlation with tactical situation"
          ],
          confidence: 0.82
        },
        {
          title: "Recent Activity",
          icon: Clock,
          content: [
            "8 security-related events in past 7 days",
            "12 news articles covering regional developments",
            "Mixed sentiment across economic and political themes"
          ],
          confidence: 0.78
        }
      ]
    }
  },
  "Khulna": {
    infrastructure: {
      summary: "Khulna serves as the gateway to the Sundarbans and southern Bangladesh. Industrial base includes jute and seafood processing. Infrastructure aging but functional with port facilities on Rupsha River.",
      sections: [
        {
          title: "Infrastructure Observations",
          icon: Building2,
          content: [
            "Mongla Port serves as secondary national port",
            "3 major healthcare facilities in city proper",
            "Industrial zone along Rupsha River corridor",
            "Rail connection to Dhaka operational"
          ],
          confidence: 0.74
        },
        {
          title: "Coverage & Gaps",
          icon: AlertCircle,
          content: [
            "Sundarbans buffer zone infrastructure limited",
            "Coastal areas vulnerable to cyclone damage",
            "Water salinity affecting municipal supply",
            "Healthcare coverage sparse in rural areas"
          ],
          confidence: 0.67
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Port authority data",
            "Regional development reports",
            "Environmental monitoring",
            "Government infrastructure registry"
          ]
        }
      ]
    },
    "human-activity": {
      summary: "Economic activity centered on port operations and processing industries. Sundarbans-related tourism and forestry activity significant. Labor patterns tied to seasonal fishing and agriculture.",
      sections: [
        {
          title: "Activity Patterns",
          icon: MapPin,
          content: [
            "Port worker activity peaks during shipping seasons",
            "Sundarbans tourism traffic seasonal",
            "Fishing industry activity along coastal areas",
            "Agricultural processing peaks post-harvest"
          ],
          confidence: 0.69
        },
        {
          title: "Civil Activity Indicators",
          icon: AlertCircle,
          content: [
            "Labor organizing: DORMANT",
            "Environmental activism regarding Sundarbans",
            "No significant protest activity",
            "Political activity consistent with regional norms"
          ],
          confidence: 0.66
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Port operations monitoring",
            "Forest department reports",
            "Local news aggregation",
            "Partner agency reports"
          ]
        }
      ]
    },
    "risk-stress": {
      summary: "Coastal vulnerability is primary concern with cyclone and storm surge exposure. Environmental stress from climate change affecting Sundarbans ecosystem. Industrial safety requires monitoring.",
      sections: [
        {
          title: "Threat Assessment",
          icon: Shield,
          content: [
            "Baseline security: LOW-MODERATE",
            "Cyclone exposure: HIGH (coastal location)",
            "Industrial safety: ADEQUATE",
            "Border area: Routine (Sundarbans buffer)"
          ],
          confidence: 0.73
        },
        {
          title: "Stress Indicators",
          icon: AlertCircle,
          content: [
            "Sea level rise affecting coastal communities",
            "Salinity intrusion expanding inland",
            "Tiger-human conflict in buffer zones",
            "Economic stress from declining shrimp industry"
          ],
          confidence: 0.71
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Disaster management authority",
            "Environmental monitoring stations",
            "Forest department wildlife reports",
            "Economic indicators"
          ]
        }
      ]
    },
    logistics: {
      summary: "Mongla Port provides secondary maritime access. Road and rail connections to Dhaka functional. River transport network extensive. Sundarbans access restricted to authorized routes.",
      sections: [
        {
          title: "Route Status",
          icon: MapPin,
          content: [
            "Khulna-Dhaka Highway: OPEN (standard condition)",
            "Mongla Port: OPERATIONAL (moderate traffic)",
            "Rail: ACTIVE (daily service to Dhaka)",
            "Sundarbans waterways: REGULATED access"
          ],
          confidence: 0.77
        },
        {
          title: "Supply & Resupply",
          icon: Building2,
          content: [
            "Fuel availability: ADEQUATE",
            "Seafood supply chain: ACTIVE",
            "Medical supplies: STANDARD",
            "Communications: GOOD coverage"
          ],
          confidence: 0.74
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Port authority data",
            "Road transport monitoring",
            "Rail operations center",
            "Forest department access logs"
          ]
        }
      ]
    },
    intel: {
      summary: "Real-time intelligence monitoring for Khulna. GDELT-sourced open source intelligence covering security events, political developments, economic indicators, and social activity patterns.",
      sections: [
        {
          title: "Live Intel Summary",
          icon: AlertCircle,
          content: [
            "Active monitoring of regional events via GDELT",
            "Cross-referencing multiple open-source intelligence feeds",
            "Real-time correlation with tactical situation"
          ],
          confidence: 0.82
        },
        {
          title: "Recent Activity",
          icon: Clock,
          content: [
            "8 security-related events in past 7 days",
            "12 news articles covering regional developments",
            "Mixed sentiment across economic and political themes"
          ],
          confidence: 0.78
        }
      ]
    }
  },
  "Rajshahi": {
    infrastructure: {
      summary: "Rajshahi is the major urban center in northwest Bangladesh along the Padma River. Educational infrastructure strong with university presence. Agriculture-focused economy with mango and silk production.",
      sections: [
        {
          title: "Infrastructure Observations",
          icon: Building2,
          content: [
            "Rajshahi Medical College among largest in region",
            "University of Rajshahi campus extensive",
            "Shah Makhdum Airport operational",
            "Padma barrage provides water control"
          ],
          confidence: 0.76
        },
        {
          title: "Coverage & Gaps",
          icon: AlertCircle,
          content: [
            "Rural healthcare coverage limited",
            "Cross-border infrastructure with India aging",
            "Drought-prone areas show infrastructure stress",
            "Industrial infrastructure underdeveloped"
          ],
          confidence: 0.68
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Regional development authority",
            "University infrastructure data",
            "Aviation authority records",
            "Water development board"
          ]
        }
      ]
    },
    "human-activity": {
      summary: "Educational and agricultural activities dominate the region. Seasonal patterns tied to mango harvest and academic calendar. Cross-border movement with India significant at land ports.",
      sections: [
        {
          title: "Activity Patterns",
          icon: MapPin,
          content: [
            "University activity creates youth population center",
            "Mango season (Apr-Jul) increases agricultural activity",
            "Cross-border trade peaks at Sonamasjid land port",
            "Silk industry activity in Rajshahi and surrounds"
          ],
          confidence: 0.72
        },
        {
          title: "Civil Activity Indicators",
          icon: AlertCircle,
          content: [
            "Student activism: PERIODIC (university politics)",
            "No significant violent incidents",
            "Agricultural worker organizing minimal",
            "Political activity follows regional patterns"
          ],
          confidence: 0.68
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "University administration reports",
            "Border crossing statistics",
            "Agricultural department data",
            "Local media monitoring"
          ]
        }
      ]
    },
    "risk-stress": {
      summary: "Lower baseline risk compared to major urban centers. Primary concerns relate to seasonal drought and cross-border security. Agricultural economic stress during poor harvest years.",
      sections: [
        {
          title: "Threat Assessment",
          icon: Shield,
          content: [
            "Baseline security: LOW",
            "Border area: Routine monitoring",
            "University security: STANDARD",
            "No active threat indicators"
          ],
          confidence: 0.77
        },
        {
          title: "Stress Indicators",
          icon: AlertCircle,
          content: [
            "Drought conditions: MODERATE (Barind tract)",
            "Groundwater depletion ongoing",
            "Agricultural economic dependence",
            "Healthcare access gaps in rural areas"
          ],
          confidence: 0.73
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Disaster management authority",
            "Water resources board",
            "Agricultural extension services",
            "Regional health data"
          ]
        }
      ]
    },
    logistics: {
      summary: "Regional hub for northwest Bangladesh. Road and rail connect to Dhaka. Air service limited but operational. Cross-border land ports active for India trade.",
      sections: [
        {
          title: "Route Status",
          icon: MapPin,
          content: [
            "Rajshahi-Dhaka Highway: OPEN (good condition)",
            "Airport: OPERATIONAL (limited schedule)",
            "Rail: ACTIVE (daily to Dhaka)",
            "Sonamasjid Border: OPEN (normal traffic)"
          ],
          confidence: 0.80
        },
        {
          title: "Supply & Resupply",
          icon: Building2,
          content: [
            "Fuel availability: ADEQUATE",
            "Agricultural supplies: SEASONAL patterns",
            "Medical supplies: STANDARD",
            "Communications: GOOD coverage"
          ],
          confidence: 0.76
        },
        {
          title: "Evidence Sources",
          icon: Database,
          content: [
            "Road transport authority",
            "Border crossing data",
            "Civil aviation authority",
            "Supply chain monitoring"
          ]
        }
      ]
    },
    intel: {
      summary: "Real-time intelligence monitoring for Rajshahi. GDELT-sourced open source intelligence covering security events, political developments, economic indicators, and social activity patterns.",
      sections: [
        {
          title: "Live Intel Summary",
          icon: AlertCircle,
          content: [
            "Active monitoring of regional events via GDELT",
            "Cross-referencing multiple open-source intelligence feeds",
            "Real-time correlation with tactical situation"
          ],
          confidence: 0.82
        },
        {
          title: "Recent Activity",
          icon: Clock,
          content: [
            "8 security-related events in past 7 days",
            "12 news articles covering regional developments",
            "Mixed sentiment across economic and political themes"
          ],
          confidence: 0.78
        }
      ]
    }
  }
}

function getContextDataForLocation(aoiName: string): LocationContextData {
  const normalizedName = aoiName.toLowerCase()
  if (normalizedName.includes("chittagong")) return locationContextData["Chittagong"]
  if (normalizedName.includes("sylhet")) return locationContextData["Sylhet"]
  if (normalizedName.includes("cox")) return locationContextData["Cox's Bazar"]
  if (normalizedName.includes("khulna")) return locationContextData["Khulna"]
  if (normalizedName.includes("rajshahi")) return locationContextData["Rajshahi"]
  return locationContextData["Dhaka"]
}

function ConfidenceIndicator({ value }: { value?: number }) {
  if (!value) return null
  
  const level = value >= 0.8 ? "high" : value >= 0.6 ? "medium" : "low"
  const colors = {
    high: "text-emerald-500",
    medium: "text-amber-500",
    low: "text-orange-500"
  }
  
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-3 rounded-sm",
              i <= Math.ceil(value * 5) ? colors[level].replace("text", "bg") : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className={cn("font-medium", colors[level])}>
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

function ContextSectionCard({ section, defaultExpanded = true }: { section: ContextSection; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const Icon = section.icon || FileText
  
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-1 hover-elevate"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{section.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {section.confidence && <ConfidenceIndicator value={section.confidence} />}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      
      {expanded && (
        <ul className="pb-3 pl-7 space-y-1.5">
          {section.content.map((item, idx) => (
            <li key={idx} className="text-xs text-foreground/80 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MapContextPanel({ 
  aoiName = "Dhaka", 
  activeLens,
  selectedNode,
  onQuerySelect,
  className 
}: MapContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const locationData = getContextDataForLocation(aoiName)
  const contextData = locationData[activeLens]
  const guidedQuestions = lensGuidedQuestions[activeLens]
  const evidence = lensEvidence[activeLens] || []
  
  return (
    <div className={cn("flex flex-col bg-background transition-all duration-300", isExpanded ? "h-full" : "h-auto", className)}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 border-b hover-elevate cursor-pointer w-full"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{aoiName}</span>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {!isExpanded && (
              <span className="text-xs text-muted-foreground">Click to expand</span>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>
      
      {!isExpanded && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b">
          <span className="line-clamp-2">{contextData.summary.substring(0, 100)}...</span>
        </div>
      )}
      
      {isExpanded && (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Context Summary
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {contextData.summary}
            </p>
          </div>
          
          <Separator />
          
          {selectedNode && (
            <>
              <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{selectedNode.name}</span>
                </div>
                {selectedNode.subCategory && (
                  <p className="text-xs text-foreground/70 capitalize mb-2">{selectedNode.subCategory}</p>
                )}
                {selectedNode.details && (
                  <p className="text-xs text-foreground/70 leading-relaxed">{selectedNode.details}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {selectedNode.confidence === "verified" ? "Verified" : selectedNode.confidence === "single-source" ? "Single Source" : "Inferred"}
                  </Badge>
                  {selectedNode.sources && (
                    <span className="text-xs text-foreground/70">{selectedNode.sources} sources</span>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}
          
          <div className="space-y-0">
            {contextData.sections.map((section, idx) => (
              <ContextSectionCard 
                key={section.title} 
                section={section} 
                defaultExpanded={idx === 0}
              />
            ))}
          </div>
          
          {evidence.length > 0 && (
            <>
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Source Evidence
                  </h3>
                </div>
                <div className="space-y-3">
                  {evidence.map((item) => (
                    <TranslatableText
                      key={item.id}
                      originalText={item.originalText}
                      originalLanguage={item.originalLanguage}
                      translatedText={item.translatedText}
                      source={item.source}
                      timestamp={item.timestamp}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Guided Questions
              </h3>
            </div>
            <div className="space-y-2">
              {guidedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => onQuerySelect?.(question)}
                  className="w-full flex items-center justify-between p-3 text-sm text-left rounded-md border bg-muted/30 hover-elevate transition-colors duration-100 group"
                >
                  <span className="text-foreground font-medium">{question}</span>
                  <ArrowRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
          </div>
        </ScrollArea>
      )}
      
      {isExpanded && (
        <div className="px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated: 2 min ago</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
