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
  ]
}

const lensContextData: Record<MapLens, { summary: string; sections: ContextSection[] }> = {
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
  }
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
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{section.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {section.confidence && <ConfidenceIndicator value={section.confidence} />}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      
      {expanded && (
        <ul className="pb-3 pl-7 space-y-1.5">
          {section.content.map((item, idx) => (
            <li key={idx} className="text-xs text-muted-foreground leading-relaxed">
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
  const contextData = lensContextData[activeLens]
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
                  <span className="text-sm font-medium">{selectedNode.name}</span>
                </div>
                {selectedNode.subCategory && (
                  <p className="text-xs text-muted-foreground capitalize mb-2">{selectedNode.subCategory}</p>
                )}
                {selectedNode.details && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedNode.details}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {selectedNode.confidence === "verified" ? "Verified" : selectedNode.confidence === "single-source" ? "Single Source" : "Inferred"}
                  </Badge>
                  {selectedNode.sources && (
                    <span className="text-xs text-muted-foreground">{selectedNode.sources} sources</span>
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
            <div className="space-y-1.5">
              {guidedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => onQuerySelect?.(question)}
                  className="w-full flex items-center justify-between p-2 text-xs text-left rounded-md border hover-elevate transition-colors duration-100"
                >
                  <span>{question}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
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
