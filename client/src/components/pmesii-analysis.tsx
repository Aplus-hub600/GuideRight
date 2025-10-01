import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Building, 
  Shield, 
  TrendingUp, 
  Users, 
  Radio, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type PMESIICategory = "political" | "military" | "economic" | "social" | "information" | "infrastructure"

interface PMESIIFactorAnalysis {
  summary: string
  keyPoints?: string[]
  threats?: string[]
  capabilities?: string[]
  indicators?: string[]
  demographics?: string[]
  tensions?: string[]
  mediaControl?: string
  propaganda?: string[]
  criticalAssets?: string[]
  vulnerabilities?: string[]
  stabilityScore?: number
  readinessScore?: number
  reliabilityScore?: number
  integrityScore?: number
}

interface PMESIIAnalysis {
  political: PMESIIFactorAnalysis
  military: PMESIIFactorAnalysis
  economic: PMESIIFactorAnalysis
  social: PMESIIFactorAnalysis
  information: PMESIIFactorAnalysis
  infrastructure: PMESIIFactorAnalysis
}

interface AOI {
  name: string
  lat: number
  lng: number
  radiusKm: number
}

interface PMESIIAnalysisProps {
  aoi: AOI
  className?: string
}

const pmesiiConfig = {
  political: {
    icon: Building,
    label: "Political",
    color: "text-blue-600 dark:text-blue-400"
  },
  military: {
    icon: Shield,
    label: "Military", 
    color: "text-green-600 dark:text-green-400"
  },
  economic: {
    icon: TrendingUp,
    label: "Economic",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  social: {
    icon: Users,
    label: "Social",
    color: "text-purple-600 dark:text-purple-400"
  },
  information: {
    icon: Radio,
    label: "Information",
    color: "text-orange-600 dark:text-orange-400"
  },
  infrastructure: {
    icon: Zap,
    label: "Infrastructure",
    color: "text-red-600 dark:text-red-400"
  }
}

export function PMESIIAnalysis({ aoi, className }: PMESIIAnalysisProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<PMESIICategory>("political")
  const [lastAnalyzedAOI, setLastAnalyzedAOI] = useState<string>("")

  // Fetch existing PMESII analysis for current AOI
  const { data: analysisData, isLoading, error } = useQuery({
    queryKey: ['/api/analysis/history', 'pmesii', aoi.name],
    queryFn: () => fetch(`/api/analysis/history?analysisType=pmesii&region=${encodeURIComponent(aoi.name)}`).then(res => res.json()),
    enabled: true
  })

  // PMESII analysis mutation
  const pmesiiMutation = useMutation({
    mutationFn: async (params: { region: string; context?: string }) => {
      const response = await fetch('/api/analysis/pmesii', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Analysis failed: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: (data) => {
      console.log('PMESII analysis successful:', data)
      setLastAnalyzedAOI(aoi.name)
      queryClient.invalidateQueries({ queryKey: ['/api/analysis/history', 'pmesii', aoi.name] })
      
      toast({
        title: "PMESII Analysis Complete",
        description: `Successfully analyzed ${aoi.name} across all PMESII factors`,
      })
    },
    onError: (error: Error) => {
      console.error('PMESII analysis error:', error)
      
      toast({
        variant: "destructive",
        title: error.message.includes('quota') ? "API Quota Exceeded" : "Analysis Failed",
        description: error.message.includes('quota') 
          ? "AI service quota exceeded. Please try again later."
          : `Failed to analyze ${aoi.name}: ${error.message}`,
      })
    }
  })

  const triggerAnalysis = () => {
    const context = `Area of Interest: ${aoi.name} (${aoi.lat}, ${aoi.lng}) with ${aoi.radiusKm}km radius. Conduct comprehensive PMESII analysis for tactical operations.`
    
    pmesiiMutation.mutate({
      region: aoi.name,
      context,
      aoi: {
        name: aoi.name,
        lat: aoi.lat,
        lng: aoi.lng,
        radiusKm: aoi.radiusKm
      }
    })
  }

  // Get the latest PMESII analysis from stored results
  const getLatestPMESIIAnalysis = (): PMESIIAnalysis | null => {
    if (!analysisData || !analysisData.results || !Array.isArray(analysisData.results)) return null
    
    const pmesiiAnalyses = analysisData.results
      .filter((result: any) => result.analysisType === 'pmesii')
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return pmesiiAnalyses.length > 0 ? pmesiiAnalyses[0].results : null
  }

  const analysis = getLatestPMESIIAnalysis()
  const hasAnalysis = !!analysis
  const isAnalyzing = pmesiiMutation.isPending

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-muted-foreground"
    if (score >= 0.8) return "text-green-600 dark:text-green-400"
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreIcon = (score?: number) => {
    if (score === undefined || score === null) return <XCircle className="h-4 w-4 text-muted-foreground" />
    if (score >= 0.8) return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
    if (score >= 0.6) return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
    return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
  }

  const renderFactorContent = (factor: PMESIIFactorAnalysis, category: PMESIICategory) => {
    const scoreKey = category === 'military' ? 'readinessScore' :
                    category === 'information' ? 'reliabilityScore' :
                    category === 'infrastructure' ? 'integrityScore' :
                    'stabilityScore'
    
    const score = factor[scoreKey as keyof PMESIIFactorAnalysis] as number

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div>
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground break-words">{factor.summary}</p>
        </div>

        {/* Score */}
        {(score !== undefined && score !== null) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">
                {category === 'military' ? 'Readiness' :
                 category === 'information' ? 'Reliability' :
                 category === 'infrastructure' ? 'Integrity' :
                 'Stability'} Score
              </span>
              {getScoreIcon(score)}
            </div>
            <Progress value={score * 100} className="h-2" />
          </div>
        )}

        {/* Key Points/Threats/Capabilities */}
        {factor.keyPoints && factor.keyPoints.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Key Points</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="break-words">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {factor.threats && factor.threats.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Threats</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.threats.map((threat, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                  <span>{threat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {factor.capabilities && factor.capabilities.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Capabilities</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.capabilities.map((capability, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Other category-specific fields */}
        {factor.indicators && factor.indicators.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Economic Indicators</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.indicators.map((indicator, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {factor.demographics && factor.demographics.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Demographics</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.demographics.map((demo, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{demo}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {factor.criticalAssets && factor.criticalAssets.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Critical Assets</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.criticalAssets.map((asset, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{asset}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {factor.vulnerabilities && factor.vulnerabilities.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Vulnerabilities</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {factor.vulnerabilities.map((vuln, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                  <span>{vuln}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header with analysis trigger */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">PMESII Analysis</h3>
          <p className="text-sm text-muted-foreground">
            {hasAnalysis ? `Analysis for ${lastAnalyzedAOI || 'region'}` : 'No analysis available'}
          </p>
        </div>
        <Button
          onClick={triggerAnalysis}
          disabled={isAnalyzing}
          size="sm"
          data-testid="button-trigger-pmesii"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze AOI'}
        </Button>
      </div>

      {/* Analysis Content */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading analysis...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load analysis</p>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/analysis/history', 'pmesii', aoi.name] })} className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && !hasAnalysis && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">No PMESII analysis available</p>
            <Button onClick={triggerAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Generate Analysis
            </Button>
          </div>
        </div>
      )}

      {hasAnalysis && analysis && (
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PMESIICategory)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              {Object.entries(pmesiiConfig).map(([category, config]) => {
                const Icon = config.icon
                const factor = analysis[category as PMESIICategory]
                const scoreKey = category === 'military' ? 'readinessScore' :
                                category === 'information' ? 'reliabilityScore' :
                                category === 'infrastructure' ? 'integrityScore' :
                                'stabilityScore'
                const score = factor[scoreKey as keyof PMESIIFactorAnalysis] as number

                return (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="relative flex flex-col gap-1 p-2"
                    data-testid={`tab-pmesii-${category}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs hidden sm:inline">
                      {config.label}
                    </span>
                    {(score !== undefined && score !== null) && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                      >
                        {Math.round(score * 100)}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {Object.entries(pmesiiConfig).map(([category, config]) => (
              <TabsContent key={category} value={category} className="flex-1 overflow-hidden">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <config.icon className={cn("h-5 w-5", config.color)} />
                      {config.label} Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-[calc(100%-80px)]">
                    <ScrollArea className="h-full">
                      {renderFactorContent(analysis[category as PMESIICategory], category as PMESIICategory)}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}