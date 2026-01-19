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
import { useScenario } from "@/context/scenario-context";

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

interface FactorData {
  description: string;
  items: string[];
  significance: "LOW" | "MEDIUM" | "HIGH";
}

function FactorCard({ 
  factorKey, 
  data, 
  isExpanded, 
  onToggle 
}: { 
  factorKey: keyof typeof factorConfig;
  data: FactorData;
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
        significanceBgColors[data.significance]
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
            className={cn("text-xs px-1.5 py-0 h-5 border", significanceColors[data.significance])}
          >
            {data.significance}
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
            <p className="text-sm text-foreground leading-relaxed">{data.description}</p>
          </div>
          
          {data.items.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Elements</span>
              <ul className="space-y-1">
                {data.items.map((element, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ASCOPEBriefing({ aoi, className }: ASCOPEBriefingProps) {
  const { getASCOPEForWindow, getActiveTimeWindowLabel, currentScenario } = useScenario();
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set(["structures", "organizations"]));
  
  const ascopeProfile = getASCOPEForWindow();
  
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
  
  if (!ascopeProfile) {
    return (
      <Card className={cn("border-0 shadow-none bg-transparent", className)}>
        <CardContent className="text-center py-8 text-muted-foreground">
          No ASCOPE data available for this time window
        </CardContent>
      </Card>
    );
  }
  
  const factors: [keyof typeof factorConfig, FactorData][] = [
    ["areas", { 
      description: ascopeProfile.areas.description, 
      items: ascopeProfile.areas.keyTerrain, 
      significance: ascopeProfile.areas.significance 
    }],
    ["structures", { 
      description: ascopeProfile.structures.description, 
      items: ascopeProfile.structures.criticalFacilities, 
      significance: ascopeProfile.structures.significance 
    }],
    ["capabilities", { 
      description: ascopeProfile.capabilities.description, 
      items: ascopeProfile.capabilities.available, 
      significance: ascopeProfile.capabilities.significance 
    }],
    ["organizations", { 
      description: ascopeProfile.organizations.description, 
      items: ascopeProfile.organizations.keyActors, 
      significance: ascopeProfile.organizations.significance 
    }],
    ["people", { 
      description: ascopeProfile.people.description, 
      items: ascopeProfile.people.demographics, 
      significance: ascopeProfile.people.significance 
    }],
    ["events", { 
      description: ascopeProfile.events.description, 
      items: ascopeProfile.events.scheduled, 
      significance: ascopeProfile.events.significance 
    }],
  ];
  
  return (
    <Card className={cn("border-0 shadow-none bg-transparent", className)}>
      <CardHeader className="px-0 pt-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">ASCOPE Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getActiveTimeWindowLabel()} Window - {currentScenario.location.name}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {aoi.name || currentScenario.location.name}
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
