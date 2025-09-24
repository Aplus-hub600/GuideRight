import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Clock,
  MapPin,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { queryClient } from "@/lib/queryClient"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface RiskAssessmentData {
  success: boolean
  riskScore: number
  riskLevel: string
  factors: string[]
  assessment: string
}

interface RiskHistory {
  id: string
  aoi: AOI
  riskScore: number
  riskFactors: string[]
  timestamp: string
}

interface RiskHistoryResponse {
  success: boolean
  results: RiskHistory[]
}

interface RiskAssessmentProps {
  aoi: AOI
  className?: string
  onRiskUpdate?: (score: number, level: string) => void
}

export function RiskAssessment({ aoi, className, onRiskUpdate }: RiskAssessmentProps) {
  const { toast } = useToast()
  const [lastAOI, setLastAOI] = useState<string>('')
  
  // Fetch risk assessment history
  const { data: historyData, isLoading: historyLoading } = useQuery<RiskHistoryResponse>({
    queryKey: ['/api/risk/history'],
    enabled: true
  })

  // Risk assessment mutation
  const riskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/risk/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi })
      })
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error)
      }
      return data as RiskAssessmentData
    },
    onSuccess: (data) => {
      toast({
        title: "Risk Assessment Complete",
        description: `Risk level: ${data.riskLevel} (${data.riskScore}%)`,
      })
      onRiskUpdate?.(data.riskScore, data.riskLevel)
      queryClient.invalidateQueries({ queryKey: ['/api/risk/history'] })
    },
    onError: (error: Error) => {
      if (error.message.includes('quota') || error.message.includes('429')) {
        toast({
          title: "Assessment Quota Exceeded",
          description: "Risk analysis temporarily unavailable. Please try again later.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Assessment Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  })

  const handleAssessRisk = () => {
    riskMutation.mutate()
  }

  // Auto-trigger risk assessment when AOI changes
  useEffect(() => {
    const aoiKey = `${aoi.name}-${aoi.lat}-${aoi.lng}`
    if (aoiKey !== lastAOI) {
      setLastAOI(aoiKey)
      // Debounce to avoid excessive API calls
      const timer = setTimeout(() => {
        if (!riskMutation.isPending) {
          riskMutation.mutate()
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [aoi, lastAOI, riskMutation])

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 dark:text-red-400"
    if (score >= 60) return "text-orange-600 dark:text-orange-400"
    if (score >= 30) return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  const getRiskIcon = (score: number) => {
    if (score >= 80) return <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
    if (score >= 30) return <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
    return <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
  }

  const getRiskVariant = (score: number) => {
    if (score >= 80) return "destructive"
    if (score >= 60) return "secondary"
    return "outline"
  }

  const latestAssessment = historyData?.results?.[0]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Risk Assessment Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Risk Assessment</h3>
        </div>
        <Button
          onClick={handleAssessRisk}
          disabled={riskMutation.isPending}
          size="sm"
          data-testid="button-assess-risk"
        >
          {riskMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          {riskMutation.isPending ? 'Analyzing...' : 'Assess Risk'}
        </Button>
      </div>

      {/* Current AOI Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Assessment for: {aoi.name || "Unknown Location"}</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {aoi.lat.toFixed(4)}, {aoi.lng.toFixed(4)} 
            {aoi.radiusKm && ` (${aoi.radiusKm}km radius)`}
          </div>
        </CardContent>
      </Card>

      {/* Latest Assessment Results */}
      {riskMutation.data && (
        <Alert>
          <div className="flex items-start gap-3">
            {getRiskIcon(riskMutation.data.riskScore)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Current Risk Level:</span>
                <Badge variant={getRiskVariant(riskMutation.data.riskScore)}>
                  {riskMutation.data.riskLevel} ({riskMutation.data.riskScore}%)
                </Badge>
              </div>
              <Progress 
                value={riskMutation.data.riskScore} 
                className="h-2 mb-3" 
                data-testid="progress-risk-score"
              />
              <AlertDescription className="text-sm break-words">
                {riskMutation.data.assessment}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Risk Factors and History */}
      <Tabs defaultValue="factors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="factors" data-testid="tab-risk-factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-risk-history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="factors" className="space-y-3 mt-4">
          {riskMutation.data?.factors.length ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Identified Risk Factors:</h4>
              {riskMutation.data.factors.map((factor, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 p-2 bg-muted/30 rounded-md text-sm"
                  data-testid={`factor-${index}`}
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{factor}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No risk assessment available</p>
              <p className="text-xs">Click "Assess Risk" to analyze this AOI</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-3 mt-4">
          {historyLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading assessment history...</p>
            </div>
          ) : historyData?.results?.length ? (
            <div className="space-y-2">
              {historyData.results.map((assessment: RiskHistory) => (
                <Card key={assessment.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(assessment.riskScore)}
                      <Badge variant={getRiskVariant(assessment.riskScore)} className="text-xs">
                        {assessment.riskScore}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(assessment.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {assessment.aoi.name} ({assessment.aoi.lat.toFixed(3)}, {assessment.aoi.lng.toFixed(3)})
                  </div>
                  {assessment.riskFactors.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Factors: </span>
                      <span className="break-words">{assessment.riskFactors.slice(0, 2).join(', ')}
                      {assessment.riskFactors.length > 2 && ` +${assessment.riskFactors.length - 2} more`}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No assessment history</p>
              <p className="text-xs">Risk assessments will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}