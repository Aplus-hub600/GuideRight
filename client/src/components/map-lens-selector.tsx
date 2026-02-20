import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Truck,
  ChevronRight,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Database,
  Plus,
  Minus,
  Crosshair,
  Navigation,
  Maximize2,
  Locate,
  Map,
  Satellite,
  Globe2,
  Radio
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"

export type MapLens = "infrastructure" | "human-activity" | "risk-stress" | "logistics" | "intel"

interface LensConfig {
  id: MapLens
  label: string
  shortLabel: string
  icon: typeof Building2
  description: string
  suggestedQuestions: string[]
}

export const LENS_CONFIGS: LensConfig[] = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    shortLabel: "Infra",
    icon: Building2,
    description: "Healthcare, transport, utilities, and critical facilities",
    suggestedQuestions: [
      "Show healthcare access gaps",
      "Identify transport chokepoints",
      "Which areas are under-served?",
      "Map critical infrastructure"
    ]
  },
  {
    id: "human-activity",
    label: "Human Activity",
    shortLabel: "Activity",
    icon: Users,
    description: "Population movement, gatherings, and civil activity patterns",
    suggestedQuestions: [
      "Types of public disorder observed",
      "Primary protest drivers",
      "Population movement patterns",
      "Comparison to adjacent districts"
    ]
  },
  {
    id: "risk-stress",
    label: "Risk & Stress",
    shortLabel: "Risk",
    icon: AlertTriangle,
    description: "Threat assessment, tension indicators, and security concerns",
    suggestedQuestions: [
      "Current threat assessment",
      "Historical incident patterns",
      "Escalation indicators",
      "Safe corridor identification"
    ]
  },
  {
    id: "logistics",
    label: "Logistics & Mobility",
    shortLabel: "Logistics",
    icon: Truck,
    description: "Routes, supply lines, access corridors, and mobility constraints",
    suggestedQuestions: [
      "Optimal route analysis",
      "Supply line vulnerabilities",
      "Border crossing status",
      "Fuel and resupply points"
    ]
  },
  {
    id: "intel",
    label: "Live Intel",
    shortLabel: "Intel",
    icon: Radio,
    description: "Real-time GDELT events, news, and open-source intelligence",
    suggestedQuestions: [
      "Recent security incidents",
      "Current protest activity",
      "Diplomatic developments",
      "Economic disruptions"
    ]
  }
]

