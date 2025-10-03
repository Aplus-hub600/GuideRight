import { useState, useEffect } from "react"
import { ChatPanel } from "./chat-panel"
import { GoogleMapPanel } from "./google-map-panel"
import { PMESIITest } from "./pmesii-test"
import { RiskAssessment } from "./risk-assessment"
import { IntelligenceIntegration } from "./intelligence-integration"
import { AnalysisPanel } from "./analysis-panel"
import { FileDrop } from "./file-drop"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Target, TrendingUp, Shield } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

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
}

export function Dashboard({ className }: DashboardProps) {
  const { t } = useTranslation()
  const [currentAOI, setCurrentAOI] = useState<AOI>({
    name: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    radiusKm: 5
  })
  const [riskScore, setRiskScore] = useState(67)
  const [riskLevel, setRiskLevel] = useState('Moderate')
  const [movementPlan, setMovementPlan] = useState<MovementPlan | undefined>()
  const [mediaContextIds, setMediaContextIds] = useState<string[]>([])
  const [confidence, setConfidence] = useState({ belief: 0.78, disbelief: 0.12, uncertainty: 0.10 })
  const [isAnalysisPanelVisible, setIsAnalysisPanelVisible] = useState(false)

  const handleAOIChange = (newAOI: AOI) => {
    console.log('AOI changed:', newAOI)
    setCurrentAOI(newAOI)
    // In real app, this would trigger intelligence gathering
  }

  const handleRiskUpdate = (score: number, level: string) => {
    setRiskScore(score)
    setRiskLevel(level)
  }

  const handleMovementPlanRequest = () => {
    console.log('Movement plan requested for AOI:', currentAOI)
    // Mock movement plan
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

  // Show analysis panel when analysis starts
  useEffect(() => {
    const handleAnalysisStart = () => {
      setIsAnalysisPanelVisible(true)
    }

    window.addEventListener('guideright:analysis-start', handleAnalysisStart)
    return () => window.removeEventListener('guideright:analysis-start', handleAnalysisStart)
  }, [])

  const handleQuerySubmit = (query: string, contextIds?: string[]) => {
    console.log('Query submitted:', query, 'with context:', contextIds)
    // In real app, this would submit to backend API
  }

  const handleFileAnalysis = (fileId: string, items: any[]) => {
    console.log('File analysis completed:', fileId, items)
    // In real app, these items would be added to intelligence database
  }

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600' }
    if (score < 60) return { level: 'Moderate', color: 'text-yellow-600' }
    if (score < 80) return { level: 'High', color: 'text-orange-600' }
    return { level: 'Critical', color: 'text-red-600' }
  }

  const riskInfo = getRiskLevel(riskScore)

  return (
    <div className={cn("h-full bg-gray-50", className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Chat & Controls */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
          <div className="h-full flex flex-col p-4 gap-4">
            {/* AOI Info Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-800">
                  <Target className="h-5 w-5 text-blue-600" />
                  Current AOI
                </h2>
              </div>
              <div className="p-6">
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
                    <span className="text-sm text-gray-700">Risk Assessment:</span>
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

            {/* File Drop - Compact Version */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden flex-shrink-0">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800">Media Analysis</h3>
              </div>
              <div className="p-4">
                <FileDrop 
                  onAnalysisComplete={handleFileAnalysis}
                  onFilesChange={setMediaContextIds}
                  maxFiles={2}
                  compact={true}
                />
              </div>
            </div>

            {/* Chat Panel */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden flex-1 min-h-0">
              <ChatPanel 
                onQuerySubmit={handleQuerySubmit}
                mediaContextIds={mediaContextIds}
                className="h-full"
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Map */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="relative h-full">
            <GoogleMapPanel
              aoi={currentAOI}
              riskScore={riskScore}
              movementPlan={movementPlan}
              onAOIChange={handleAOIChange}
              onMovementPlanRequest={handleMovementPlanRequest}
              className="h-full"
            />
            {/* Analysis Panel Overlay */}
            <AnalysisPanel 
              isVisible={isAnalysisPanelVisible} 
              onClose={() => setIsAnalysisPanelVisible(false)}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Intelligence Analysis */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full p-4">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-800">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Intelligence Analysis
                </h2>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                <Tabs defaultValue="intelligence" className="h-full flex flex-col">
                  <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 w-full">
                    <TabsTrigger value="intelligence" data-testid="tab-intelligence" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm flex-1">Intelligence</TabsTrigger>
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}