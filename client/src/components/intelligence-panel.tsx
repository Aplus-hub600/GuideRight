import { useState, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Truck,
  TrendingUp,
  Share2,
  BarChart3,
  Clock,
  CloudRain,
  Upload,
  Settings,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MapPin,
  Zap,
  Filter,
  Download,
  Shield,
  WifiOff,
  GripHorizontal,
  Radio
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MapContextPanel } from "./map-context-panel"
import { IntelligenceIntegration } from "./intelligence-integration"
import { PMESIIBriefing } from "./pmesii-briefing"
import { ASCOPEBriefing } from "./ascope-briefing"
import { SIGACTPanel } from "./sigact-panel"
import { RiskAssessment } from "./risk-assessment"
import { SocialMediaPanel } from "./social-media-panel"
import { WeatherPanel } from "./weather-panel"
import { FileDrop } from "./file-drop"
import { ExportPanel } from "./export-panel"
import { ChatPanel } from "./chat-panel"
import { TimeWindowCompact } from "./time-window-selector"
import Timeline from "@/pages/timeline"
import Analytics from "@/pages/analytics"
import type { NavSection } from "./bottom-nav-bar"
import type { MapLens } from "./map-lens-selector"
import type { ParsedQuery } from "./unified-search-bar"
import type { DensitySample } from "./google-maps-panel"
import { MissionClock, DataFreshness } from "./mission-clock"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface LensConfig {
  id: MapLens
  label: string
  shortLabel: string
  icon: typeof Building2
  description: string
}

const LENS_OPTIONS: LensConfig[] = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    shortLabel: "Infra",
    icon: Building2,
    description: "Facilities, utilities, transport nodes"
  },
  {
    id: "human-activity",
    label: "Human Activity",
    shortLabel: "Activity",
    icon: Users,
    description: "Population movement, gatherings"
  },
  {
    id: "risk-stress",
    label: "Risk & Stress",
    shortLabel: "Risk",
    icon: AlertTriangle,
    description: "Threat indicators, vulnerabilities"
  },
  {
    id: "logistics",
    label: "Logistics",
    shortLabel: "Logistics",
    icon: Truck,
    description: "Supply routes, access points"
  },
  {
    id: "intel",
    label: "Live Intel",
    shortLabel: "Intel",
    icon: Radio,
    description: "Real-time GDELT events and news"
  }
]

/**
 * Calculate tactical operational context from population density
 * Whitepaper-aligned: Uses qualitative descriptors to avoid false precision
 * Provides pattern-based assessments, not precise estimates
 */
function getTacticalContext(sample: DensitySample): {
  crowdPotential: { level: string; estimate: string; description: string }
  evacuationTime: { level: string; estimate: string; description: string }
  movementDifficulty: { level: string; rating: number; description: string }
  opsRecommendation: string
} {
  // Use normalized density (0-1) for qualitative bands instead of raw numbers
  const normalizedDensity = sample.density
  
  let crowdPotential: { level: string; estimate: string; description: string }
  let evacuationTime: { level: string; estimate: string; description: string }
  let movementDifficulty: { level: string; rating: number; description: string }
  let opsRecommendation: string
  
  if (normalizedDensity >= 0.70) {
    // Concentrated activity - qualitative assessment
    crowdPotential = {
      level: "CONCENTRATED",
      estimate: "Very High",
      description: "Dense activity patterns observed"
    }
    evacuationTime = {
      level: "EXTENDED",
      estimate: "Prolonged",
      description: "Expect significant congestion"
    }
    movementDifficulty = {
      level: "RESTRICTED",
      rating: 4,
      description: "Vehicle movement severely limited"
    }
    opsRecommendation = "Foot patrol recommended. Plan multiple egress routes. High signature environment."
  } else if (normalizedDensity >= 0.45) {
    // Elevated activity
    crowdPotential = {
      level: "ELEVATED",
      estimate: "High",
      description: "Elevated activity patterns"
    }
    evacuationTime = {
      level: "MODERATE",
      estimate: "Delayed",
      description: "Expect traffic delays"
    }
    movementDifficulty = {
      level: "DIFFICULT",
      rating: 3,
      description: "Limited vehicle options"
    }
    opsRecommendation = "Mixed patrol viable. Pre-plan primary and alternate routes."
  } else if (normalizedDensity >= 0.25) {
    // Moderate activity
    crowdPotential = {
      level: "MODERATE",
      estimate: "Moderate",
      description: "Moderate activity levels"
    }
    evacuationTime = {
      level: "STANDARD",
      estimate: "Normal",
      description: "Normal traffic conditions"
    }
    movementDifficulty = {
      level: "MANAGEABLE",
      rating: 2,
      description: "Standard vehicle movement"
    }
    opsRecommendation = "Vehicle patrol effective. Standard security posture."
  } else if (normalizedDensity >= 0.10) {
    // Dispersed activity
    crowdPotential = {
      level: "DISPERSED",
      estimate: "Low",
      description: "Dispersed activity patterns"
    }
    evacuationTime = {
      level: "QUICK",
      estimate: "Minimal",
      description: "Routes generally clear"
    }
    movementDifficulty = {
      level: "LIGHT",
      rating: 1,
      description: "Full vehicle access likely"
    }
    opsRecommendation = "All movement types viable. Good observation lines."
  } else {
    // Sparse activity
    crowdPotential = {
      level: "SPARSE",
      estimate: "Minimal",
      description: "Minimal activity observed"
    }
    evacuationTime = {
      level: "RAPID",
      estimate: "Quick",
      description: "Clear routes available"
    }
    movementDifficulty = {
      level: "UNRESTRICTED",
      rating: 1,
      description: "Unrestricted access"
    }
    opsRecommendation = "Low signature environment. Full operational flexibility."
  }
  
  return { crowdPotential, evacuationTime, movementDifficulty, opsRecommendation }
}