interface MapLensSelectorProps {
  activeLens: MapLens
  onLensChange: (lens: MapLens) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function MapLensSelector({
  activeLens,
  onLensChange,
  collapsed = false,
  onToggleCollapse,
  className
}: MapLensSelectorProps) {
  const activeLensConfig = LENS_CONFIGS.find(l => l.id === activeLens)
  
  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-sm border rounded-md shadow-sm overflow-hidden",
      className
    )}>
      <div className="flex flex-col">
        {LENS_CONFIGS.map((lens) => {
          const isActive = activeLens === lens.id
          const Icon = lens.icon
          
          return (
            <Tooltip key={lens.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onLensChange(lens.id)}
                  className={cn(
                    "justify-start gap-2 rounded-none border-b last:border-b-0 h-9",
                    isActive && "bg-primary text-primary-foreground",
                    !collapsed && "px-3"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="text-xs font-medium">{lens.shortLabel}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">{lens.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{lens.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

export type MapStyleType = "streets" | "satellite" | "hybrid" | "roadmap"

interface LensLegendProps {
  activeLens: MapLens
  mapStyle?: MapStyleType
  className?: string
}

// Lens accent colors - adapt for different map backgrounds
const LENS_COLORS = {
  infrastructure: { 
    accent: "rgb(59, 130, 246)", 
    bg: "rgba(59, 130, 246, 0.08)", 
    border: "rgba(59, 130, 246, 0.2)",
    // Satellite mode: brighter accents for dark imagery
    satelliteAccent: "rgb(96, 165, 250)",
    satelliteBg: "rgba(59, 130, 246, 0.15)",
    satelliteBorder: "rgba(59, 130, 246, 0.4)"
  },
  "human-activity": { 
    accent: "rgb(168, 85, 247)", 
    bg: "rgba(168, 85, 247, 0.08)", 
    border: "rgba(168, 85, 247, 0.2)",
    satelliteAccent: "rgb(192, 132, 252)",
    satelliteBg: "rgba(168, 85, 247, 0.15)",
    satelliteBorder: "rgba(168, 85, 247, 0.4)"
  },
  "risk-stress": { 
    accent: "rgb(249, 115, 22)", 
    bg: "rgba(249, 115, 22, 0.08)", 
    border: "rgba(249, 115, 22, 0.2)",
    satelliteAccent: "rgb(251, 146, 60)",
    satelliteBg: "rgba(249, 115, 22, 0.15)",
    satelliteBorder: "rgba(249, 115, 22, 0.4)"
  },
  logistics: { 
    accent: "rgb(6, 182, 212)", 
    bg: "rgba(6, 182, 212, 0.08)", 
    border: "rgba(6, 182, 212, 0.2)",
    satelliteAccent: "rgb(34, 211, 238)",
    satelliteBg: "rgba(6, 182, 212, 0.15)",
    satelliteBorder: "rgba(6, 182, 212, 0.4)"
  },
  intel: { 
    accent: "rgb(239, 68, 68)", 
    bg: "rgba(239, 68, 68, 0.08)", 
    border: "rgba(239, 68, 68, 0.2)",
    satelliteAccent: "rgb(248, 113, 113)",
    satelliteBg: "rgba(6, 182, 212, 0.15)",
    satelliteBorder: "rgba(6, 182, 212, 0.4)"
  }
}

// Simulated live data - in production, this would come from actual map data
const SMART_LEGEND_DATA = {
  infrastructure: {
    layers: [
      { id: "hospitals", label: "Hospitals & Clinics", color: "#ef4444", count: 47, visible: true, source: "Fraym", freshness: 2, confidence: 94 },
      { id: "transport", label: "Transport Hubs", color: "#3b82f6", count: 23, visible: true, source: "OSM", freshness: 1, confidence: 89 },
      { id: "utilities", label: "Power & Utilities", color: "#f59e0b", count: 156, visible: true, source: "Seerist", freshness: 4, confidence: 76 },
      { id: "government", label: "Government", color: "#10b981", count: 18, visible: true, source: "Multi", freshness: 12, confidence: 98 },
      { id: "education", label: "Schools", color: "#8b5cf6", count: 89, visible: true, source: "OSM", freshness: 24, confidence: 82 }
    ],
    totalFeatures: 333,
    avgConfidence: 88
  },
  "human-activity": {
    layers: [
      { id: "gatherings", label: "Public Gatherings", color: "#a855f7", count: 8, visible: true, source: "Sprinklr", freshness: 0.5, confidence: 71 },
      { id: "movement", label: "Population Flow", color: "#3b82f6", count: 12, visible: true, source: "Fraym", freshness: 1, confidence: 85 },
      { id: "incidents", label: "Reported Incidents", color: "#ef4444", count: 3, visible: true, source: "News", freshness: 2, confidence: 67 }
    ],
    totalFeatures: 23,
    avgConfidence: 74
  },
  "risk-stress": {
    layers: [
      { id: "high", label: "High Risk Zones", color: "#ef4444", count: 2, visible: true, source: "Seerist", freshness: 1, confidence: 82 },
      { id: "elevated", label: "Elevated Areas", color: "#f97316", count: 5, visible: true, source: "Multi", freshness: 4, confidence: 78 },
      { id: "moderate", label: "Moderate Areas", color: "#eab308", count: 8, visible: true, source: "Multi", freshness: 6, confidence: 85 },
      { id: "low", label: "Low Risk Areas", color: "#22c55e", count: 14, visible: true, source: "Seerist", freshness: 12, confidence: 91 }
    ],
    totalFeatures: 29,
    avgConfidence: 84
  },
  logistics: {
    layers: [
      { id: "clear", label: "Clear Routes", color: "#22c55e", count: 34, visible: true, source: "Traffic", freshness: 0.25, confidence: 95 },
      { id: "congested", label: "Congested", color: "#f59e0b", count: 12, visible: true, source: "Traffic", freshness: 0.25, confidence: 92 },
      { id: "blocked", label: "Blocked", color: "#ef4444", count: 3, visible: true, source: "Intel", freshness: 1, confidence: 88 },
      { id: "supplies", label: "Supply Points", color: "#3b82f6", count: 28, visible: true, source: "Fraym", freshness: 6, confidence: 79 }
    ],
    totalFeatures: 77,
    avgConfidence: 89
  },
  intel: {
    layers: [
      { id: "conflict", label: "Conflict Events", color: "#dc2626", count: 2, visible: true, source: "GDELT", freshness: 0.5, confidence: 78 },
      { id: "tension", label: "Tension Events", color: "#f97316", count: 4, visible: true, source: "GDELT", freshness: 0.5, confidence: 82 },
      { id: "neutral", label: "Neutral Activity", color: "#eab308", count: 6, visible: true, source: "GDELT", freshness: 1, confidence: 85 },
      { id: "cooperation", label: "Cooperation", color: "#22c55e", count: 4, visible: true, source: "GDELT", freshness: 1, confidence: 88 },
      { id: "news", label: "News Coverage", color: "#3b82f6", count: 12, visible: true, source: "GDELT", freshness: 0.25, confidence: 75 }
    ],
    totalFeatures: 28,
    avgConfidence: 82
  }
}

// Format freshness as human-readable
function formatFreshness(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}

export function LensLegend({ activeLens, mapStyle = "streets", className }: LensLegendProps) {
  const lensConfig = LENS_CONFIGS.find(l => l.id === activeLens)
  if (!lensConfig) return null
  
  const lensColors = LENS_COLORS[activeLens]
  const isSatellite = mapStyle === "satellite" || mapStyle === "hybrid"
  
  // Smart layer visibility state
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set())
  
  const toggleLayer = (layerId: string) => {
    setHiddenLayers(prev => {
      const next = new Set(prev)
      if (next.has(layerId)) {
        next.delete(layerId)
      } else {
        next.add(layerId)
      }
      return next
    })
  }
  
  // Get smart data for current lens
  const smartData = SMART_LEGEND_DATA[activeLens]
  
  // Calculate visible stats
  const visibleLayers = useMemo(() => 
    smartData.layers.filter(l => !hiddenLayers.has(l.id)),
    [smartData.layers, hiddenLayers]
  )
  
  const visibleCount = useMemo(() => 
    visibleLayers.reduce((sum, l) => sum + l.count, 0),
    [visibleLayers]
  )
  
  // Adapt colors based on map style
  const colors = {
    accent: isSatellite ? lensColors.satelliteAccent : lensColors.accent,
    bg: isSatellite ? lensColors.satelliteBg : lensColors.bg,
    border: isSatellite ? lensColors.satelliteBorder : lensColors.border
  }
  
  const Icon = lensConfig.icon
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeLens}-${mapStyle}`}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className={cn(
          "backdrop-blur-md border-l border-t overflow-hidden",
          "font-mono text-[11px] select-none rounded-tl-md",
          isSatellite 
            ? "bg-zinc-900/95 text-zinc-100" 
            : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
          className
        )}
        style={{ 
          borderColor: colors.border,
          minWidth: "180px",
          maxWidth: "220px"
        }}
      >
        {/* Smart Header with live stats */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0" style={{ color: colors.accent }} />
            <span 
              className="text-[11px] font-bold tracking-wide"
              style={{ color: colors.accent }}
            >
              {lensConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: colors.accent }}>
              {visibleCount}
            </span>
            <span className="text-[9px] opacity-60">features</span>
          </div>
        </div>
        
        {/* Smart Interactive Legend */}
        <div className="px-1 py-1.5">
          {smartData.layers.map((layer, idx) => {
            const isHidden = hiddenLayers.has(layer.id)
            return (
              <motion.div
                key={layer.id}
                initial={false}
                animate={{ opacity: isHidden ? 0.4 : 1 }}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors",
                  "hover:bg-current/5",
                  isHidden && "line-through decoration-1"
                )}
                onClick={() => toggleLayer(layer.id)}
              >
                {/* Visibility Toggle */}
                <div className="w-4 h-4 flex items-center justify-center shrink-0 opacity-50">
                  {isHidden ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </div>
                
                {/* Color indicator */}
                <div 
                  className={cn(
                    "w-3 h-3 rounded shrink-0 shadow-sm transition-opacity",
                    isHidden && "opacity-40"
                  )}
                  style={{ backgroundColor: layer.color }}
                />
                
                {/* Label & Count */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-medium truncate block">
                    {layer.label}
                  </span>
                </div>
                
                {/* Live Count */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn(
                    "text-[10px] font-bold tabular-nums",
                    !isHidden && "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {layer.count}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Data Intelligence Bar */}
        <div className={cn(
          "px-3 py-2 border-t",
          isSatellite 
            ? "border-zinc-700 bg-zinc-800/40" 
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40"
        )}>
          <div className="flex items-center justify-between gap-2">
            {/* Confidence Score */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className={cn(
                    "text-[10px] font-bold",
                    smartData.avgConfidence >= 85 ? "text-emerald-600 dark:text-emerald-400" :
                    smartData.avgConfidence >= 70 ? "text-amber-600 dark:text-amber-400" :
                    "text-red-600 dark:text-red-400"
                  )}>
                    {smartData.avgConfidence}%
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Average confidence across sources
              </TooltipContent>
            </Tooltip>
            
            {/* Sources indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Database className="w-3 h-3 opacity-50" />
                  <span className="text-[9px] opacity-70">
                    {Array.from(new Set(smartData.layers.map(l => l.source))).length} sources
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {Array.from(new Set(smartData.layers.map(l => l.source))).join(", ")}
              </TooltipContent>
            </Tooltip>
            
            {/* Live indicator */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] opacity-70">Live</span>
            </div>
          </div>
        </div>
        
        {/* Map Mode Footer */}
        <div className={cn(
          "px-3 py-1.5 border-t text-[8px] flex items-center justify-between",
          isSatellite 
            ? "border-zinc-700 bg-zinc-800/60 text-zinc-400" 
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400"
        )}>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
          </span>
          <span className="uppercase tracking-wider">
            {isSatellite ? "Satellite" : "Terrain"}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Smart zoom level context - what each zoom level means operationally
const ZOOM_CONTEXT = [
  { min: 0, max: 4, label: "Continental", scale: "1000+ km", desc: "Regional overview" },
  { min: 5, max: 7, label: "Country", scale: "100-500 km", desc: "National scope" },
  { min: 8, max: 10, label: "Metro", scale: "10-50 km", desc: "Metropolitan area" },
  { min: 11, max: 13, label: "District", scale: "1-5 km", desc: "District detail" },
  { min: 14, max: 16, label: "Street", scale: "100-500 m", desc: "Street level" },
  { min: 17, max: 22, label: "Building", scale: "<100 m", desc: "Structure detail" }
]

function getZoomContext(zoom: number) {
  return ZOOM_CONTEXT.find(c => zoom >= c.min && zoom <= c.max) || ZOOM_CONTEXT[2]
}

interface SmartMapControlsProps {
  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void
  onCenterAOI?: () => void
  onMovementPlan?: () => void
  aoiName?: string
  mapStyle?: "streets" | "satellite" | "hybrid"
  className?: string
}

export function SmartMapControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onCenterAOI,
  onMovementPlan,
  aoiName = "AOI",
  mapStyle = "streets",
  className
}: SmartMapControlsProps) {
  const context = getZoomContext(zoomLevel)
  const isSatellite = mapStyle === "satellite" || mapStyle === "hybrid"
  
  // Calculate zoom progress (0-100) within the usable range (4-18)
  const zoomProgress = Math.min(100, Math.max(0, ((zoomLevel - 4) / 14) * 100))
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "backdrop-blur-sm rounded-tr-md overflow-hidden",
        "font-mono text-[10px] select-none",
        "bg-black/50",
        className
      )}
    >
      <div className="flex items-center">
        <button
          onClick={onZoomIn}
          disabled={zoomLevel >= 18}
          className="px-2 py-1.5 text-white/60 hover:text-white/90 disabled:opacity-30 transition-colors"
          data-testid="button-zoom-in"
          title="Zoom In (+)"
        >
          <Plus className="w-3 h-3" />
        </button>
        <span className="text-white/50 text-[9px] tabular-nums min-w-[18px] text-center">z{zoomLevel}</span>
        <button
          onClick={onZoomOut}
          disabled={zoomLevel <= 4}
          className="px-2 py-1.5 text-white/60 hover:text-white/90 disabled:opacity-30 transition-colors"
          data-testid="button-zoom-out"
          title="Zoom Out (-)"
        >
          <Minus className="w-3 h-3" />
        </button>
        {onCenterAOI && (
          <button
            onClick={onCenterAOI}
            className="px-2 py-1.5 text-white/60 hover:text-white/90 transition-colors"
            data-testid="button-center-aoi"
            title={`Center on ${aoiName} (C)`}
          >
            <Locate className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Map style options with metadata
const MAP_STYLES = [
  { 
    id: "streets" as const, 
    label: "Terrain", 
    shortLabel: "TRN",
    icon: Map,
    desc: "Roads & boundaries"
  },
  { 
    id: "satellite" as const, 
    label: "Satellite", 
    shortLabel: "SAT",
    icon: Satellite,
    desc: "Aerial imagery"
  },
  { 
    id: "hybrid" as const, 
    label: "Hybrid", 
    shortLabel: "HYB",
    icon: Globe2,
    desc: "Imagery + labels"
  }
]

interface SmartMapStyleToggleProps {
  activeStyle: "streets" | "satellite" | "hybrid"
  onStyleChange: (style: "streets" | "satellite" | "hybrid") => void
  className?: string
}

export function SmartMapStyleToggle({
  activeStyle,
  onStyleChange,
  className
}: SmartMapStyleToggleProps) {
  const activeConfig = MAP_STYLES.find(s => s.id === activeStyle) || MAP_STYLES[0]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "backdrop-blur-md border shadow-lg rounded-lg overflow-hidden",
        "font-mono text-[11px] select-none",
        "bg-zinc-900/90 text-zinc-100 border-zinc-700",
        className
      )}
    >
      {/* Style selector with sliding indicator */}
      <div className="relative p-1 flex gap-0.5">
        {MAP_STYLES.map((style) => {
          const Icon = style.icon
          const isActive = style.id === activeStyle
          
          return (
            <Tooltip key={style.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStyleChange(style.id)}
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all duration-200",
                    isActive 
                      ? "text-white" 
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                  data-testid={`button-map-${style.id}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeStyleBg"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="text-[10px] font-medium relative z-10 hidden sm:inline">
                    {style.shortLabel}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-medium">{style.label}</div>
                <div className="text-[10px] opacity-70">{style.desc}</div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      
      {/* Active mode indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStyle}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="border-t border-zinc-700 px-2.5 py-1.5 bg-zinc-800/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider">
              {activeConfig.label} View
            </span>
            <span className="text-[9px] text-emerald-400 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

