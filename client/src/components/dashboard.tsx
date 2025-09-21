import { useState } from "react"
import { ChatPanel } from "./chat-panel"
import { MapPanel } from "./map-panel"
import { PMESIITest } from "./pmesii-test"
import { RiskAssessment } from "./risk-assessment"
import { IntelligenceIntegration } from "./intelligence-integration"
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
    <div className={cn("h-full", className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Chat & Controls */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
          <div className="h-full flex flex-col p-4 gap-4">
            {/* AOI Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Current AOI
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      <p className="font-medium">{currentAOI.name || "Unknown Location"}</p>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {currentAOI.lat.toFixed(4)}, {currentAOI.lng.toFixed(4)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Risk Assessment:</span>
                    <Badge variant="outline" className={riskInfo.color}>
                      {riskInfo.level} ({riskScore}/100)
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>{Math.round(confidence.belief * 100)}%</span>
                    </div>
                    <Progress value={confidence.belief * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Drop */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Media Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <FileDrop 
                  onAnalysisComplete={handleFileAnalysis}
                  onFilesChange={setMediaContextIds}
                  maxFiles={3}
                />
              </CardContent>
            </Card>

            {/* Chat Panel */}
            <Card className="flex-1 min-h-0">
              <CardContent className="p-0 h-full">
                <ChatPanel 
                  onQuerySubmit={handleQuerySubmit}
                  mediaContextIds={mediaContextIds}
                  className="h-full"
                />
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Map */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <MapPanel
            aoi={currentAOI}
            riskScore={riskScore}
            movementPlan={movementPlan}
            onAOIChange={handleAOIChange}
            onMovementPlanRequest={handleMovementPlanRequest}
            className="h-full"
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Intelligence Analysis */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full p-4">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Intelligence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 h-[calc(100%-80px)]">
                <Tabs defaultValue="intelligence" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="intelligence" data-testid="tab-intelligence">Intelligence</TabsTrigger>
                    <TabsTrigger value="pmesii" data-testid="tab-pmesii">PMESII</TabsTrigger>
                    <TabsTrigger value="risk" data-testid="tab-risk">Risk</TabsTrigger>
                  </TabsList>
                  <TabsContent value="intelligence" className="h-[calc(100%-40px)] mt-4">
                    <IntelligenceIntegration className="h-full overflow-y-auto" />
                  </TabsContent>
                  <TabsContent value="pmesii" className="h-[calc(100%-40px)] mt-4">
                    <PMESIITest aoi={currentAOI} className="h-full overflow-y-auto" />
                  </TabsContent>
                  <TabsContent value="risk" className="h-[calc(100%-40px)] mt-4">
                    <RiskAssessment 
                      aoi={currentAOI} 
                      onRiskUpdate={handleRiskUpdate}
                      className="h-full overflow-y-auto" 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}