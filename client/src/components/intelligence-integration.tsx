import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Users, 
  Target,
  Gauge,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnalysisResult } from "@shared/schema"

interface IntelligenceReport {
  title: string
  occurred: string
  severity: number
  events: string
  summary: string
  location?: string
  coordinates?: { lat: number; lng: number }
}

interface IntelligenceIntegrationProps {
  className?: string
}

// Real intelligence data from the attached file
const dhakaIntelligence: IntelligenceReport = {
  title: "Two Drug Dealers Arrested With 6,000 Yaba Pills in Dhaka's Jatrabari",
  occurred: "2025-06-26T11:01:23.485Z",
  severity: 1,
  events: "Crime",
  summary: "Dhaka Metropolitan Police's Jatrabari Thana police arrested Md. Alamgir Hossain, 45, and Md. Jihad, 20, with 6,000 pieces of yaba from Raerbagh Khan Bari intersection in Jatrabari on Wednesday around 9:45 pm. Acting on a tip, police raided a flat on the 10th floor of VIP Tower-2 where the suspects were allegedly conducting drug trafficking operations.",
  location: "Jatrabari, Dhaka",
  coordinates: { lat: 23.7084, lng: 90.4301 }
}

// Enhanced intelligence analysis based on the real data
const enhancedAnalysis = {
  threats: [
    "Active drug trafficking network in Jatrabari district",
    "High-value narcotics cache (6,000 yaba pills) indicates organized operation",
    "Multi-story residential buildings used for criminal operations",
    "Suspects aged 20-45 suggesting recruitment across age groups"
  ],
  implications: {
    political: "Law enforcement operations indicate government anti-drug priorities",
    military: "No direct military implications, civilian law enforcement matter",
    economic: "Significant drug trade disruption, estimated street value analysis needed",
    social: "Community security concerns in Jatrabari residential area",
    information: "Intelligence-driven raid suggests reliable HUMINT sources",
    infrastructure: "VIP Tower-2 compromised, high-rise security vulnerabilities"
  },
  riskFactors: [
    "Ongoing criminal network presence in Jatrabari",
    "Residential area infiltration by trafficking operations",
    "Potential for retaliation or network reorganization",
    "Public safety concerns in densely populated district"
  ],
  confidence: {
    source: 0.95, // Official police report
    location: 0.98, // Specific address provided
    timing: 0.99, // Precise timestamp
    overall: 0.97
  }
}

