import { useEffect, useRef } from "react"
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps"
import { Radio, AlertTriangle, Shield } from "lucide-react"
import type { GdeltEvent } from "./map-intel-layer"

declare const google: any

interface IntelHeatmapProps {
  events: GdeltEvent[]
  visible: boolean
}

// Threat-density color by Goldstein severity (green cooperation -> red conflict)
function severityColor(goldstein: number): string {
  if (goldstein <= -6) return "#b91c1c"
  if (goldstein <= -3) return "#ef4444"
  if (goldstein < 0) return "#f97316"
  if (goldstein < 2) return "#eab308"
  return "#22c55e"
}

export function IntelHeatmapLayer({ events, visible }: IntelHeatmapProps) {
  const map = useMap()
  // Gate on the core maps library so google.maps.Circle is available.
  const mapsLib = useMapsLibrary("maps")
  const circlesRef = useRef<any[]>([])

  const clearCircles = () => {
    circlesRef.current.forEach(c => c.setMap(null))
    circlesRef.current = []
  }

  useEffect(() => {
    if (!map || !mapsLib || !visible) {
      clearCircles()
      return
    }

    const validEvents = events.filter(
      e => e.actionGeoLat !== null && e.actionGeoLon !== null
    )

    clearCircles()

    if (validEvents.length === 0) {
      return
    }

    // Render each event as a translucent weighted circle. Overlapping circles
    // build up density, mimicking the retired Google HeatmapLayer visual.
    circlesRef.current = validEvents.map(event => {
      const goldstein = event.goldsteinScale ?? 0
      const mentions = event.numMentions ?? 1

      let weight = 1
      if (goldstein <= -6) {
        weight = 10 * Math.log10(mentions + 1) + 15
      } else if (goldstein <= -3) {
        weight = 8 * Math.log10(mentions + 1) + 10
      } else if (goldstein < 0) {
        weight = 5 * Math.log10(mentions + 1) + 5
      } else if (goldstein < 2) {
        weight = 3 * Math.log10(mentions + 1) + 2
      } else {
        weight = 2 * Math.log10(mentions + 1) + 1
      }
      weight = Math.max(weight, 1)

      const color = severityColor(goldstein)
      const radiusMeters = 1500 + weight * 350

      return new google.maps.Circle({
        map,
        center: { lat: event.actionGeoLat!, lng: event.actionGeoLon! },
        radius: radiusMeters,
        strokeWeight: 0,
        fillColor: color,
        fillOpacity: 0.28,
        clickable: false,
        zIndex: 1,
      })
    })

    return () => {
      clearCircles()
    }
  }, [map, mapsLib, events, visible])

  return null
}

interface IntelHeatmapLegendProps {
  eventCount: number
  conflictCount: number
  tensionCount: number
  cooperationCount: number
  mapStyle?: string
}

export function IntelHeatmapLegend({ 
  eventCount, 
  conflictCount, 
  tensionCount, 
  cooperationCount,
  mapStyle = "streets" 
}: IntelHeatmapLegendProps) {
  const isDark = mapStyle === "satellite" || mapStyle === "hybrid"
  
  return (
    <div 
      className={`rounded-tl-md border-l border-t overflow-hidden ${
        isDark 
          ? "bg-black/90 border-white/20 text-white" 
          : "bg-background/95 border-border text-foreground"
      } backdrop-blur-sm`}
      style={{ minWidth: "180px" }}
    >
      <div className={`px-3 py-2 border-b ${isDark ? "border-white/10" : "border-border"}`}>
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold tracking-wide uppercase">Intel Activity</span>
        </div>
        <div className={`text-[10px] mt-0.5 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
          Google Threat Intel / GDELT
        </div>
      </div>
      
      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className={isDark ? "text-white/70" : "text-muted-foreground"}>Threat Density</span>
          </div>
          <div className="h-3 rounded-sm overflow-hidden" style={{
            background: "linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444, #dc2626, #b91c1c)"
          }} />
          <div className="flex justify-between text-[9px]">
            <span className={isDark ? "text-white/50" : "text-muted-foreground"}>Low</span>
            <span className={isDark ? "text-white/50" : "text-muted-foreground"}>Critical</span>
          </div>
        </div>
        
        <div className="space-y-1.5 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span>Conflict/Severe</span>
            </div>
            <span className="font-mono font-medium text-red-500">{conflictCount}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Tension</span>
            </div>
            <span className="font-mono font-medium text-orange-500">{tensionCount}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Cooperation</span>
            </div>
            <span className="font-mono font-medium text-green-500">{cooperationCount}</span>
          </div>
        </div>
        
        <div className={`pt-2 border-t text-center text-[10px] ${isDark ? "border-white/10 text-white/50" : "border-border/50 text-muted-foreground"}`}>
          {eventCount} active intel reports
        </div>
      </div>
    </div>
  )
}