/**
 * TacticalDensitySample - Enhanced density display with operational context
 */
function TacticalDensitySample({ 
  sample, 
  onClose 
}: { 
  sample: DensitySample
  onClose?: () => void 
}) {
  const tactical = getTacticalContext(sample)
  
  return (
    <div className="p-3 bg-muted/30 border border-muted-foreground/20 rounded-md">
      {/* Header - Whitepaper aligned: muted, restrained styling */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground/80">Activity Sample</span>
          <Badge 
            variant="outline"
            className="text-[10px] border-muted-foreground/30 text-muted-foreground"
          >
            {sample.label}
          </Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Core Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-background/50 rounded p-2">
          <span className="text-muted-foreground block text-[10px]">GRID REF</span>
          <span className="font-mono text-foreground">
            {sample.lat.toFixed(4)}N, {sample.lng.toFixed(4)}E
          </span>
        </div>
        <div className="bg-background/50 rounded p-2">
          <span className="text-muted-foreground block text-[10px]">ACTIVITY LEVEL</span>
          <span className="font-mono text-foreground font-bold">
            {sample.label}
          </span>
        </div>
      </div>
      
      {/* Tactical Context - Operational Implications */}
      <div className="border-t border-border/50 pt-2 mb-2">
        <div className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          OPERATIONAL CONTEXT
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Crowd Potential */}
          <div className="bg-background/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">CROWD POT.</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] w-full justify-center",
                tactical.crowdPotential.level === "CONCENTRATED" && "border-muted-foreground/40 text-muted-foreground",
                tactical.crowdPotential.level === "ELEVATED" && "border-muted-foreground/35 text-muted-foreground",
                tactical.crowdPotential.level === "MODERATE" && "border-muted-foreground/30 text-muted-foreground",
                tactical.crowdPotential.level === "DISPERSED" && "border-muted-foreground/25 text-muted-foreground",
                tactical.crowdPotential.level === "SPARSE" && "border-muted-foreground/20 text-muted-foreground"
              )}
            >
              {tactical.crowdPotential.estimate}
            </Badge>
          </div>
          
          {/* Evacuation Time - Whitepaper: muted styling */}
          <div className="bg-background/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">EGRESS</span>
            </div>
            <Badge 
              variant="outline" 
              className="text-[10px] w-full justify-center border-muted-foreground/30 text-muted-foreground"
            >
              {tactical.evacuationTime.estimate}
            </Badge>
          </div>
          
          {/* Movement Difficulty - Whitepaper: muted bar indicator */}
          <div className="bg-background/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Truck className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">ACCESS</span>
            </div>
            <div className="flex gap-0.5 justify-center">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    level <= tactical.movementDifficulty.rating 
                      ? "bg-muted-foreground/60"
                      : "bg-muted/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ops Recommendation - Whitepaper: muted, restrained styling */}
      <div className="bg-muted/20 border border-muted-foreground/15 rounded p-2 text-xs">
        <div className="text-[9px] font-medium text-muted-foreground mb-1">Context Note</div>
        <p className="text-foreground/70 leading-relaxed italic">{tactical.opsRecommendation}</p>
      </div>
      
      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-border/50 text-[9px] text-muted-foreground flex items-center justify-between">
        <span>Source: {sample.source}</span>
        <span>Sampled: {new Date(sample.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  )
}