export function IntelligenceIntegration({ className }: IntelligenceIntegrationProps) {
  const [selectedTab, setSelectedTab] = useState("report")
  
  // Get the ID from URL parameters if navigated from search
  const urlParams = new URLSearchParams(window.location.search)
  const selectedId = urlParams.get('id')
  
  // Fetch analysis results from the API
  const { data: analysisData, isLoading } = useQuery<{ success: boolean; results: AnalysisResult[] }>({
    queryKey: ['/api/analysis/history?analysisType=intelligence'],
    enabled: true
  })
  
  // Get the latest intelligence analysis results
  const intelligenceResults = analysisData?.results || []
  
  const filteredResults = intelligenceResults.filter(
    (result: AnalysisResult) => result.analysisType === 'intelligence'
  ).sort((a: AnalysisResult, b: AnalysisResult) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  // Use the specific intelligence result if ID is provided, otherwise use the first external one
  const currentIntelligence = selectedId 
    ? filteredResults.find((r: AnalysisResult) => r.id === selectedId)
    : filteredResults.find((r: AnalysisResult) => r.source && r.source !== 'internal') || null
    
  
  
  const getSourceBadgeColor = (source: string) => {
    const colors = {
      "fraym": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "seerist": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "sprinklr": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "news": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "social": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      "weather": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      "infra": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
    return colors[source.toLowerCase() as keyof typeof colors] || colors.news
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return "text-red-600 dark:text-red-400"
    if (severity <= 3) return "text-orange-600 dark:text-orange-400"
    return "text-yellow-600 dark:text-yellow-400"
  }

  const getSeverityBadge = (severity: number) => {
    if (severity >= 7) return { label: "HIGH", variant: "destructive" as const }
    if (severity >= 4) return { label: "MEDIUM", variant: "secondary" as const }
    return { label: "LOW", variant: "outline" as const }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Intelligence Alert Header */}
      <Alert className="border-orange-200 dark:border-orange-800">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="font-medium">
          <strong>Real Intelligence Integrated:</strong> Processing live tactical intelligence from Dhaka operations
        </AlertDescription>
      </Alert>

      {/* Main Intelligence Display */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Intelligence Report Integration</CardTitle>
              {currentIntelligence?.source && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs ml-2", getSourceBadgeColor(currentIntelligence.source))}
                  data-testid="badge-intelligence-source"
                >
                  {currentIntelligence.source.toUpperCase()}
                </Badge>
              )}
            </div>
            <Badge {...getSeverityBadge((currentIntelligence?.results as any)?.severity || dhakaIntelligence.severity)}>
              {getSeverityBadge((currentIntelligence?.results as any)?.severity || dhakaIntelligence.severity).label} ({(currentIntelligence?.results as any)?.severity || dhakaIntelligence.severity})
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="report" data-testid="tab-intel-report">Report</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-intel-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="impact" data-testid="tab-intel-impact">PMESII Impact</TabsTrigger>
              <TabsTrigger value="risk" data-testid="tab-intel-risk">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="space-y-4 mt-6 p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg break-words">
                  {(currentIntelligence?.results as any)?.title || dhakaIntelligence.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="break-words">Occurred: {new Date(currentIntelligence?.timestamp || dhakaIntelligence.occurred).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="break-words">{currentIntelligence?.region || dhakaIntelligence.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="break-words">Event Type: {(currentIntelligence?.results as any)?.category || dhakaIntelligence.events}</span>
                  </div>
                  {currentIntelligence?.source && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="break-words">Source: {currentIntelligence.source.toUpperCase()}</span>
                    </div>
                  )}
                  {currentIntelligence?.aoiData && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="break-words">Coordinates: {(currentIntelligence.aoiData as any)?.lat?.toFixed(4)}, {(currentIntelligence.aoiData as any)?.lng?.toFixed(4)}</span>
                    </div>
                  )}
                  {!currentIntelligence && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="break-words">Coordinates: {dhakaIntelligence.coordinates?.lat.toFixed(4)}, {dhakaIntelligence.coordinates?.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-muted/30 p-3 rounded-md">
                  <h4 className="font-medium mb-2">Intelligence Summary:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {(currentIntelligence?.results as any)?.summary || dhakaIntelligence.summary}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4 mt-6 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    Identified Threats
                  </h4>
                  <div className="space-y-2">
                    {enhancedAnalysis.threats.map((threat, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md text-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="break-words">{threat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Intelligence Confidence
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(enhancedAnalysis.confidence).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-muted/30 rounded-md text-sm">
                        <span className="capitalize">{key}:</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(value * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4 mt-6 p-4">
              <div className="space-y-3">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  PMESII Factor Analysis
                </h4>
                {Object.entries(enhancedAnalysis.implications).map(([factor, implication]) => (
                  <div key={factor} className="border-l-4 border-l-blue-500 pl-3 py-2">
                    <h5 className="font-medium text-sm uppercase tracking-wide mb-1">
                      {factor === 'information' ? 'Information' : 
                       factor === 'infrastructure' ? 'Infrastructure' : 
                       factor.charAt(0).toUpperCase() + factor.slice(1)}
                    </h5>
                    <p className="text-sm text-muted-foreground break-words">{implication}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4 mt-6 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Risk Factors Assessment
                  </h4>
                  <div className="space-y-2">
                    {enhancedAnalysis.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md text-sm">
                        <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                        <span className="break-words">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-amber-200 dark:border-amber-800">
                  <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="break-words">
                    <strong>Tactical Recommendation:</strong> Increase surveillance in Jatrabari district, 
                    monitor VIP Tower residential complexes, and assess potential network expansion. 
                    Coordinate with local law enforcement for ongoing intelligence gathering.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}