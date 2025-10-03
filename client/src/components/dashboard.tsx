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
  activePanels: Set<NavSection>
  currentAOI: AOI
  onAOIChange: (aoi: AOI) => void
}

export function Dashboard({ className, activePanels, currentAOI, onAOIChange }: DashboardProps) {
  const { t } = useTranslation()
  const [riskScore, setRiskScore] = useState(67)
  const [riskLevel, setRiskLevel] = useState('Moderate')
  const [movementPlan, setMovementPlan] = useState<MovementPlan | undefined>()
  const [mediaContextIds, setMediaContextIds] = useState<string[]>([])
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

  const handleQuerySubmit = (query: string, contextIds?: string[]) => {
    console.log('Query submitted:', query, 'with context:', contextIds)
  }

  const handleFileAnalysis = (fileId: string, items: any[]) => {
    console.log('File analysis completed:', fileId, items)
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
      {/* Full viewport map - base layer */}
      <div className="absolute inset-0 z-0">
        <GoogleMapPanel
          aoi={currentAOI}
          riskScore={riskScore}
          movementPlan={movementPlan}
          onAOIChange={onAOIChange}
          onMovementPlanRequest={handleMovementPlanRequest}
          className="h-full w-full"
        />
      </div>

      {/* Bottom panels container - above nav bar, spanning most of width */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-7xl">
        <div className="flex flex-col-reverse gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto pb-4">
          {/* Timeline Panel */}
          {activePanels.has("timeline") && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden flex-shrink-0" data-testid="panel-timeline">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Timeline
                </h2>
              </div>
              <div className="overflow-y-auto max-h-80">
                <Timeline />
              </div>
            </div>
          )}

          {/* Weather Panel */}
          {activePanels.has("weather") && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden flex-shrink-0" data-testid="panel-weather">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                  <CloudRain className="h-4 w-4 text-blue-600" />
                  Weather Intelligence
                </h2>
              </div>
              <div className="overflow-y-auto max-h-80 p-4">
                <WeatherPanel data-testid="weather-panel-main" />
              </div>
            </div>
          )}

          {/* Analytics Panel */}
          {activePanels.has("analytics") && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden flex-shrink-0" data-testid="panel-analytics">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Analytics Dashboard
                </h2>
              </div>
              <div className="overflow-y-auto max-h-80">
                <Analytics />
              </div>
            </div>
          )}

          {/* Social Media Panel */}
          {activePanels.has("social") && (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden flex-shrink-0" data-testid="panel-social">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                  <Share2 className="h-4 w-4 text-blue-600" />
                  Social Media Intelligence
                </h2>
              </div>
              <div className="overflow-y-auto max-h-80 p-4">
                <SocialMediaPanel data-testid="social-media-panel-main" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top left AOI info panel - floating */}
      <div className="absolute top-4 left-4 z-20 w-80" data-testid="panel-aoi-info">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
              <Target className="h-4 w-4 text-blue-600" />
              Current AOI
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-6 h-4 rounded-sm relative overflow-hidden"
                    style={{ backgroundColor: '#006A4E' }}
                    data-testid="img-flag-bangladesh"
                    title="Bangladesh Flag"
                  >
                    <div 
                      className="absolute w-2.5 h-2.5 rounded-full"
                      style={{ 
                        backgroundColor: '#F42A41',
                        top: '50%',
                        left: '30%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  <p className="font-medium text-gray-800">{currentAOI.name || "Unknown Location"}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {currentAOI.lat.toFixed(4)}, {currentAOI.lng.toFixed(4)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Risk:</span>
                <span className={`text-sm px-2 py-1 rounded-lg font-medium ${
                  riskScore < 30 ? 'bg-green-100 text-green-800' :
                  riskScore < 60 ? 'bg-yellow-100 text-yellow-800' :
                  riskScore < 80 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {riskInfo.level} ({riskScore}/100)
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Confidence</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${confidence.belief * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel - floating, toggleable */}
      {activePanels.has("chat") && (
        <div className="absolute left-4 bottom-24 z-20 w-96 max-h-[60vh]" data-testid="panel-chat-floating">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-800">Chat Assistant</h2>
            </div>
            <ChatPanel 
              onQuerySubmit={handleQuerySubmit}
              mediaContextIds={mediaContextIds}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {/* Intelligence Panel - floating, toggleable */}
      {activePanels.has("intelligence") && (
        <div className="absolute right-4 bottom-24 z-20 w-96 max-h-[70vh]" data-testid="panel-intel-floating">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-medium text-gray-800">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Intelligence Analysis
              </h2>
            </div>
            <div className="flex-1 overflow-hidden p-4">
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
          </div>
        </div>
      )}

      {/* Files Panel - floating, toggleable */}
      {activePanels.has("files") && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-20 w-96" data-testid="panel-files-floating">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">Media Analysis</h3>
            </div>
            <div className="p-4">
              <FileDrop 
                onAnalysisComplete={handleFileAnalysis}
                onFilesChange={setMediaContextIds}
                maxFiles={5}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analysis Panel - already floating */}
      <AnalysisPanel 
        isVisible={isAnalysisPanelVisible} 
        onClose={() => setIsAnalysisPanelVisible(false)}
      />
    </div>
  )
}
