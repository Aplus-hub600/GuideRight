import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  AlertTriangle,
  BarChart3,
  Network,
  FileSearch,
  Briefcase,
  ChevronDown,
  MapPin,
  Clock,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";

export type GIAMode = 
  | "PMESII" 
  | "RISK_BRIEF" 
  | "SITREP" 
  | "MISSION_SUPPORT"
  | "GRAPH_QUERY" 
  | "ARTIFACT_SUMMARY";

interface GIAModeSelectorProps {
  selectedMode: GIAMode;
  onModeChange: (mode: GIAMode) => void;
  aoiLabel?: string | null;
  timeWindow?: { from?: string; to?: string } | null;
  evidenceCount?: number;
  engineState?: "AI_ONLINE" | "DEGRADED" | "AI_UNAVAILABLE";
}

const MODE_CONFIG: Record<GIAMode, { label: string; icon: typeof FileText; description: string }> = {
  PMESII: {
    label: "PMESII",
    icon: BarChart3,
    description: "Political, Military, Economic, Social, Information, Infrastructure analysis",
  },
  RISK_BRIEF: {
    label: "Risk Brief",
    icon: AlertTriangle,
    description: "Threat assessment with severity scoring and mitigations",
  },
  SITREP: {
    label: "SITREP",
    icon: FileText,
    description: "Situation report with structured sections and key developments",
  },
  MISSION_SUPPORT: {
    label: "Mission Support",
    icon: Briefcase,
    description: "Operational support analysis and recommendations",
  },
  GRAPH_QUERY: {
    label: "Graph Query",
    icon: Network,
    description: "Query the intelligence graph for relationships and paths",
  },
  ARTIFACT_SUMMARY: {
    label: "Artifact Summary",
    icon: FileSearch,
    description: "Summarize uploaded artifacts and intelligence sources",
  },
};

export function GIAModeSelector({
  selectedMode,
  onModeChange,
  aoiLabel,
  timeWindow,
  evidenceCount = 0,
  engineState = "AI_ONLINE",
}: GIAModeSelectorProps) {
  const currentMode = MODE_CONFIG[selectedMode];
  const Icon = currentMode.icon;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentMode.label}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Analysis Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(MODE_CONFIG).map(([mode, config]) => {
            const ModeIcon = config.icon;
            return (
              <DropdownMenuItem
                key={mode}
                onClick={() => onModeChange(mode as GIAMode)}
                className="flex flex-col items-start gap-1 py-2"
              >
                <div className="flex items-center gap-2">
                  <ModeIcon className="h-4 w-4" />
                  <span className="font-medium">{config.label}</span>
                  {mode === selectedMode && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground pl-6">
                  {config.description}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-wrap items-center gap-1">
        {aoiLabel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{aoiLabel}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Area of Interest: {aoiLabel}</TooltipContent>
          </Tooltip>
        )}

        {timeWindow?.from && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  {formatTimeRange(timeWindow.from, timeWindow.to)}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Time Window: {new Date(timeWindow.from).toLocaleDateString()} - {" "}
              {timeWindow.to ? new Date(timeWindow.to).toLocaleDateString() : "Now"}
            </TooltipContent>
          </Tooltip>
        )}

        {evidenceCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs">
                <Database className="h-3 w-3" />
                <span>{evidenceCount} sources</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {evidenceCount} evidence sources available
            </TooltipContent>
          </Tooltip>
        )}

        <EngineStatusBadge state={engineState} />
      </div>
    </div>
  );
}

function EngineStatusBadge({ state }: { state: "AI_ONLINE" | "DEGRADED" | "AI_UNAVAILABLE" }) {
  const config = {
    AI_ONLINE: {
      icon: Wifi,
      label: "Online",
      variant: "default" as const,
    },
    DEGRADED: {
      icon: Wifi,
      label: "Degraded",
      variant: "secondary" as const,
    },
    AI_UNAVAILABLE: {
      icon: WifiOff,
      label: "Offline",
      variant: "destructive" as const,
    },
  };

  const current = config[state];
  const Icon = current.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={current.variant} className="gap-1 text-xs">
          <Icon className="h-3 w-3" />
          <span className="hidden sm:inline">{current.label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        AI Engine: {current.label}
        {state === "DEGRADED" && " (Limited functionality)"}
        {state === "AI_UNAVAILABLE" && " (Using cached data only)"}
      </TooltipContent>
    </Tooltip>
  );
}

function formatTimeRange(from: string, to?: string): string {
  const fromDate = new Date(from);
  const toDate = to ? new Date(to) : new Date();
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "24h";
  } else if (diffDays <= 7) {
    return `${diffDays}d`;
  } else if (diffDays <= 30) {
    return `${Math.floor(diffDays / 7)}w`;
  } else {
    return `${Math.floor(diffDays / 30)}mo`;
  }
}

export function GIAContextChips({
  aoiLabel,
  trainingCountry,
  timeWindow,
  artifactCount,
  nodeCount,
}: {
  aoiLabel?: string | null;
  trainingCountry?: string | null;
  timeWindow?: { from?: string; to?: string } | null;
  artifactCount?: number;
  nodeCount?: number;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-2">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-muted-foreground">Context:</span>
          
          {aoiLabel && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {aoiLabel}
            </Badge>
          )}
          
          {trainingCountry && (
            <Badge variant="secondary" className="gap-1">
              {trainingCountry}
            </Badge>
          )}
          
          {timeWindow?.from && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeRange(timeWindow.from, timeWindow.to)}
            </Badge>
          )}
          
          {(artifactCount ?? 0) > 0 && (
            <Badge variant="secondary" className="gap-1">
              <FileSearch className="h-3 w-3" />
              {artifactCount} artifacts
            </Badge>
          )}
          
          {(nodeCount ?? 0) > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Network className="h-3 w-3" />
              {nodeCount} nodes
            </Badge>
          )}
          
          {!aoiLabel && !trainingCountry && !timeWindow?.from && (
            <span className="text-muted-foreground italic">No context set</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
