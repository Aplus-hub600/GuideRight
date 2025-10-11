import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Users,
  Shield,
  DollarSign,
  Users2,
  Radio,
  Building,
  Globe,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface PMESIITestProps {
  aoi: AOI
  className?: string
  odinCountry?: string
}

// Test data for PMESII analysis - simulating realistic Bangladesh intelligence
const testPMESIIData = {
  political: {
    summary: "Bangladesh maintains stable democratic governance with ongoing political tensions between major parties. Recent local elections show increased participation in urban areas.",
    keyPoints: [
      "Prime Minister Sheikh Hasina's Awami League maintains parliamentary majority",
      "Opposition BNP activities limited but present in Dhaka region",
      "Local government cooperation strong with law enforcement",
      "Democratic institutions functioning with regular electoral cycles"
    ],
    threats: [
      "Political demonstrations may disrupt operations in central Dhaka",
      "Opposition rallies scheduled near government buildings",
      "Student political groups active in university areas"
    ],
    capabilities: [
      "Strong central government authority and coordination",
      "Effective local administration and police cooperation",
      "Established diplomatic relations with international partners"
    ],
    score: 0.72
  },
  military: {
    summary: "Bangladesh Armed Forces maintain professional standards with strong counter-terrorism capabilities. Joint operations with international partners are well-coordinated.",
    keyPoints: [
      "Bangladesh Army well-trained with modern equipment",
      "Rapid Action Battalion (RAB) effective in counter-terrorism",
      "Border Guard Bangladesh secures international borders",
      "Strong coordination between military and civilian authorities"
    ],
    threats: [
      "Limited air defense capabilities in urban areas",
      "Potential for militant infiltration from border regions",
      "Coordination challenges during large-scale operations"
    ],
    capabilities: [
      "Professional officer corps with international training",
      "Effective special operations and counter-terrorism units",
      "Strong logistics and medical support infrastructure"
    ],
    score: 0.78
  },
  economic: {
    summary: "Bangladesh shows strong economic growth with expanding textile and manufacturing sectors. Infrastructure development ongoing in major cities.",
    keyPoints: [
      "GDP growth averaging 6-7% annually",
      "Major textile and garment manufacturing hub",
      "Dhaka Stock Exchange showing steady performance",
      "Significant infrastructure investment in transportation"
    ],
    threats: [
      "Economic inequality may fuel social tensions",
      "Currency fluctuations affecting import-dependent sectors",
      "Banking sector vulnerabilities in some institutions"
    ],
    capabilities: [
      "Strong manufacturing base and export economy",
      "Growing IT and telecommunications sector",
      "Substantial remittances from overseas workers"
    ],
    score: 0.69
  },
  social: {
    summary: "Bangladeshi society shows resilience with strong community bonds. Urban-rural divide remains significant with ongoing migration to cities.",
    keyPoints: [
      "Population of 165+ million with young demographic",
      "Strong Islamic cultural identity with secular governance",
      "Increasing urbanization and migration to Dhaka",
      "Improving literacy rates and women's participation"
    ],
    threats: [
      "Religious extremism potential in marginalized communities",
      "Urban overcrowding straining public services",
      "Drug trafficking networks exploiting social vulnerabilities"
    ],
    capabilities: [
      "Strong community networks and social cohesion",
      "Resilient population with disaster response experience",
      "Active civil society and NGO presence"
    ],
    score: 0.65
  },
  information: {
    summary: "Information environment shows mix of traditional and digital media. Social media adoption high among urban youth with government monitoring.",
    keyPoints: [
      "High mobile phone penetration (190+ million subscribers)",
      "Growing internet usage with 4G/5G expansion",
      "Active social media presence across platforms",
      "Traditional media still influential in rural areas"
    ],
    threats: [
      "Misinformation campaigns during political tensions",
      "Potential for foreign influence through social media",
      "Cyber security vulnerabilities in government systems"
    ],
    capabilities: [
      "Effective government communication channels",
      "Strong telecommunications infrastructure",
      "Growing digital literacy and technology adoption"
    ],
    score: 0.71
  },
  infrastructure: {
    summary: "Infrastructure development accelerating with major projects in transportation and energy. Urban infrastructure faces capacity challenges.",
    keyPoints: [
      "Padma Bridge project enhancing connectivity",
      "Metro rail construction underway in Dhaka",
      "Power generation capacity expanding rapidly",
      "Port facilities handling increased trade volumes"
    ],
    threats: [
      "Aging infrastructure in old Dhaka areas",
      "Monsoon flooding affecting transportation networks",
      "Power grid vulnerabilities during peak demand"
    ],
    capabilities: [
      "Major infrastructure projects nearing completion",
      "Improving road and highway networks",
      "Expanding telecommunications and digital infrastructure"
    ],
    score: 0.67
  }
}

