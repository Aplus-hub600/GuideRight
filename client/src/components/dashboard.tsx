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
import { Target, TrendingUp, Shield, X, CloudRain, Share2, BarChart3, Clock } from "lucide-react"
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
    console.log('Movement plan requested for AOI:', currentAOI)
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
    console.log('File analysis completed:', fileId, items)
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
      <div className="relative h-full">
        {/* Full viewport map - base layer */}
        <div className="absolute inset-0 z-0" id="map-view-container">
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

        {/* Top container - 80% width, 60% height, centered - for right nav items (intelligence, analytics, social) */}
        {activeTopPanel && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[80%] h-[60%]">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
              {/* Intelligence */}
            {activeTopPanel === "intelligence" && (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
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
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
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
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                    <Share2 className="h-4 w-4 text-blue-600" />
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

        {/* Bottom container - 80% width, 20% height, centered, above nav - for left nav items (timeline, weather, files, settings) */}
        {activeBottomPanel && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 w-[80%] h-[20%]">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
              {/* Timeline */}
              {activeBottomPanel === "timeline" && (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Timeline
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
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                    <CloudRain className="h-4 w-4 text-blue-600" />
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
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-800">Media Analysis</h3>
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
