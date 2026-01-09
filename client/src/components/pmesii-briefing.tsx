import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  DollarSign,
  Users2,
  Radio,
  Building,
  FileText,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemStatusIndicator } from "./system-status-banner";

interface AOI {
  name?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

interface PMESIIBriefingProps {
  aoi: AOI;
  className?: string;
  odinCountry?: string;
}

interface PMESIIFactor {
  assessment: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  considerations: string[];
}

interface PMESIIData {
  political: PMESIIFactor;
  military: PMESIIFactor;
  economic: PMESIIFactor;
  social: PMESIIFactor;
  information: PMESIIFactor;
  infrastructure: PMESIIFactor;
}

const factorConfig = {
  political: { icon: Users, label: "Political", abbrev: "P" },
  military: { icon: Shield, label: "Military", abbrev: "M" },
  economic: { icon: DollarSign, label: "Economic", abbrev: "E" },
  social: { icon: Users2, label: "Social", abbrev: "S" },
  information: { icon: Radio, label: "Information", abbrev: "I" },
  infrastructure: { icon: Building, label: "Infrastructure", abbrev: "I" },
};

const riskColors = {
  LOW: "bg-green-900/50 text-green-300 border-green-700",
  MEDIUM: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  HIGH: "bg-orange-900/50 text-orange-300 border-orange-700",
  CRITICAL: "bg-red-900/50 text-red-300 border-red-700",
};

const riskBgColors = {
  LOW: "border-l-green-600",
  MEDIUM: "border-l-yellow-600",
  HIGH: "border-l-orange-600",
  CRITICAL: "border-l-red-600",
};

function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const percentage = Math.round(value * 100);
  
  const getColor = () => {
    if (percentage >= 70) return "bg-green-600";
    if (percentage >= 50) return "bg-yellow-600";
    return "bg-orange-600";
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-300", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-neutral-400 font-mono w-8 text-right">{percentage}%</span>
    </div>
  );
}

