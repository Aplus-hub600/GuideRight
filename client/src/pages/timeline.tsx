import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  MessageCircle,
  Brain,
  Shield,
  MapPin,
  FileImage,
  Calendar,
  Filter,
  Users,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"
import type { TimelineEvent } from "@shared/schema"

const eventIcons = {
  chat: MessageCircle,
  intelligence: Shield,
  pmesii: Brain,
  risk: AlertTriangle,
  waypoint: MapPin,
  file: FileImage
}

const eventColors = {
  chat: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  intelligence: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  pmesii: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  risk: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  waypoint: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  file: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
}

const severityColors = {
  LOW: "border-l-green-500",
  MEDIUM: "border-l-yellow-500",
  HIGH: "border-l-orange-500",
  CRITICAL: "border-l-red-500"
}

export default function Timeline() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")

  const { data: timelineData, isLoading } = useQuery<{
    success: boolean
    events: TimelineEvent[]
    total: number
  }>({
    queryKey: ["/api/timeline", { 
      limit: 100,
      filters: {
        ...(typeFilter !== "all" && { types: [typeFilter] }),
        ...(severityFilter !== "all" && { severity: [severityFilter] })
      }
    }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey as [string, any]
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.filters) queryParams.append('filters', JSON.stringify(params.filters))
      
      const response = await fetch(`${url}?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch timeline')
      return response.json()
    }
  })

  const events = timelineData?.events || []

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null
    
    return (
      <Badge 
        variant={severity === 'CRITICAL' ? 'destructive' : 'secondary'}
        className="ml-2 text-xs"
        data-testid={`badge-severity-${severity.toLowerCase()}`}
      >
        {severity}
      </Badge>
    )
  }

  const getSourceBadge = (source?: string) => {
    if (!source) return null
    
    const colors = {
      "seerist": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "fraym": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
    
    return (
      <Badge 
        className={`ml-2 text-xs ${colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}
        data-testid={`badge-timeline-source-${source}`}
      >
        {source.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-timeline-title">Event Timeline</h1>
            <p className="text-sm text-muted-foreground">
              Chronological view of all tactical intelligence events
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40" data-testid="select-type-filter">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="intelligence">Intelligence</SelectItem>
                <SelectItem value="pmesii">PMESII Analysis</SelectItem>
                <SelectItem value="risk">Risk Assessments</SelectItem>
                <SelectItem value="waypoint">Waypoints</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="chat">Chat Messages</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32" data-testid="select-severity-filter">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {events.length} Events
          </Badge>
        </div>
      </div>

      {/* Timeline Content */}
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8" data-testid="loading-timeline">
            <Clock className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading timeline events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-8" data-testid="empty-timeline">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or add some intelligence data
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const Icon = eventIcons[event.type]
              const isLastEvent = index === events.length - 1
              
              return (
                <div key={event.id} className="relative" data-testid={`timeline-event-${event.type}-${event.id}`}>
                  {/* Timeline line */}
                  {!isLastEvent && (
                    <div 
                      className="absolute left-[1.875rem] top-12 w-0.5 h-8 bg-border"
                      style={{ height: '2rem' }}
                    />
                  )}
                  
                  {/* Event card */}
                  <Card 
                    className={`ml-8 hover-elevate ${
                      event.severity ? severityColors[event.severity] : 'border-l-muted'
                    } border-l-4`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Event icon */}
                          <div 
                            className={`rounded-full p-2 mt-1 ${
                              eventColors[event.type] || eventColors.file
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          {/* Event details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <CardTitle 
                                className="text-base font-semibold truncate"
                                data-testid={`text-event-title-${event.id}`}
                              >
                                {event.title}
                              </CardTitle>
                              {getSeverityBadge(event.severity)}
                              {getSourceBadge(event.source)}
                            </div>
                            
                            <p 
                              className="text-sm text-muted-foreground mt-1 line-clamp-2"
                              data-testid={`text-event-description-${event.id}`}
                            >
                              {event.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0 ml-4">
                          <Calendar className="h-3 w-3" />
                          <time dateTime={event.timestamp}>
                            {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                          </time>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {event.location && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                          </span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}