interface IntelligencePanelProps {
  currentAOI: AOI
  activeTopPanel: NavSection | null
  activeBottomPanel: NavSection | null
  onClosePanel: () => void
  onMediaContextChange?: (ids: string[]) => void
  activeLens: MapLens
  onLensChange: (lens: MapLens) => void
  isChatOpen: boolean
  onToggleChat: () => void
  onQuerySubmit: (query: string, contextIds?: string[]) => void
  mediaContextIds: string[]
  activeSearchFilters?: ParsedQuery
  densitySample?: DensitySample | null
  onClearDensitySample?: () => void
  className?: string
}

export function IntelligencePanel({
  currentAOI,
  activeTopPanel,
  activeBottomPanel,
  onClosePanel,
  onMediaContextChange,
  activeLens,
  onLensChange,
  isChatOpen,
  onToggleChat,
  onQuerySubmit,
  mediaContextIds,
  activeSearchFilters,
  densitySample,
  onClearDensitySample,
  className
}: IntelligencePanelProps) {
  const [riskScore, setRiskScore] = useState(67)
  const [chatHeight, setChatHeight] = useState(400)
  const isResizing = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleRiskUpdate = (score: number, level: string) => {
    setRiskScore(score)
  }

  const handleFileAnalysis = (fileId: string, items: any[]) => {}

  const handleMediaContextChange = (ids: string[]) => {
    if (onMediaContextChange) {
      onMediaContextChange(ids)
    }
  }

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    const startY = e.clientY
    const startHeight = chatHeight

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current || !panelRef.current) return
      const deltaY = startY - moveEvent.clientY
      const panelHeight = panelRef.current.offsetHeight
      const maxHeight = panelHeight - 120
      const newHeight = Math.min(Math.max(startHeight + deltaY, 200), maxHeight)
      setChatHeight(newHeight)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [chatHeight])

  const hasActiveOverlay = activeTopPanel || activeBottomPanel

  const handleExport = () => {
    const riskLevel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW";
    const exportData = {
      classification: "UNCLASSIFIED // FOUO",
      exportTimestamp: new Date().toISOString(),
      areaOfInterest: {
        name: currentAOI.name,
        coordinates: { lat: currentAOI.lat, lng: currentAOI.lng },
        radiusKm: currentAOI.radiusKm
      },
      contextSummary: `Intelligence assessment for ${currentAOI.name || "selected area"}. Analysis conducted using ${activeLens} lens with focus on ${activeSearchFilters?.events?.join(", ") || "general intelligence"}.`,
      riskAssessment: {
        score: riskScore,
        level: riskLevel,
        confidence: "MEDIUM",
        methodology: "Dempster-Shafer aggregation"
      },
      sources: [
        { name: "Field Report", reliability: "A" },
        { name: "Open Source", reliability: "B" },
        { name: "Social Media", reliability: "C" }
      ],
      activeFilters: activeSearchFilters,
      activeLens: activeLens,
      disclaimer: "This assessment is based on available open-source and reported intelligence. Confidence levels reflect source reliability aggregation."
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guideright-intel-${currentAOI.name || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={panelRef} className={cn("flex flex-col overflow-hidden bg-card", className)}>
      {/* Mission Status Bar with Zulu Time */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b text-[11px] flex-shrink-0">
        <MissionClock compact />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Shield className="h-3 w-3" />
            <span>OPSEC</span>
          </div>
          <DataFreshness lastUpdated={new Date()} />
        </div>
      </div>

      {/* Header - matches map header padding (p-3) */}
      <div className="flex-shrink-0 p-3 border-b bg-card space-y-3">
        {/* Row 1: AOI + Risk Badge + Export */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate text-foreground">{currentAOI.name || "Area of Interest"}</h1>
            <p className="text-sm text-foreground/70">
              {currentAOI.lat.toFixed(4)}, {currentAOI.lng.toFixed(4)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="h-7 text-xs gap-1"
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
            {/* Enhanced Threat Level Indicator */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md border-2",
              riskScore >= 70 && "bg-red-500/15 border-red-500/50 animate-pulse",
              riskScore >= 40 && riskScore < 70 && "bg-amber-500/15 border-amber-500/50",
              riskScore < 40 && "bg-green-500/15 border-green-500/50"
            )}>
              <AlertTriangle className={cn(
                "h-4 w-4",
                riskScore >= 70 && "text-red-500",
                riskScore >= 40 && riskScore < 70 && "text-amber-500",
                riskScore < 40 && "text-green-500"
              )} />
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  riskScore >= 70 && "text-red-500",
                  riskScore >= 40 && riskScore < 70 && "text-amber-500",
                  riskScore < 40 && "text-green-500"
                )}>
                  {riskScore >= 70 ? "HIGH RISK" : riskScore >= 40 ? "ELEVATED" : "LOW"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{riskScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Active Filters Indicator - shows when search filters are active */}
        {activeSearchFilters && (activeSearchFilters.timeRange || activeSearchFilters.events?.length || activeSearchFilters.infrastructure?.length) && (
          <div className="flex items-center gap-1.5 flex-wrap p-2 bg-muted/40 rounded-md">
            <Filter className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            {activeSearchFilters.timeRange && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {activeSearchFilters.timeRange.label}
              </Badge>
            )}
            {activeSearchFilters.events?.map(event => (
              <Badge key={event} variant="outline" className="gap-1 text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                <Zap className="h-3 w-3" />
                {event}
              </Badge>
            ))}
            {activeSearchFilters.infrastructure?.map(infra => (
              <Badge key={infra} variant="outline" className="gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                {infra}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Row 3: Lens Selector - 2x2 grid */}
        <div>
          <p className="text-sm font-medium text-foreground/80 uppercase tracking-wide mb-2">Analysis Lens</p>
          <div className="grid grid-cols-2 gap-2">
            {LENS_OPTIONS.map((lens) => {
              const Icon = lens.icon
              const isActive = activeLens === lens.id
              return (
                <button
                  key={lens.id}
                  onClick={() => onLensChange(lens.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-md text-left transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 hover-elevate text-foreground/80 hover:text-foreground"
                  )}
                  data-testid={`lens-${lens.id}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{lens.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tactical Population Density Sample - Enhanced with operational context */}
        {densitySample && activeLens === "human-activity" && (
          <TacticalDensitySample 
            sample={densitySample} 
            onClose={onClearDensitySample}
          />
        )}
      </div>

      {/* Content Area - proper flex layout, no absolute positioning */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Chat Takeover Mode - when chat is open, it dominates the panel */}
        {isChatOpen && !hasActiveOverlay ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Minimized Context Summary - collapsed header */}
            <button
              onClick={onToggleChat}
              className="flex-shrink-0 px-3 py-2 border-b bg-muted/30 hover-elevate flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="font-medium">{currentAOI.name || "Dhaka"}</span>
                <span className="mx-1">•</span>
                <span className="capitalize">{activeLens.replace("-", " ")} Lens</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <span>Show Context</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </button>
            
            {/* Chat Panel - Expanded to fill content area */}
            <div className="flex-1 overflow-hidden">
              <ChatPanel 
                onQuerySubmit={onQuerySubmit}
                mediaContextIds={mediaContextIds}
                className="h-full"
              />
            </div>
          </div>
        ) : !hasActiveOverlay ? (
          /* Default View: Context Panel for selected lens */
          <ScrollArea className="flex-1">
            <MapContextPanel
              aoiName={currentAOI.name || "Dhaka"}
              activeLens={activeLens}
              onQuerySelect={(query) => {
                onQuerySubmit(query)
                if (!isChatOpen) onToggleChat()
              }}
              className="border-0 rounded-none"
            />
          </ScrollArea>
        ) : (
          /* Nav Panel Content - replaces context panel when active */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/30 flex-shrink-0">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                {activeTopPanel === "intelligence" && <><TrendingUp className="h-4 w-4" />Intelligence</>}
                {activeTopPanel === "analytics" && <><BarChart3 className="h-4 w-4" />Analytics</>}
                {activeTopPanel === "social" && <><Share2 className="h-4 w-4" />Social Media</>}
                {activeBottomPanel === "timeline" && <><Clock className="h-4 w-4" />Timeline</>}
                {activeBottomPanel === "weather" && <><CloudRain className="h-4 w-4" />Weather</>}
                {activeBottomPanel === "files" && <><Upload className="h-4 w-4" />Files</>}
                {activeBottomPanel === "settings" && <><Settings className="h-4 w-4" />Export</>}
              </h2>
              <Button size="icon" variant="ghost" onClick={onClosePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-auto">
              {activeTopPanel === "intelligence" && (
                <Tabs defaultValue="intelligence" className="h-full flex flex-col">
                  <div className="mx-3 mt-3 space-y-2">
                    <TabsList className="flex-wrap h-auto gap-1 w-full">
                      <TabsTrigger value="intelligence" className="text-xs">Intel</TabsTrigger>
                      <TabsTrigger value="pmesii" className="text-xs">PMESII</TabsTrigger>
                      <TabsTrigger value="ascope" className="text-xs">ASCOPE</TabsTrigger>
                      <TabsTrigger value="sigact" className="text-xs">SIGACT</TabsTrigger>
                      <TabsTrigger value="risk" className="text-xs">Risk</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center justify-between border rounded-md p-1.5 bg-muted/30">
                      <span className="text-[10px] font-medium text-muted-foreground ml-1">Time Window:</span>
                      <TimeWindowCompact />
                    </div>
                  </div>
                  <TabsContent value="intelligence" className="flex-1 p-3 overflow-auto">
                    <IntelligenceIntegration />
                  </TabsContent>
                  <TabsContent value="pmesii" className="flex-1 p-3 overflow-auto">
                    <PMESIIBriefing aoi={currentAOI} />
                  </TabsContent>
                  <TabsContent value="ascope" className="flex-1 p-3 overflow-auto">
                    <ASCOPEBriefing aoi={currentAOI} />
                  </TabsContent>
                  <TabsContent value="sigact" className="flex-1 p-3 overflow-auto">
                    <SIGACTPanel aoi={currentAOI} />
                  </TabsContent>
                  <TabsContent value="risk" className="flex-1 p-3 overflow-auto">
                    <RiskAssessment aoi={currentAOI} onRiskUpdate={handleRiskUpdate} />
                  </TabsContent>
                </Tabs>
              )}
              
              {activeTopPanel === "analytics" && <Analytics />}
              {activeTopPanel === "social" && <div className="p-3"><SocialMediaPanel /></div>}
              {activeBottomPanel === "timeline" && <Timeline />}
              {activeBottomPanel === "weather" && <div className="p-3"><WeatherPanel /></div>}
              {activeBottomPanel === "files" && (
                <div className="p-3">
                  <FileDrop 
                    onAnalysisComplete={handleFileAnalysis}
                    onFilesChange={handleMediaContextChange}
                    maxFiles={5}
                    compact={false}
                  />
                </div>
              )}
              {activeBottomPanel === "settings" && (
                <ExportPanel 
                  currentAOI={currentAOI}
                  activeTopPanel={activeTopPanel}
                  activeBottomPanel={activeBottomPanel}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Section - Different behavior based on context */}
      {hasActiveOverlay ? (
        /* When overlay is active: traditional docked chat at bottom with resize */
        <div 
          className="border-t flex-shrink-0 flex flex-col"
          style={{ height: isChatOpen ? chatHeight : 48 }}
        >
          {/* Resize Handle - only show when chat is open */}
          {isChatOpen && (
            <div
              onMouseDown={startResize}
              className="h-2 w-full cursor-ns-resize flex items-center justify-center hover:bg-muted/50 transition-colors group"
            >
              <GripHorizontal className="h-3 w-8 text-muted-foreground/50 group-hover:text-muted-foreground" />
            </div>
          )}
          <button
            onClick={onToggleChat}
            className="w-full h-12 flex-shrink-0 px-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent hover-elevate"
            data-testid="button-toggle-chat"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MessageSquare className="h-4 w-4" />
              Chat Assistant
            </span>
            {isChatOpen ? (
              <ChevronDown className="h-4 w-4 text-primary" />
            ) : (
              <ChevronUp className="h-4 w-4 text-primary" />
            )}
          </button>
          {isChatOpen && (
            <div className="flex-1 overflow-hidden">
              <ChatPanel 
                onQuerySubmit={onQuerySubmit}
                mediaContextIds={mediaContextIds}
                className="h-full"
              />
            </div>
          )}
        </div>
      ) : !isChatOpen ? (
        /* No overlay, chat closed: show toggle at bottom */
        <div className="border-t flex-shrink-0">
          <button
            onClick={onToggleChat}
            className="w-full h-12 px-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent hover-elevate"
            data-testid="button-toggle-chat"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MessageSquare className="h-4 w-4" />
              Chat Assistant
            </span>
            <ChevronUp className="h-4 w-4 text-primary" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
