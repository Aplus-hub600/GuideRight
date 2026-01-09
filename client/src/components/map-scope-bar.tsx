import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MapPin, Layers, Signal, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ScopeLevel = "point" | "neighborhood" | "district" | "metropolitan" | "regional" | "national"

export interface DataCoverage {
  infrastructure: "high" | "medium" | "low" | "sparse"
  humanActivity: "high" | "medium" | "low" | "sparse"
  temporal: "current" | "recent" | "historical" | "limited"
}

interface MapScopeBarProps {
  aoiName?: string
  scope: ScopeLevel
  coverage: DataCoverage
  zoomLevel: number
  className?: string
}

const scopeLabels: Record<ScopeLevel, string> = {
  point: "Point Location",
  neighborhood: "Neighborhood",
  district: "District",
  metropolitan: "Metropolitan Area",
  regional: "Regional",
  national: "National"
}

const coverageColors: Record<string, string> = {
  high: "text-emerald-500",
  medium: "text-amber-500",
  low: "text-orange-500",
  sparse: "text-red-500"
}

const coverageLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  sparse: "Sparse"
}

function getScopeFromZoom(zoom: number): ScopeLevel {
  if (zoom >= 16) return "point"
  if (zoom >= 14) return "neighborhood"
  if (zoom >= 12) return "district"
  if (zoom >= 9) return "metropolitan"
  if (zoom >= 6) return "regional"
  return "national"
}

export function MapScopeBar({ 
  aoiName, 
  scope, 
  coverage,
  zoomLevel,
  className 
}: MapScopeBarProps) {
  const effectiveScope = getScopeFromZoom(zoomLevel)
  
  return (
    <div className={cn(
      "flex items-center gap-3 bg-background/95 backdrop-blur-sm border rounded-md px-3 py-2 text-sm shadow-sm",
      className
    )}>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="font-medium">{aoiName || "No AOI Selected"}</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{scopeLabels[effectiveScope]}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">Scope adjusts with zoom level. Current view shows {scopeLabels[effectiveScope].toLowerCase()} level data.</p>
        </TooltipContent>
      </Tooltip>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-3 text-xs">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help">
              <Signal className={cn("h-3 w-3", coverageColors[coverage.infrastructure])} />
              <span className="text-muted-foreground">Infra:</span>
              <span className={coverageColors[coverage.infrastructure]}>
                {coverageLabels[coverage.infrastructure]}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Infrastructure data coverage: {coverage.infrastructure}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help">
              <Signal className={cn("h-3 w-3", coverageColors[coverage.humanActivity])} />
              <span className="text-muted-foreground">Activity:</span>
              <span className={coverageColors[coverage.humanActivity]}>
                {coverageLabels[coverage.humanActivity]}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Human activity data coverage: {coverage.humanActivity}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {(coverage.infrastructure === "sparse" || coverage.humanActivity === "sparse") && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">Limited data available at this scope. Analysis may have reduced confidence.</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
