import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User,
  MapPin,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Zap,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScenario } from "@/context/scenario-context";
import type { SIGACTEvent } from "@shared/scenarios";

interface AOI {
  name?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

interface SIGACTPanelProps {
  aoi: AOI;
  className?: string;
}

const categoryColors = {
  SECURITY: "bg-red-900/60 text-red-200 border-red-600 shadow-red-900/30 shadow-sm",
  POLITICAL: "bg-purple-900/60 text-purple-200 border-purple-600 shadow-purple-900/30 shadow-sm",
  ECONOMIC: "bg-blue-900/60 text-blue-200 border-blue-600 shadow-blue-900/30 shadow-sm",
  SOCIAL: "bg-green-900/60 text-green-200 border-green-600 shadow-green-900/30 shadow-sm",
  INFRASTRUCTURE: "bg-amber-900/60 text-amber-200 border-amber-600 shadow-amber-900/30 shadow-sm",
};

const severityColors = {
  LOW: "text-green-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-orange-400 animate-pulse",
  CRITICAL: "text-red-400 animate-pulse",
};

const severityBorderColors = {
  LOW: "border-l-green-500",
  MEDIUM: "border-l-yellow-500",
  HIGH: "border-l-orange-500",
  CRITICAL: "border-l-red-500",
};

const severityGlow = {
  LOW: "",
  MEDIUM: "",
  HIGH: "shadow-orange-500/20 shadow-md",
  CRITICAL: "shadow-red-500/30 shadow-lg",
};

function SIGACTCard({ 
  sigact, 
  isExpanded, 
  onToggle 
}: { 
  sigact: SIGACTEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(
      "bg-card border rounded-md overflow-hidden transition-all duration-200",
      "border-l-4",
      severityBorderColors[sigact.severity],
      severityGlow[sigact.severity],
      isExpanded && "ring-1 ring-primary/30"
    )}>
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center gap-2 text-left hover-elevate transition-colors duration-150"
      >
        <AlertTriangle className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-200", severityColors[sigact.severity])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{sigact.what}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">{sigact.when}</span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[10px] text-muted-foreground truncate">{sigact.where}</span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] px-1.5 py-0 h-4 border flex-shrink-0", categoryColors[sigact.category])}
        >
          {sigact.category}
        </Badge>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 space-y-3 border-t bg-gradient-to-b from-muted/30 to-transparent animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-2 rounded bg-muted/20">
              <User className="h-3.5 w-3.5 mt-0.5 text-blue-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">WHO</span>
                <p className="text-xs text-foreground mt-0.5">{sigact.who}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-2 rounded bg-muted/20">
              <Zap className="h-3.5 w-3.5 mt-0.5 text-yellow-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">WHAT</span>
                <p className="text-xs text-foreground mt-0.5">{sigact.what}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-2 rounded bg-muted/20">
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-green-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wide">WHERE</span>
                <p className="text-xs text-foreground mt-0.5">{sigact.where}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-2 rounded bg-muted/20">
              <Clock className="h-3.5 w-3.5 mt-0.5 text-purple-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">WHEN</span>
                <p className="text-xs text-foreground mt-0.5">{sigact.when}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded bg-orange-950/30 border border-orange-800/30">
            <MessageCircle className="h-3.5 w-3.5 mt-0.5 text-orange-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">WHY (Assessment)</span>
              <p className="text-xs text-foreground/90 mt-0.5">{sigact.why}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-dashed">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono bg-muted/50">
                {sigact.source} ({sigact.reliability})
              </Badge>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                    style={{ width: `${sigact.confidence * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-primary">{Math.round(sigact.confidence * 100)}%</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {new Date(sigact.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SIGACTPanel({ aoi, className }: SIGACTPanelProps) {
  const { getSIGACTsForWindow, getActiveTimeWindowLabel, currentScenario } = useScenario();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const sigacts = getSIGACTsForWindow();
  const filteredSIGACTs = categoryFilter 
    ? sigacts.filter(s => s.category === categoryFilter)
    : sigacts;
  
  const categories = ["SECURITY", "POLITICAL", "ECONOMIC", "SOCIAL", "INFRASTRUCTURE"];
  
  useEffect(() => {
    if (filteredSIGACTs.length > 0) {
      setExpandedId(filteredSIGACTs[0].id);
    } else {
      setExpandedId(null);
    }
  }, [categoryFilter, sigacts.length]);
  
  const categoryFilterColors: Record<string, string> = {
    SECURITY: "bg-red-900/50 text-red-200 border-red-600 hover:bg-red-800/50",
    POLITICAL: "bg-purple-900/50 text-purple-200 border-purple-600 hover:bg-purple-800/50",
    ECONOMIC: "bg-blue-900/50 text-blue-200 border-blue-600 hover:bg-blue-800/50",
    SOCIAL: "bg-green-900/50 text-green-200 border-green-600 hover:bg-green-800/50",
    INFRASTRUCTURE: "bg-amber-900/50 text-amber-200 border-amber-600 hover:bg-amber-800/50",
  };
  
  return (
    <Card className={cn("border-0 shadow-none bg-transparent", className)}>
      <CardHeader className="px-0 pt-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              SIGACT Log
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Significant Activities - {getActiveTimeWindowLabel()} Window
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/30">
              {filteredSIGACTs.length} events
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />LOW</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />MED</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />HIGH</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />CRIT</span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <button
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all duration-150",
              categoryFilter === null 
                ? "bg-primary/20 text-primary border-primary/40" 
                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
            )}
            onClick={() => setCategoryFilter(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-md border transition-all duration-150",
                categoryFilter === cat 
                  ? categoryFilterColors[cat]
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
              )}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat.slice(0, 4)}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-0 space-y-2">
        {filteredSIGACTs.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10">
            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm font-medium">No significant activities</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {getActiveTimeWindowLabel()} window - try selecting a different time period
            </p>
          </div>
        ) : (
          filteredSIGACTs.map(sigact => (
            <SIGACTCard
              key={sigact.id}
              sigact={sigact}
              isExpanded={expandedId === sigact.id}
              onToggle={() => setExpandedId(expandedId === sigact.id ? null : sigact.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
