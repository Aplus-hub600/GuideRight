import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  XCircle
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface IntelItem {
  id: string
  source: "Fraym" | "Seerist" | "Sprinklr" | "News" | "Social" | "Weather" | "Infra"
  text: string
  time?: string
  quality: number
  pmesii: PMESIICategory[]
}

type PMESIICategory = "Political" | "Military" | "Economic" | "Social" | "Information" | "Infrastructure"

interface PMESIIPanelsProps {
  items?: IntelItem[]
  coverage?: Record<PMESIICategory, number>
  className?: string
}

// Mock intelligence data for prototype
const mockIntelItems: IntelItem[] = [
  {
    id: "1",
    source: "Fraym",
    text: "Population density analysis shows 45% increase in displaced persons in northern districts over past 72 hours.",
    time: "2h ago",
    quality: 0.85,
    pmesii: ["Social"]
  },
  {
    id: "2", 
    source: "Seerist",
    text: "Military checkpoint established at grid 314592. Enhanced screening procedures implemented.",
    time: "4h ago",
    quality: 0.92,
    pmesii: ["Military", "Infrastructure"]
  },
  {
    id: "3",
    source: "News",
    text: "Local market closure affects supply chains. Fuel prices increased 23% since Tuesday.",
    time: "6h ago", 
    quality: 0.78,
    pmesii: ["Economic"]
  },
  {
    id: "4",
    source: "Social",
    text: "Rumors circulating on WhatsApp groups about planned demonstration near government buildings.",
    time: "1h ago",
    quality: 0.65,
    pmesii: ["Political", "Information"]
  },
  {
    id: "5",
    source: "Weather",
    text: "Severe thunderstorm expected 1800-2200 local time. Power grid vulnerabilities identified in sectors 3-7.",
    time: "3h ago",
    quality: 0.88,
    pmesii: ["Infrastructure"]
  },
  {
    id: "6",
    source: "Infra", 
    text: "Cell tower maintenance completed in district 4. Network coverage restored to 95% capacity.",
    time: "8h ago",
    quality: 0.91,
    pmesii: ["Information", "Infrastructure"]
  }
]

const pmesiiConfig = {
  Political: { icon: Building, color: "rgb(139 69 19)", description: "Government, policy, governance" },
  Military: { icon: Shield, color: "rgb(34 197 94)", description: "Forces, security, operations" },
  Economic: { icon: TrendingUp, color: "rgb(59 130 246)", description: "Markets, trade, resources" },
  Social: { icon: Users, color: "rgb(168 85 247)", description: "Demographics, culture, society" },
  Information: { icon: Radio, color: "rgb(245 158 11)", description: "Communications, media, networks" },
  Infrastructure: { icon: Zap, color: "rgb(239 68 68)", description: "Physical systems, utilities" }
}

export function PMESIIPanels({ items = mockIntelItems, coverage, className }: PMESIIPanelsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<PMESIICategory>("Political")

  const getItemsByCategory = (category: PMESIICategory) => {
    return items.filter(item => item.pmesii.includes(category))
      .sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime())
  }

  const getQualityIcon = (quality: number) => {
    if (quality >= 0.8) return <CheckCircle2 className="h-5 w-5 text-green-400" />
    if (quality >= 0.6) return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    return <XCircle className="h-5 w-5 text-red-400" />
  }

  const getSourceBadgeColor = (source: string) => {
    const colors = {
      "Fraym": "bg-blue-500/20 text-blue-300 border-blue-400/30",
      "Seerist": "bg-green-500/20 text-green-300 border-green-400/30",
      "Sprinklr": "bg-purple-500/20 text-purple-300 border-purple-400/30",
      "News": "bg-orange-500/20 text-orange-300 border-orange-400/30",
      "Social": "bg-pink-500/20 text-pink-300 border-pink-400/30",
      "Weather": "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
      "Infra": "bg-gray-500/20 text-gray-300 border-gray-400/30"
    }
    return colors[source as keyof typeof colors] || colors.News
  }

  return (
    <div className={cn("h-full", className)}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PMESIICategory)} className="h-full flex flex-col">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted/50 p-1 w-full mb-4">
          {Object.entries(pmesiiConfig).map(([category, config]) => {
            const Icon = config.icon
            const categoryItems = getItemsByCategory(category as PMESIICategory)
            return (
              <TabsTrigger 
                key={category} 
                value={category}
                className="relative flex flex-col gap-1 p-2 flex-1 min-w-[60px] data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg transition-all"
                data-testid={`tab-pmesii-${category.toLowerCase()}`}
              >
                <Icon className="h-5 w-5 mx-auto text-blue-400" />
                <span className="text-base font-medium hidden sm:inline text-neutral-200">
                  {t(`pmesii.${category.toLowerCase()}`)}
                </span>
                {categoryItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 text-base font-medium flex items-center justify-center bg-blue-500/20 border border-blue-400/50 text-neutral-200">
                    {categoryItems.length}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(pmesiiConfig).map(([category, config]) => {
          const categoryItems = getItemsByCategory(category as PMESIICategory)
          const Icon = config.icon
          
          return (
            <TabsContent key={category} value={category} className="flex-1 mt-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <span>{t(`pmesii.${category.toLowerCase()}`)}</span>
                    <Badge variant="outline" className="text-base font-medium">{categoryItems.length}</Badge>
                  </CardTitle>
                  <p className="text-base font-medium text-neutral-200">
                    {config.description}
                  </p>
                  
                  {coverage?.[category as PMESIICategory] !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-base font-medium text-neutral-200">Coverage</span>
                      </div>
                      <Progress value={coverage[category as PMESIICategory] * 100} className="h-2" />
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0 h-[calc(100%-140px)]">
                  {categoryItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Icon className="h-12 w-12 mx-auto mb-2 text-blue-400/50" />
                        <p className="text-base font-medium text-neutral-300">No intelligence items in this category</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {categoryItems.map((item) => (
                          <Card key={item.id} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="flex items-center gap-2">
                                  {getQualityIcon(item.quality)}
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-base font-medium", getSourceBadgeColor(item.source))}
                                  >
                                    {t(`sources.${item.source.toLowerCase()}`)}
                                  </Badge>
                                  {item.time && (
                                    <span className="text-base font-medium text-neutral-300">
                                      {item.time}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-base font-medium leading-relaxed break-words text-neutral-200">
                                {item.text}
                              </p>
                              
                              {item.pmesii.length > 1 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.pmesii.filter(cat => cat !== category).map((cat) => (
                                    <Badge key={cat} variant="secondary" className="text-base font-medium">
                                      {t(`pmesii.${cat.toLowerCase()}`)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}