import { useState } from "react"
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
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MapContextPanel } from "./map-context-panel"
import { IntelligenceIntegration } from "./intelligence-integration"
import { PMESIIBriefing } from "./pmesii-briefing"
import { RiskAssessment } from "./risk-assessment"
import { SocialMediaPanel } from "./social-media-panel"
import { WeatherPanel } from "./weather-panel"
import { FileDrop } from "./file-drop"
import { ExportPanel } from "./export-panel"
import { ChatPanel } from "./chat-panel"
import Timeline from "@/pages/timeline"
import Analytics from "@/pages/analytics"
import type { NavSection } from "./bottom-nav-bar"
import type { MapLens } from "./map-lens-selector"

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
  className
}: IntelligencePanelProps) {
  const [riskScore, setRiskScore] = useState(67)

  const handleRiskUpdate = (score: number, level: string) => {
    setRiskScore(score)
  }

  const handleFileAnalysis = (fileId: string, items: any[]) => {}

  const handleMediaContextChange = (ids: string[]) => {
    if (onMediaContextChange) {
      onMediaContextChange(ids)
    }
  }

  const hasActiveOverlay = activeTopPanel || activeBottomPanel

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header with AOI and Risk Summary */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold">{currentAOI.name || "Area of Interest"}</h1>
            <p className="text-sm text-muted-foreground">
              {currentAOI.lat.toFixed(4)}, {currentAOI.lng.toFixed(4)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={riskScore >= 70 ? "destructive" : riskScore >= 40 ? "secondary" : "outline"}>
              Risk: {riskScore}%
            </Badge>
          </div>
        </div>
        
        {/* Lens Selector - Vertical with readable labels */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Analysis Lens</p>
          <div className="grid grid-cols-2 gap-2">
            {LENS_OPTIONS.map((lens) => {
              const Icon = lens.icon
              const isActive = activeLens === lens.id
              return (
                <button
                  key={lens.id}
                  onClick={() => onLensChange(lens.id)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg text-left transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover-elevate text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`lens-${lens.id}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{lens.label}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area - No absolute positioning */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {!hasActiveOverlay ? (
          /* Default View: Context Panel for selected lens */
          <ScrollArea className="flex-1">
            <MapContextPanel
              aoiName={currentAOI.name || "Dhaka"}
              activeLens={activeLens}
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
                  <TabsList className="mx-3 mt-3">
                    <TabsTrigger value="intelligence" className="flex-1">Intel</TabsTrigger>
                    <TabsTrigger value="pmesii" className="flex-1">PMESII</TabsTrigger>
                    <TabsTrigger value="risk" className="flex-1">Risk</TabsTrigger>
                  </TabsList>
                  <TabsContent value="intelligence" className="flex-1 p-3 overflow-auto">
                    <IntelligenceIntegration />
                  </TabsContent>
                  <TabsContent value="pmesii" className="flex-1 p-3 overflow-auto">
                    <PMESIIBriefing aoi={currentAOI} />
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
      
      {/* Chat Panel - Docked at bottom */}
      <div className={cn(
        "border-t flex-shrink-0 flex flex-col",
        isChatOpen ? "h-64" : "h-12"
      )}>
        <button
          onClick={onToggleChat}
          className="w-full h-12 flex-shrink-0 px-4 flex items-center justify-between bg-muted/50 hover-elevate"
          data-testid="button-toggle-chat"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Chat Assistant
          </span>
          {isChatOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
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
    </div>
  )
}
