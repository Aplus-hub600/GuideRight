import { useEffect, useRef } from "react"
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps"
import { Radio, AlertTriangle, Shield } from "lucide-react"
import type { GdeltEvent } from "./map-intel-layer"

declare const google: any

interface IntelHeatmapProps {
  events: GdeltEvent[]
  visible: boolean
}

export function IntelHeatmapLayer({ events, visible }: IntelHeatmapProps) {
  const map = useMap()
  const visualizationLib = useMapsLibrary("visualization")
  const heatmapRef = useRef<any>(null)

  useEffect(() => {
    if (!map || !visualizationLib || !visible) {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null)
      }
      return
    }

    const validEvents = events.filter(
      e => e.actionGeoLat !== null && e.actionGeoLon !== null
    )

    if (validEvents.length === 0) {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null)
      }
      return
    }

    const heatmapData = validEvents.map(event => {
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

      return {
        location: new google.maps.LatLng(event.actionGeoLat!, event.actionGeoLon!),
        weight: Math.max(weight, 1)
      }
    })

    if (heatmapRef.current) {
      heatmapRef.current.setData(heatmapData)
      heatmapRef.current.setMap(map)
    } else {
      heatmapRef.current = new visualizationLib.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 45,
        opacity: 0.45,
        gradient: [
          "rgba(0, 0, 0, 0)",
          "rgba(34, 197, 94, 0.25)",
          "rgba(132, 204, 22, 0.3)",
          "rgba(234, 179, 8, 0.35)",
          "rgba(249, 115, 22, 0.4)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(220, 38, 38, 0.6)",
          "rgba(185, 28, 28, 0.7)"
        ]
      })
    }

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null)
      }
    }
  }, [map, visualizationLib, events, visible])

  useEffect(() => {
    if (heatmapRef.current) {
      if (visible) {
        heatmapRef.current.setMap(map)
      } else {
        heatmapRef.current.setMap(null)
      }
    }
  }, [visible, map])

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
