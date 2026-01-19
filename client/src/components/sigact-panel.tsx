import { useState } from "react";
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
  SECURITY: "bg-red-900/50 text-red-300 border-red-700",
  POLITICAL: "bg-purple-900/50 text-purple-300 border-purple-700",
  ECONOMIC: "bg-blue-900/50 text-blue-300 border-blue-700",
  SOCIAL: "bg-green-900/50 text-green-300 border-green-700",
  INFRASTRUCTURE: "bg-amber-900/50 text-amber-300 border-amber-700",
};

const severityColors = {
  LOW: "text-green-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
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
    <div className="bg-card border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center gap-2 text-left hover-elevate"
      >
        <AlertTriangle className={cn("h-4 w-4 flex-shrink-0", severityColors[sigact.severity])} />
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
        <div className="px-3 pb-3 pt-2 space-y-2 border-t bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <User className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">WHO</span>
                <p className="text-xs text-foreground">{sigact.who}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Zap className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">WHAT</span>
                <p className="text-xs text-foreground">{sigact.what}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">WHERE</span>
                <p className="text-xs text-foreground">{sigact.where}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">WHEN</span>
                <p className="text-xs text-foreground">{sigact.when}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 pt-1 border-t border-dashed">
            <MessageCircle className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase">WHY (Assessment)</span>
              <p className="text-xs text-foreground/90">{sigact.why}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                {sigact.source} ({sigact.reliability})
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                Conf: {Math.round(sigact.confidence * 100)}%
              </Badge>
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
  
  if (expandedId === null && filteredSIGACTs.length > 0) {
    setExpandedId(filteredSIGACTs[0].id);
  }
  
  return (
    <Card className={cn("border-0 shadow-none bg-transparent", className)}>
      <CardHeader className="px-0 pt-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">SIGACT Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Significant Activities - {getActiveTimeWindowLabel()} Window
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {filteredSIGACTs.length} events
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <Filter className="h-3 w-3 text-muted-foreground mr-1" />
          <Button
            variant={categoryFilter === null ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setCategoryFilter(null)}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "secondary" : "ghost"}
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-0 space-y-2">
        {filteredSIGACTs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <p>No significant activities in {getActiveTimeWindowLabel()} window</p>
            <p className="text-xs mt-1">Try selecting a different time period</p>
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
