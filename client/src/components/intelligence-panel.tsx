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
      {/* Operational Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b text-[11px] text-foreground/70 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>All queries logged for audit and OPSEC review</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600">
          <WifiOff className="h-3 w-3" />
          <span>Offline cache: Not available</span>
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
            <div className="flex flex-col items-end gap-0.5">
              <Badge 
                variant={riskScore >= 70 ? "destructive" : riskScore >= 40 ? "secondary" : "outline"}
              >
                Risk: {riskScore}%
              </Badge>
              {activeSearchFilters && (activeSearchFilters.timeRange || activeSearchFilters.events?.length) && (
                <span className="text-[10px] text-muted-foreground">reflects current filter set</span>
              )}
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
