import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, TrendingUp, Shield, AlertTriangle, CheckCircle, Target, Activity, Zap, Eye } from "lucide-react"
import { useState, useEffect } from "react"

interface AnalysisResult {
  success: boolean
  analysis: any
  riskScore: number
  riskLevel: string
  riskFactors: string[]
  riskAssessment: string
  confidence: number
  location: {
    lat: number
    lng: number
    radiusKm: number
    name?: string
  }
  resultId: string
}

interface AnalysisPanelProps {
  isVisible: boolean
  onClose?: () => void
}

export function AnalysisPanel({ isVisible, onClose }: AnalysisPanelProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Listen for analysis results from map clicks
  useEffect(() => {
    const handleAnalysisUpdate = (event: CustomEvent<AnalysisResult>) => {
      setAnalysisResult(event.detail)
      setIsLoading(false)
      setError(null)
    }

    const handleAnalysisStart = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleAnalysisError = (event: CustomEvent<{ message: string }>) => {
      setError(event.detail.message)
      setIsLoading(false)
    }

    window.addEventListener('guideright:analysis-result', handleAnalysisUpdate as EventListener)
    window.addEventListener('guideright:analysis-start', handleAnalysisStart as EventListener)
    window.addEventListener('guideright:analysis-error', handleAnalysisError as EventListener)

    return () => {
      window.removeEventListener('guideright:analysis-result', handleAnalysisUpdate as EventListener)
      window.removeEventListener('guideright:analysis-start', handleAnalysisStart as EventListener)
      window.removeEventListener('guideright:analysis-error', handleAnalysisError as EventListener)
    }
  }, [])

  // Normalize risk level to uppercase for consistent handling
  const normalizeRiskLevel = (level: string): string => {
    if (!level) return 'UNKNOWN'
    const normalized = level.toUpperCase()
    switch (normalized) {
      case 'LOW': return 'LOW'
      case 'MODERATE': case 'MEDIUM': return 'MEDIUM'
      case 'HIGH': return 'HIGH'
      case 'CRITICAL': return 'CRITICAL'
      default: return 'UNKNOWN'
    }
  }

  // Normalize confidence to percentage (0-100)
  const normalizeConfidence = (confidence: number): number => {
    let normalized: number
    if (confidence <= 1) {
      normalized = confidence * 100 // Convert 0-1 to 0-100
    } else {
      normalized = confidence // Already 0-100
    }
    return Math.max(0, Math.min(100, Math.round(normalized))) // Clamp to [0, 100]
  }

  const getRiskColor = (level: string) => {
    const normalized = normalizeRiskLevel(level)
    switch (normalized) {
      case 'LOW': return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'MEDIUM': return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      case 'HIGH': return 'bg-gradient-to-r from-orange-500 to-red-500'
      case 'CRITICAL': return 'bg-gradient-to-r from-red-500 to-red-700'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const getRiskBorderColor = (level: string) => {
    const normalized = normalizeRiskLevel(level)
    switch (normalized) {
      case 'LOW': return 'border-green-500/50'
      case 'MEDIUM': return 'border-yellow-500/50'
      case 'HIGH': return 'border-orange-500/50'
      case 'CRITICAL': return 'border-red-500/50'
      default: return 'border-gray-500/50'
    }
  }

  const getRiskIcon = (level: string) => {
    const normalized = normalizeRiskLevel(level)
    switch (normalized) {
      case 'LOW': return <CheckCircle className="w-4 h-4 animate-pulse text-green-400" />
      case 'MEDIUM': return <TrendingUp className="w-4 h-4 animate-bounce text-yellow-400" />
      case 'HIGH': return <AlertTriangle className="w-4 h-4 animate-pulse text-orange-400" />
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4 animate-bounce text-red-400" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!isVisible) return null

  return (
    <Card className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm z-10 hover:shadow-xl transition-all duration-300" data-testid="panel-analysis">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary animate-pulse" />
            Tactical Analysis
          </CardTitle>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-close-analysis"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8" data-testid="loading-analysis">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="mt-4 text-muted-foreground animate-pulse">Analyzing tactical situation...</span>
            <div className="flex gap-1 mt-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8" data-testid="error-analysis">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-sm text-red-600 font-medium">Analysis Failed</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : analysisResult ? (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {/* Location Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-location">
                <MapPin className="w-4 h-4" />
                <span>
                  {analysisResult.location?.lat?.toFixed(4) || 'N/A'}, {analysisResult.location?.lng?.toFixed(4) || 'N/A'}
                </span>
                {analysisResult.location?.name && (
                  <span className="text-foreground font-medium">({analysisResult.location.name})</span>
                )}
              </div>

              {/* Confidence Score */}
              <div className="space-y-2 p-3 rounded-lg border border-accent/20 bg-accent/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent animate-pulse" />
                    Confidence Level
                  </span>
                  <span className={`text-sm font-bold ${getConfidenceColor(normalizeConfidence(analysisResult.confidence))}`} data-testid="text-confidence">
                    {normalizeConfidence(analysisResult.confidence)}%
                  </span>
                </div>
                <Progress 
                  value={normalizeConfidence(analysisResult.confidence)} 
                  className="h-3 bg-muted/50"
                  data-testid="progress-confidence"
                />
              </div>

              {/* Risk Assessment */}
              <div className={`space-y-3 p-4 rounded-lg border-2 ${getRiskBorderColor(analysisResult.riskLevel)} bg-gradient-to-r from-transparent to-muted/20`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Risk Assessment
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${getRiskColor(analysisResult.riskLevel)} text-white border-0 shadow-lg`}
                    data-testid="badge-risk-level"
                  >
                    <span className="flex items-center gap-1">
                      {getRiskIcon(analysisResult.riskLevel)}
                      {normalizeRiskLevel(analysisResult.riskLevel)}
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Threat Level</span>
                  <span className="text-sm font-mono font-bold" data-testid="text-risk-score">
                    {analysisResult.riskScore}/100
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={Math.max(0, Math.min(100, analysisResult.riskScore))} 
                    className="h-4 bg-muted/50"
                    data-testid="progress-risk-score"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {Math.max(0, Math.min(100, analysisResult.riskScore))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment Summary */}
              {analysisResult.riskAssessment && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Risk Assessment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words" data-testid="text-risk-assessment">
                    {analysisResult.riskAssessment}
                  </p>
                </div>
              )}

              {/* Analysis Summary */}
              {analysisResult.analysis?.summary && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Intelligence Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words" data-testid="text-analysis-summary">
                    {analysisResult.analysis.summary}
                  </p>
                </div>
              )}

              {/* Key Findings */}
              {analysisResult.analysis?.keyFindings && analysisResult.analysis.keyFindings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Findings</h4>
                  <ul className="space-y-1" data-testid="list-key-findings">
                    {analysisResult.analysis.keyFindings.map((finding: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="break-words">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {analysisResult.riskFactors && analysisResult.riskFactors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Risk Factors</h4>
                  <ul className="space-y-1" data-testid="list-risk-factors">
                    {analysisResult.riskFactors.map((factor: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="break-words">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.analysis?.recommendations && analysisResult.analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Tactical Recommendations</h4>
                  <ul className="space-y-1" data-testid="list-recommendations">
                    {analysisResult.analysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Target className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                        <span className="break-words">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PMESII Analysis if available */}
              {analysisResult.analysis?.political && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">PMESII Analysis</h4>
                  
                  {/* Political */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Political</span>
                      <span className="text-xs" data-testid="score-political">
                        {Math.round((analysisResult.analysis.political?.stabilityScore || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analysisResult.analysis.political?.stabilityScore || 0) * 100} className="h-1" />
                  </div>

                  {/* Military */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Military</span>
                      <span className="text-xs" data-testid="score-military">
                        {Math.round((analysisResult.analysis.military?.readinessScore || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analysisResult.analysis.military?.readinessScore || 0) * 100} className="h-1" />
                  </div>

                  {/* Economic */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Economic</span>
                      <span className="text-xs" data-testid="score-economic">
                        {Math.round((analysisResult.analysis.economic?.stabilityScore || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analysisResult.analysis.economic?.stabilityScore || 0) * 100} className="h-1" />
                  </div>

                  {/* Social */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Social</span>
                      <span className="text-xs" data-testid="score-social">
                        {Math.round((analysisResult.analysis.social?.stabilityScore || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analysisResult.analysis.social?.stabilityScore || 0) * 100} className="h-1" />
                  </div>

                  {/* Information */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Information</span>
                      <span className="text-xs" data-testid="score-information">
                        {Math.round((analysisResult.analysis.information?.reliabilityScore || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analysisResult.analysis.information?.reliabilityScore || 0) * 100} className="h-1" />
                  </div>

                  {/* Infrastructure */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Infrastructure</span>
                      <span className="text-xs" data-testid="score-infrastructure">
                        {Math.round((analysisResult.analysis.infrastructure?.integrityScore || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analysisResult.analysis.infrastructure?.integrityScore || 0) * 100} className="h-1" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-analysis">
            <div className="relative mb-4">
              <Target className="w-16 h-16 mx-auto opacity-30 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Zap className="w-6 h-6 text-primary animate-bounce" />
              </div>
            </div>
            <p className="text-sm font-medium">Initialize Tactical Analysis</p>
            <p className="text-xs mt-2 max-w-xs mx-auto leading-relaxed">
              Click anywhere on the operational map to trigger comprehensive intelligence analysis
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}