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
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className={cn("p-6 space-y-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card data-testid="card-total-queries">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-operations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Operations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeOperations}</div>
            <p className="text-xs text-muted-foreground">Across 4 regions</p>
          </CardContent>
        </Card>

        <Card data-testid="card-risk-assessments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessments</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.riskAssessments}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card data-testid="card-files-processed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.filesProcessed}</div>
            <p className="text-xs text-muted-foreground">Intelligence extracts</p>
          </CardContent>
        </Card>

        <Card data-testid="card-response-time">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.averageResponse}s</div>
            <p className="text-xs text-muted-foreground">-0.3s improvement</p>
          </CardContent>
        </Card>

        <Card data-testid="card-system-uptime">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trend Analysis */}
        <Card data-testid="card-threat-trends">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Threat Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threatTrends.map((threat) => (
                <div key={threat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(threat.trend)}
                    <span className="font-medium">{threat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-mono text-sm">{threat.current}%</div>
                      <div className={`text-xs ${threat.change > 0 ? 'text-red-500' : threat.change < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
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
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Operational Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operationalData.map((op) => (
                <div key={op.location} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{op.location}</div>
                    <div className="text-sm text-muted-foreground">{op.operations} operations</div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={op.riskLevel === 'CRITICAL' || op.riskLevel === 'HIGH' ? 'destructive' : 
                              op.riskLevel === 'MEDIUM' ? 'secondary' : 'default'}
                      className="mb-1"
                    >
                      {op.riskLevel}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
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
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
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
            
            <TabsContent value="processing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>File Processing Speed</span>
                    <span>89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Analysis Throughput</span>
                    <span>76%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="accuracy" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk Assessment Accuracy</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Intelligence Correlation</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Engagement</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resource Utilization</span>
                    <span>71%</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}