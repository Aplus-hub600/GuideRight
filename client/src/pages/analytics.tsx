import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Activity, Users, MapPin, Clock, Shield, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsProps {
  className?: string
}

export default function Analytics({ className }: AnalyticsProps) {

  const systemMetrics = {
    totalQueries: 1247,
    activeOperations: 8,
    riskAssessments: 342,
    filesProcessed: 89,
    averageResponse: 2.3,
    systemUptime: 99.7
  }

  const threatTrends = [
    { category: "Cyber", current: 23, change: +5, trend: "increasing" },
    { category: "Physical", current: 31, change: -2, trend: "decreasing" },
    { category: "Economic", current: 18, change: +1, trend: "stable" },
    { category: "Information", current: 27, change: +8, trend: "increasing" }
  ]

  const operationalData = [
    { location: "Dhaka", operations: 12, riskLevel: "HIGH", confidence: 78 },
    { location: "Kabul", operations: 8, riskLevel: "CRITICAL", confidence: 91 },
    { location: "Baghdad", operations: 6, riskLevel: "MEDIUM", confidence: 65 },
    { location: "Lagos", operations: 4, riskLevel: "LOW", confidence: 82 }
  ]


  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-5 w-5 text-red-400" />
      case 'decreasing': return <TrendingUp className="h-5 w-5 text-green-400 rotate-180" />
      default: return <Activity className="h-5 w-5 text-blue-400" />
    }
  }

  return (
    <div className={cn("p-6 space-y-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-blue-400" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card data-testid="card-total-queries">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Total Queries</CardTitle>
            <Activity className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{systemMetrics.totalQueries.toLocaleString()}</div>
            <p className="text-base font-medium text-neutral-200">+12% from last month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-operations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Active Operations</CardTitle>
            <MapPin className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{systemMetrics.activeOperations}</div>
            <p className="text-base font-medium text-neutral-200">Across 4 regions</p>
          </CardContent>
        </Card>

        <Card data-testid="card-risk-assessments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Risk Assessments</CardTitle>
            <Shield className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{systemMetrics.riskAssessments}</div>
            <p className="text-base font-medium text-neutral-200">This week</p>
          </CardContent>
        </Card>

        <Card data-testid="card-files-processed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Files Processed</CardTitle>
            <Users className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{systemMetrics.filesProcessed}</div>
            <p className="text-base font-medium text-neutral-200">Intelligence extracts</p>
          </CardContent>
        </Card>

        <Card data-testid="card-response-time">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Avg Response Time</CardTitle>
            <Clock className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{systemMetrics.averageResponse}s</div>
            <p className="text-base font-medium text-neutral-200">-0.3s improvement</p>
          </CardContent>
        </Card>

        <Card data-testid="card-system-uptime">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">System Uptime</CardTitle>
            <Activity className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{systemMetrics.systemUptime}%</div>
            <p className="text-base font-medium text-neutral-200">30-day average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trend Analysis */}
        <Card data-testid="card-threat-trends">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              Threat Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threatTrends.map((threat) => (
                <div key={threat.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(threat.trend)}
                    <span className="text-base font-bold text-neutral-200">{threat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-blue-300">{threat.current}%</div>
                      <div className={`text-base font-medium ${threat.change > 0 ? 'text-red-400' : threat.change < 0 ? 'text-green-400' : 'text-neutral-200'}`}>
                        {threat.change > 0 ? '+' : ''}{threat.change}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational Overview */}
        <Card data-testid="card-operational-overview">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              <MapPin className="h-6 w-6 text-purple-400" />
              Operational Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operationalData.map((op) => (
                <div key={op.location} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="text-lg font-bold text-neutral-200">{op.location}</div>
                    <div className="text-base font-medium text-neutral-200">{op.operations} operations</div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={op.riskLevel === 'CRITICAL' || op.riskLevel === 'HIGH' ? 'destructive' : 
                              op.riskLevel === 'MEDIUM' ? 'secondary' : 'default'}
                      className="mb-2 text-base font-bold"
                    >
                      {op.riskLevel}
                    </Badge>
                    <div className="text-base font-medium text-neutral-200">
                      Confidence: {op.confidence}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card data-testid="card-system-performance">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            <Activity className="h-6 w-6 text-blue-400" />
            System Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="processing">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="processing" data-testid="tab-processing">Processing</TabsTrigger>
              <TabsTrigger value="accuracy" data-testid="tab-accuracy">Accuracy</TabsTrigger>
              <TabsTrigger value="usage" data-testid="tab-usage">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="processing" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-neutral-200">File Processing Speed</span>
                    <span className="text-blue-300 font-bold">89%</span>
                  </div>
                  <Progress value={89} className="h-3" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-neutral-200">AI Analysis Throughput</span>
                    <span className="text-blue-300 font-bold">76%</span>
                  </div>
                  <Progress value={76} className="h-3" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="accuracy" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-neutral-200">Risk Assessment Accuracy</span>
                    <span className="text-blue-300 font-bold">94%</span>
                  </div>
                  <Progress value={94} className="h-3" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-neutral-200">Intelligence Correlation</span>
                    <span className="text-blue-300 font-bold">87%</span>
                  </div>
                  <Progress value={87} className="h-3" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-neutral-200">User Engagement</span>
                    <span className="text-blue-300 font-bold">82%</span>
                  </div>
                  <Progress value={82} className="h-3" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-neutral-200">Resource Utilization</span>
                    <span className="text-blue-300 font-bold">71%</span>
                  </div>
                  <Progress value={71} className="h-3" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}