const factorIcons = {
  political: Users,
  military: Shield,
  economic: DollarSign,
  social: Users2,
  information: Radio,
  infrastructure: Building
}

// Helper function to parse ODIN text into structured data
function parseODINText(text: string): { 
  summary: string
  keyPoints: string[]
  threats: string[]
  capabilities: string[]
  score: number
} {
  // Split by newlines and clean up
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
  
  // Use first few lines as summary (up to 250 chars)
  const summaryText = lines.slice(0, 3).join(' ')
  const summary = summaryText.length > 250 ? summaryText.substring(0, 250) + '...' : summaryText
  
  // Extract all meaningful lines (minimum 10 chars instead of 20)
  const meaningfulLines = lines.filter(l => l.length >= 10)
  
  // Distribute lines across categories
  const keyPoints: string[] = []
  const threats: string[] = []
  const capabilities: string[] = []
  
  // Take at least 3 key points, 2 threats, 2 capabilities from available lines
  for (let i = 0; i < Math.min(meaningfulLines.length, 10); i++) {
    const line = meaningfulLines[i].substring(0, 120)
    if (keyPoints.length < 3) {
      keyPoints.push(line)
    } else if (threats.length < 2) {
      threats.push(line)
    } else if (capabilities.length < 2) {
      capabilities.push(line)
    }
  }
  
  // Ensure we have at least some content even if ODIN data is sparse
  if (keyPoints.length === 0) {
    keyPoints.push('ODIN intelligence data available for this region')
  }
  if (threats.length === 0) {
    threats.push('Regional threat assessment data from ODIN')
  }
  if (capabilities.length === 0) {
    capabilities.push('Capability analysis from ODIN training scenarios')
  }
  
  // Generate a score based on content length
  const score = Math.min(0.9, 0.6 + (meaningfulLines.length / 20))
  
  return { summary, keyPoints, threats, capabilities, score }
}

