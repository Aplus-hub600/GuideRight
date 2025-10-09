import { useState, useEffect } from "react"
import { ChatPanel } from "./chat-panel"
import { GoogleMapPanel } from "./google-map-panel"
import { PMESIITest } from "./pmesii-test"
import { RiskAssessment } from "./risk-assessment"
import { IntelligenceIntegration } from "./intelligence-integration"
import { AnalysisPanel } from "./analysis-panel"
import { FileDrop } from "./file-drop"
import { WeatherPanel } from "./weather-panel"
import { SocialMediaPanel } from "./social-media-panel"
import { ExportPanel } from "./export-panel"
import { ScreenshotFAB } from "./screenshot-fab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, TrendingUp, Shield, X, CloudRain, Share2, BarChart3, Clock, Upload } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { NavSection } from "./bottom-nav-bar"
import Timeline from "@/pages/timeline"
import Analytics from "@/pages/analytics"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface MovementPlan {
  route: Array<{ lat: number; lng: number }>
  rationale: string
}

interface DashboardProps {
  className?: string
  activeTopPanel: NavSection | null
  activeBottomPanel: NavSection | null
  currentAOI: AOI
  onAOIChange: (aoi: AOI) => void
  onMediaContextChange?: (ids: string[]) => void
}

export function Dashboard({ className, activeTopPanel, activeBottomPanel, currentAOI, onAOIChange, onMediaContextChange }: DashboardProps) {
  const { t } = useTranslation()
  const [riskScore, setRiskScore] = useState(67)
  const [riskLevel, setRiskLevel] = useState('Moderate')
  const [movementPlan, setMovementPlan] = useState<MovementPlan | undefined>()
  const [confidence, setConfidence] = useState({ belief: 0.78, disbelief: 0.12, uncertainty: 0.10 })
  const [isAnalysisPanelVisible, setIsAnalysisPanelVisible] = useState(false)

  const handleRiskUpdate = (score: number, level: string) => {
    setRiskScore(score)
    setRiskLevel(level)
  }

  const handleMovementPlanRequest = () => {
    setMovementPlan({
      route: [
        { lat: currentAOI.lat - 0.02, lng: currentAOI.lng - 0.02 },
        { lat: currentAOI.lat - 0.01, lng: currentAOI.lng + 0.01 },
        { lat: currentAOI.lat + 0.01, lng: currentAOI.lng + 0.015 },
        { lat: currentAOI.lat + 0.02, lng: currentAOI.lng - 0.01 }
      ],
      rationale: "Route avoids high-risk checkpoints identified in sector 7. Utilizes covered approach through industrial district. Cell coverage optimal along corridor. Hospital access available at waypoint 2."
    })
  }

  useEffect(() => {
    const handleAnalysisStart = () => {
      setIsAnalysisPanelVisible(true)
    }

    window.addEventListener('guideright:analysis-start', handleAnalysisStart)
    return () => window.removeEventListener('guideright:analysis-start', handleAnalysisStart)
  }, [])

  const handleFileAnalysis = (fileId: string, items: any[]) => {
    // File analysis completed
  }

  const handleMediaContextChange = (ids: string[]) => {
    if (onMediaContextChange) {
      onMediaContextChange(ids)
    }
  }

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600' }
    if (score < 60) return { level: 'Moderate', color: 'text-yellow-600' }
    if (score < 80) return { level: 'High', color: 'text-orange-600' }
    return { level: 'Critical', color: 'text-red-600' }
  }

  const riskInfo = getRiskLevel(riskScore)

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Main content area - map and panels */}
      <div className="relative h-full w-full">
        {/* Full viewport map - base layer */}
        <div className="absolute inset-0 z-0 h-full w-full" id="map-view-container">
          <GoogleMapPanel
            aoi={currentAOI}
            riskScore={riskScore}
            movementPlan={movementPlan}
            onAOIChange={onAOIChange}
            onMovementPlanRequest={handleMovementPlanRequest}
            className="h-full w-full"
          />
        </div>

        {/* Map Screenshot FAB - only visible when no panels are active */}
        {!activeTopPanel && !activeBottomPanel && (
          <ScreenshotFAB 
            elementId="map-view-container"
            viewName="map"
            className="absolute bottom-14 right-4 z-20"
          />
        )}

        {/* Top container - 50% width, 60% height, centered - for right nav items (intelligence, analytics, social) */}
        {activeTopPanel && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[50%] h-[60%] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-blue-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.4)] border-2 border-blue-500/40 overflow-hidden h-full flex flex-col">
              {/* Intelligence */}
            {activeTopPanel === "intelligence" && (
              <>
                <div className="p-5 border-b-2 border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-transparent">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                    <TrendingUp className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Intelligence Analysis
                  </h2>
                </div>
                <div className="flex-1 overflow-hidden p-4" data-testid="panel-intel">
                  <Tabs defaultValue="intelligence" className="h-full flex flex-col">
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 w-full">
                      <TabsTrigger value="intelligence" data-testid="tab-intelligence" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm flex-1">Intel</TabsTrigger>
                      <TabsTrigger value="pmesii" data-testid="tab-pmesii" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm flex-1">PMESII</TabsTrigger>
                      <TabsTrigger value="risk" data-testid="tab-risk" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm flex-1">Risk</TabsTrigger>
                    </TabsList>
                    <TabsContent value="intelligence" className="flex-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <IntelligenceIntegration className="h-full" />
                    </TabsContent>
                    <TabsContent value="pmesii" className="flex-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <PMESIITest aoi={currentAOI} className="h-full" />
                    </TabsContent>
                    <TabsContent value="risk" className="flex-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <RiskAssessment 
                        aoi={currentAOI} 
                        onRiskUpdate={handleRiskUpdate}
                        className="h-full" 
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}

            {/* Analytics */}
            {activeTopPanel === "analytics" && (
              <>
                <div className="p-5 border-b-2 border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-transparent">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                    <BarChart3 className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Analytics Dashboard
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto" data-testid="panel-analytics">
                  <Analytics />
                </div>
              </>
            )}

            {/* Social Media */}
            {activeTopPanel === "social" && (
              <>
                <div className="p-5 border-b-2 border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-transparent">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                    <Share2 className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Social Media Intelligence
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4" data-testid="panel-social">
                  <SocialMediaPanel data-testid="social-media-panel-main" />
                </div>
              </>
            )}
            </div>
          </div>
        )}

        {/* Bottom container - 45% width, 20% height, positioned right of chat - for left nav items (timeline, weather, files, settings) */}
        {activeBottomPanel && (
          <div className="absolute bottom-14 left-[22rem] right-4 z-20 h-[20%] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-blue-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.4)] border-2 border-blue-500/40 overflow-hidden h-full flex flex-col">
              {/* Timeline */}
              {activeBottomPanel === "timeline" && (
              <>
                <div className="p-5 border-b-2 border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-transparent">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                    <Clock className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Event Timeline
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto" data-testid="panel-timeline">
                  <Timeline />
                </div>
              </>
              )}

              {/* Weather */}
              {activeBottomPanel === "weather" && (
              <>
                <div className="p-5 border-b-2 border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-transparent">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                    <CloudRain className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Weather Intelligence
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4" data-testid="panel-weather">
                  <WeatherPanel data-testid="weather-panel-main" />
                </div>
              </>
              )}

              {/* Files */}
              {activeBottomPanel === "files" && (
              <>
                <div className="p-5 border-b-2 border-blue-500/30 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-transparent">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400">
                    <Upload className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Media Analysis
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4" data-testid="panel-files">
                  <FileDrop 
                    onAnalysisComplete={handleFileAnalysis}
                    onFilesChange={handleMediaContextChange}
                    maxFiles={5}
                    compact={false}
                  />
                </div>
              </>
              )}

              {/* Export & Feedback (formerly Settings) */}
              {activeBottomPanel === "settings" && (
                <div className="flex-1 overflow-y-auto" data-testid="panel-export">
                  <ExportPanel 
                    currentAOI={currentAOI}
                    activeTopPanel={activeTopPanel}
                    activeBottomPanel={activeBottomPanel}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Panel - already floating */}
        <AnalysisPanel 
          isVisible={isAnalysisPanelVisible} 
          onClose={() => setIsAnalysisPanelVisible(false)}
        />
      </div>
    </div>
  )
}