function FactorCard({ 
  factorKey, 
  data, 
  isExpanded, 
  onToggle 
}: { 
  factorKey: keyof typeof factorConfig;
  data: PMESIIFactor;
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
        riskBgColors[data.riskLevel]
      )}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover-elevate"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{config.label}</span>
          <Badge 
            variant="outline" 
            className={cn("text-xs px-1.5 py-0 h-5 border", riskColors[data.riskLevel])}
          >
            {data.riskLevel}
          </Badge>
        </div>
        
        <ConfidenceBar value={data.confidence} className="w-24 hidden sm:flex" />
        
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-neutral-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-neutral-500 flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-neutral-800">
          <div className="pt-3">
            <p className="text-sm text-neutral-300 leading-relaxed">
              {data.assessment}
            </p>
          </div>
          
          {data.considerations.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Key Considerations
              </h5>
              <ul className="space-y-1">
                {data.considerations.map((item, i) => (
                  <li key={i} className="text-xs text-neutral-400 flex items-start gap-2">
                    <span className="text-neutral-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Confidence: {Math.round(data.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PMESIIBriefing({ aoi, className, odinCountry }: PMESIIBriefingProps) {
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set(["political"]));
  
  // Derive country from odinCountry prop, or fall back to AOI name (which often contains country)
  const effectiveCountry = odinCountry || aoi.name || undefined;
  
  const { data: odinData, isLoading, isFetching, dataUpdatedAt } = useQuery<{
    success: boolean;
    country: string;
    data?: Record<string, string>;
    partial?: boolean;
  }>({
    queryKey: [`/api/odin/country/${effectiveCountry}`],
    enabled: !!effectiveCountry,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
  
  // Track previous data for stateful loading
  const [previousData, setPreviousData] = useState<typeof odinData | null>(null);
  if (odinData && odinData !== previousData) {
    setPreviousData(odinData);
  }

  // Parse ODIN text into structured factor data
  const parseOdinFactor = (text: string): PMESIIFactor => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10);
    const assessment = lines.slice(0, 2).join(' ').substring(0, 300);
    const considerations = lines.slice(2, 5).map(l => l.substring(0, 150));
    
    // Estimate risk based on keywords
    const lowerText = text.toLowerCase();
    let riskLevel: PMESIIFactor["riskLevel"] = "MEDIUM";
    if (lowerText.includes("critical") || lowerText.includes("severe") || lowerText.includes("dangerous")) {
      riskLevel = "CRITICAL";
    } else if (lowerText.includes("high risk") || lowerText.includes("significant threat")) {
      riskLevel = "HIGH";
    } else if (lowerText.includes("stable") || lowerText.includes("secure") || lowerText.includes("low risk")) {
      riskLevel = "LOW";
    }
    
    // Confidence based on content length
    const confidence = Math.min(0.85, 0.5 + (lines.length / 15));
    
    return { assessment: assessment || "Assessment data available.", riskLevel, confidence, considerations };
  };

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

  const expandAll = () => {
    setExpandedFactors(new Set(Object.keys(factorConfig)));
  };

  const collapseAll = () => {
    setExpandedFactors(new Set());
  };

  const mockData: PMESIIData = {
    political: {
      assessment: "Bangladesh maintains stable democratic governance. The ruling party holds a strong parliamentary majority. Opposition activity is limited but present in urban centers.",
      riskLevel: "MEDIUM",
      confidence: 0.72,
      considerations: [
        "Political demonstrations may disrupt operations in central Dhaka",
        "Local government cooperation with security forces is strong",
        "Electoral cycle may increase tensions in coming months"
      ]
    },
    military: {
      assessment: "Bangladesh Armed Forces maintain professional standards with strong counter-terrorism capabilities. Rapid Action Battalion effective in urban security operations.",
      riskLevel: "LOW",
      confidence: 0.78,
      considerations: [
        "Professional officer corps with international training",
        "Strong coordination between military and civilian authorities",
        "Border security operations ongoing"
      ]
    },
    economic: {
      assessment: "Strong economic growth averaging 6-7% annually. Major textile manufacturing hub with expanding infrastructure investment.",
      riskLevel: "LOW",
      confidence: 0.65,
      considerations: [
        "GDP growth supports stability",
        "Infrastructure development ongoing in major cities",
        "Foreign investment increasing in technology sector"
      ]
    },
    social: {
      assessment: "High population density presents operational considerations. NGO presence extensive. Education levels improving across regions.",
      riskLevel: "MEDIUM",
      confidence: 0.68,
      considerations: [
        "Dense urban areas require careful operational planning",
        "Healthcare infrastructure varies by region",
        "Youth population significant demographic factor"
      ]
    },
    information: {
      assessment: "Mobile penetration high with 4G availability in urban centers. Social media widely used for communication and news. State media maintains presence.",
      riskLevel: "MEDIUM",
      confidence: 0.71,
      considerations: [
        "Social media monitoring active",
        "Internet service generally reliable in cities",
        "Traditional media maintains influence"
      ]
    },
    infrastructure: {
      assessment: "Major infrastructure investment ongoing. Power grid improvements in progress. Transportation networks expanding but congestion remains issue.",
      riskLevel: "MEDIUM",
      confidence: 0.67,
      considerations: [
        "Road network improvements underway",
        "Port facilities modernizing",
        "Urban traffic congestion impacts movement"
      ]
    }
  };

  const getOverallRisk = (data: PMESIIData) => {
    const levels = Object.values(data).map(f => f.riskLevel);
    if (levels.includes("CRITICAL")) return "CRITICAL";
    if (levels.filter(l => l === "HIGH").length >= 2) return "HIGH";
    if (levels.filter(l => l === "HIGH" || l === "MEDIUM").length >= 3) return "MEDIUM";
    return "LOW";
  };

  const getAverageConfidence = (data: PMESIIData) => {
    const values = Object.values(data).map(f => f.confidence);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Use ODIN data when available, otherwise fall back to mock
  const displayData: PMESIIData = (() => {
    if (effectiveCountry && odinData?.success && odinData.data) {
      const odin = odinData.data;
      return {
        political: odin.political ? parseOdinFactor(odin.political) : mockData.political,
        military: odin.military ? parseOdinFactor(odin.military) : mockData.military,
        economic: odin.economic ? parseOdinFactor(odin.economic) : mockData.economic,
        social: odin.social ? parseOdinFactor(odin.social) : mockData.social,
        information: odin.information ? parseOdinFactor(odin.information) : mockData.information,
        infrastructure: odin.infrastructure ? parseOdinFactor(odin.infrastructure) : mockData.infrastructure,
      };
    }
    return mockData;
  })();
  
  const isOdinMode = !!effectiveCountry && odinData?.success;
  const overallRisk = getOverallRisk(displayData);
  const avgConfidence = getAverageConfidence(displayData);

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-card/95 backdrop-blur border-neutral-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-neutral-400" />
              <div>
                <h3 className="font-semibold text-base">PMESII Assessment</h3>
                <p className="text-xs text-neutral-500">
                  {aoi.name || `${aoi.lat.toFixed(2)}, ${aoi.lng.toFixed(2)}`}
                  {effectiveCountry && effectiveCountry !== aoi.name && ` • ${effectiveCountry}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <SystemStatusIndicator className="hidden sm:flex" />
              <Badge 
                variant="outline" 
                className={cn("text-xs border", riskColors[overallRisk])}
              >
                {overallRisk} RISK
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span>Overall Confidence: {Math.round(avgConfidence * 100)}%</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">6 Factors Analyzed</span>
              {isOdinMode && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-green-600 dark:text-green-400">ODIN Live</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={expandAll}
                className="hover:text-neutral-300 transition-colors"
              >
                Expand All
              </button>
              <span>|</span>
              <button 
                onClick={collapseAll}
                className="hover:text-neutral-300 transition-colors"
              >
                Collapse
              </button>
            </div>
          </div>
          
          <div className={cn("space-y-2 relative", isFetching && "opacity-70 transition-opacity duration-150")}>
            {isFetching && (
              <div className="absolute inset-0 bg-background/30 flex items-center justify-center z-10 rounded">
                <div className="text-xs text-muted-foreground bg-background/95 px-3 py-1.5 rounded border">
                  Updating assessment...
                </div>
              </div>
            )}
            {(Object.keys(factorConfig) as Array<keyof typeof factorConfig>).map((key) => (
              <FactorCard
                key={key}
                factorKey={key}
                data={displayData[key]}
                isExpanded={expandedFactors.has(key)}
                onToggle={() => toggleFactor(key)}
              />
            ))}
          </div>
          
          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
            </span>
            {effectiveCountry && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {isOdinMode ? "ODIN Live Data" : "ODIN Training Data"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