export function PMESIITest({ aoi, className, odinCountry }: PMESIITestProps) {
  const [selectedFactor, setSelectedFactor] = useState<string>("political")
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch ODIN data when country is selected
  const { data: odinData, isLoading: odinLoading } = useQuery<{
    success: boolean
    country: string
    data?: Record<string, string>
    partialData?: Record<string, string>
    partial?: boolean
    warnings?: string
  }>({
    queryKey: [`/api/odin/country/${odinCountry}`],
    enabled: !!odinCountry
  })

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  // Prepare data based on source (ODIN or test data)
  const pmesiiData = odinCountry && odinData?.success ? 
    Object.entries(odinData.data || odinData.partialData || {}).reduce((acc, [key, value]) => {
      const parsed = parseODINText(value)
      acc[key] = parsed
      return acc
    }, {} as Record<string, any>) : testPMESIIData

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-neutral-400"
    if (score >= 0.8) return "text-green-400"
    if (score >= 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreIcon = (score?: number) => {
    if (score === undefined || score === null) return <XCircle className="h-5 w-5 text-neutral-400" />
    if (score >= 0.8) return <CheckCircle2 className="h-5 w-5 text-green-400" />
    if (score >= 0.6) return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    return <XCircle className="h-5 w-5 text-red-400" />
  }

  const selectedData = pmesiiData[selectedFactor as keyof typeof pmesiiData]
  const isODINMode = !!odinCountry && odinData?.success

  return (
    <div className={cn("space-y-4", className)}>
      {/* Data Source Alert */}
      {odinLoading ? (
        <Alert className="border-blue-200 dark:border-blue-800">
          <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
          <AlertDescription className="text-base font-medium text-neutral-200">
            Loading ODIN intelligence data for {odinCountry}...
          </AlertDescription>
        </Alert>
      ) : isODINMode ? (
        <Alert className="border-green-200 dark:border-green-800">
          <Globe className="h-5 w-5 text-green-400" />
          <AlertDescription className="text-base font-medium text-neutral-200">
            <strong>ODIN Data:</strong> Real training scenario intelligence for {odinCountry}
            {odinData.partial && <span className="text-yellow-400"> (Partial data)</span>}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-blue-200 dark:border-blue-800">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <AlertDescription className="text-base font-medium text-neutral-200">
            <strong>Test Mode:</strong> Using realistic test data for Bangladesh operations analysis
          </AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
          PMESII Analysis {isODINMode ? `- ${odinCountry}` : '- Test Mode'}
        </h3>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || odinLoading}
          size="sm"
          data-testid="button-generate-pmesii-test"
        >
          {isGenerating ? 'Generating...' : isODINMode ? 'Refresh Analysis' : 'Generate Test Analysis'}
        </Button>
      </div>

      {/* Factor Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(pmesiiData).map(([factor, data]) => {
          const IconComponent = factorIcons[factor as keyof typeof factorIcons]
          return (
            <Card 
              key={factor}
              className={cn(
                "cursor-pointer transition-colors hover-elevate",
                selectedFactor === factor && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedFactor(factor)}
              data-testid={`card-factor-${factor}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-blue-400" />
                    <span className="text-base font-medium capitalize text-neutral-200">{factor}</span>
                  </div>
                  {(data.score !== undefined && data.score !== null) && (
                    <Badge variant="outline" className="text-base font-medium">
                      {Math.round(data.score * 100)}%
                    </Badge>
                  )}
                </div>
                {(data.score !== undefined && data.score !== null) && (
                  <Progress value={data.score * 100} className="h-1" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Factor Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {(() => {
              const IconComponent = factorIcons[selectedFactor as keyof typeof factorIcons]
              return <IconComponent className="h-5 w-5 text-blue-400" />
            })()}
            <CardTitle className="capitalize text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{selectedFactor} Analysis</CardTitle>
            <div className="flex items-center gap-1 ml-auto">
              {getScoreIcon(selectedData.score)}
              <span className={cn("text-base font-medium", getScoreColor(selectedData.score))}>
                {selectedData.score ? Math.round(selectedData.score * 100) : 0}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
              <TabsTrigger value="keypoints" data-testid="tab-keypoints">Key Points</TabsTrigger>
              <TabsTrigger value="threats" data-testid="tab-threats">Threats</TabsTrigger>
              <TabsTrigger value="capabilities" data-testid="tab-capabilities">Capabilities</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="space-y-3">
                <p className="text-base font-medium leading-relaxed break-words text-neutral-200">{selectedData.summary}</p>
                {(selectedData.score !== undefined && selectedData.score !== null) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium text-neutral-200">Stability Score</span>
                      <span className={cn("text-base font-medium", getScoreColor(selectedData.score))}>
                        {Math.round(selectedData.score * 100)}%
                      </span>
                    </div>
                    <Progress value={selectedData.score * 100} className="h-2" />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="keypoints" className="mt-4">
              <div className="space-y-2">
                {selectedData.keyPoints?.map((point: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded-md">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-base font-medium text-neutral-200 break-words">{point}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="threats" className="mt-4">
              <div className="space-y-2">
                {selectedData.threats?.map((threat: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base font-medium text-neutral-200 break-words">{threat}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="mt-4">
              <div className="space-y-2">
                {selectedData.capabilities?.map((capability: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-base font-medium text-neutral-200 break-words">{capability}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}