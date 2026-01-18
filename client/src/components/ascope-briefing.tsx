import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown,
  ChevronRight,
  MapPinned,
  Landmark,
  Wrench,
  Building2,
  Users,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AOI {
  name?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

interface ASCOPEBriefingProps {
  aoi: AOI;
  className?: string;
}

interface ASCOPEFactor {
  assessment: string;
  significanceLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  keyElements: string[];
  operationalImpact: string;
}

interface ASCOPEData {
  areas: ASCOPEFactor;
  structures: ASCOPEFactor;
  capabilities: ASCOPEFactor;
  organizations: ASCOPEFactor;
  people: ASCOPEFactor;
  events: ASCOPEFactor;
}

const factorConfig = {
  areas: { icon: MapPinned, label: "Areas", abbrev: "A", description: "Key terrain, boundaries, sectors" },
  structures: { icon: Landmark, label: "Structures", abbrev: "S", description: "Buildings, infrastructure, facilities" },
  capabilities: { icon: Wrench, label: "Capabilities", abbrev: "C", description: "Assets, resources, technical capacity" },
  organizations: { icon: Building2, label: "Organizations", abbrev: "O", description: "Groups, institutions, networks" },
  people: { icon: Users, label: "People", abbrev: "P", description: "Key leaders, populations, influencers" },
  events: { icon: Calendar, label: "Events", abbrev: "E", description: "Activities, incidents, patterns" },
};

const significanceColors = {
  LOW: "bg-green-900/50 text-green-300 border-green-700",
  MEDIUM: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  HIGH: "bg-orange-900/50 text-orange-300 border-orange-700",
  CRITICAL: "bg-red-900/50 text-red-300 border-red-700",
};

const significanceBgColors = {
  LOW: "border-l-green-600",
  MEDIUM: "border-l-yellow-600",
  HIGH: "border-l-orange-600",
  CRITICAL: "border-l-red-600",
};

function FactorCard({ 
  factorKey, 
  data, 
  isExpanded, 
  onToggle 
}: { 
  factorKey: keyof typeof factorConfig;
  data: ASCOPEFactor;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = factorConfig[factorKey];
  const Icon = config.icon;
  
  return (
    <div 
      className={cn(
        "bg-card border rounded-md overflow-hidden transition-all duration-150",
        "border-l-4",
        significanceBgColors[data.significanceLevel]
      )}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover-elevate"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{config.label}</span>
          <Badge 
            variant="outline" 
            className={cn("text-xs px-1.5 py-0 h-5 border", significanceColors[data.significanceLevel])}
          >
            {data.significanceLevel}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t bg-muted/20">
          <div className="pt-3">
            <p className="text-sm text-foreground leading-relaxed">{data.assessment}</p>
          </div>
          
          {data.keyElements.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Elements</span>
              <ul className="space-y-1">
                {data.keyElements.map((element, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="pt-2 border-t border-dashed">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Operational Impact</span>
                <p className="text-sm text-muted-foreground mt-0.5">{data.operationalImpact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateASCOPEData(aoi: AOI): ASCOPEData {
  const regionName = aoi.name || "Dhaka";
  
  return {
    areas: {
      assessment: `${regionName} encompasses diverse terrain including urban centers, agricultural zones, and riverine areas. Key terrain features include major road intersections, port facilities, and government complexes that influence freedom of movement and control.`,
      significanceLevel: "MEDIUM",
      keyElements: [
        "Urban core with high-density residential and commercial zones",
        "Major river crossings and bridge infrastructure",
        "Industrial districts with strategic manufacturing capability",
        "Suburban expansion areas with ongoing development"
      ],
      operationalImpact: "Terrain channelizes movement through predictable corridors; urban density complicates maneuver but provides cover"
    },
    structures: {
      assessment: `Critical infrastructure in ${regionName} includes government buildings, hospitals, transportation hubs, and telecommunications facilities. Many structures date from post-independence era with varying resilience to disruption.`,
      significanceLevel: "HIGH",
      keyElements: [
        "National Parliament complex and ministerial buildings",
        "Major hospitals: Dhaka Medical, BIRDEM, Square Hospital",
        "Shahjalal International Airport infrastructure",
        "Power generation and distribution substations",
        "Telecommunications towers and data centers"
      ],
      operationalImpact: "Concentrated critical infrastructure creates single points of failure; protection requirements high"
    },
    capabilities: {
      assessment: `${regionName} possesses significant industrial, medical, and communications capabilities. Manufacturing sector provides domestic production capacity while port facilities enable regional trade.`,
      significanceLevel: "MEDIUM",
      keyElements: [
        "Textile and garment manufacturing facilities",
        "Pharmaceutical production capacity",
        "Port and logistics handling capability",
        "Medical treatment facilities with trauma capacity",
        "Communications and broadcast infrastructure"
      ],
      operationalImpact: "Local capabilities can support extended operations; dependency on external energy and raw materials"
    },
    organizations: {
      assessment: `Diverse organizational landscape includes government agencies, political parties, NGOs, religious institutions, and business associations. Power dynamics shift between formal and informal networks.`,
      significanceLevel: "HIGH",
      keyElements: [
        "Government ministries and law enforcement agencies",
        "Major political parties: Awami League, BNP, Jatiya Party",
        "International NGOs: BRAC, Grameen, CARE",
        "Religious institutions and Islamic councils",
        "Business chambers and trade associations",
        "Civil society organizations and student groups"
      ],
      operationalImpact: "Multiple competing power centers require careful stakeholder engagement; informal networks often more influential than formal structures"
    },
    people: {
      assessment: `Population of approximately ${aoi.radiusKm ? Math.round(aoi.radiusKm * 100000) : 20000000} in the greater ${regionName} area. Young demographic with high literacy rates and increasing connectivity. Urban migration continues to stress services.`,
      significanceLevel: "MEDIUM",
      keyElements: [
        "Young demographic: 60% under age 30",
        "High mobile phone penetration (>90%)",
        "Growing middle class with increasing expectations",
        "Religious and ethnic minority communities",
        "Key influencers in media, academia, and business"
      ],
      operationalImpact: "Population density enables rapid information spread; youth population susceptible to mobilization; middle class expectations create stability pressures"
    },
    events: {
      assessment: `${regionName} experiences regular political rallies, religious observances, and labor actions. Election cycles and national holidays create predictable tension periods. Monsoon season impacts infrastructure annually.`,
      significanceLevel: "HIGH",
      keyElements: [
        "Weekly Friday prayers at major mosques",
        "Political rallies and hartals (strikes)",
        "National holidays: Independence Day (Mar 26), Victory Day (Dec 16)",
        "Monsoon flooding (June-September)",
        "Garment worker protests and labor actions",
        "Academic calendar and student demonstrations"
      ],
      operationalImpact: "Event calendar creates predictable windows of heightened activity; monsoon season degrades infrastructure; political calendar drives threat cycles"
    }
  };
}

export function ASCOPEBriefing({ aoi, className }: ASCOPEBriefingProps) {
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set(["structures"]));
  
  const data = generateASCOPEData(aoi);
  
  const toggleFactor = (factor: string) => {
    setExpandedFactors(prev => {
      const next = new Set(prev);
      if (next.has(factor)) {
        next.delete(factor);
      } else {
        next.add(factor);
      }
      return next;
    });
  };
  
  const factors = Object.entries(data) as [keyof ASCOPEData, ASCOPEFactor][];
  
  return (
    <Card className={cn("border-0 shadow-none bg-transparent", className)}>
      <CardHeader className="px-0 pt-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">ASCOPE Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Areas, Structures, Capabilities, Organizations, People, Events
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {aoi.name || "Current AOI"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-0 space-y-2">
        {factors.map(([key, factorData]) => (
          <FactorCard
            key={key}
            factorKey={key}
            data={factorData}
            isExpanded={expandedFactors.has(key)}
            onToggle={() => toggleFactor(key)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
