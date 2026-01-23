import { useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface GdeltEvent {
  id: string
  globalEventId: string
  eventDate: string
  eventCode: string | null
  quadClass: string | null
  goldsteinScale: number | null
  numMentions: number | null
  avgTone: number | null
  actor1Name: string | null
  actor2Name: string | null
  actionGeoFullname: string | null
  actionGeoLat: number | null
  actionGeoLon: number | null
  sourceUrl: string | null
}

export interface GdeltDoc {
  id: string
  title: string | null
  domain: string | null
  theme: string | null
  tone: number | null
  publishedAt: string | null
  lat: number | null
  lon: number | null
  url: string
}

interface AOI {
  name: string
  lat: number
  lon: number
  radiusKm?: number
}

interface MapIntelLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  aoi?: AOI
  visible: boolean
  onEventClick?: (event: GdeltEvent) => void
}

function getGoldsteinColor(scale: number | null): string {
  if (scale === null) return "#6b7280"
  if (scale >= 5) return "#22c55e"
  if (scale >= 2) return "#84cc16"
  if (scale >= 0) return "#eab308"
  if (scale >= -3) return "#f97316"
  if (scale >= -6) return "#ef4444"
  return "#dc2626"
}

function getGoldsteinLabel(scale: number | null): string {
  if (scale === null) return "Unknown"
  if (scale >= 5) return "Strong Cooperation"
  if (scale >= 2) return "Cooperation"
  if (scale >= 0) return "Neutral/Low Tension"
  if (scale >= -3) return "Tension"
  if (scale >= -6) return "Conflict"
  return "Severe Conflict"
}

function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return "Unknown date"
  }
}

export function useMapIntelLayer({
  map,
  isMapReady,
  aoi,
  visible,
  onEventClick
}: MapIntelLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const queryClient = useQueryClient()

  const { data: intelData, refetch } = useQuery({
    queryKey: ["/api/intel/gdelt/query", aoi?.name, aoi?.lat, aoi?.lon],
    queryFn: async () => {
      if (!aoi) return null
      const response = await fetch("/api/intel/gdelt/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aoi: {
            name: aoi.name || "Selected Area",
            lat: aoi.lat,
            lon: aoi.lon,
            radiusKm: aoi.radiusKm || 50
          },
          timeWindowDays: 7
        })
      })
      if (!response.ok) throw new Error("Failed to fetch intel data")
      return response.json()
    },
    enabled: !!aoi && visible,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })

  const triggerRefresh = useCallback(async () => {
    if (!aoi) return
    try {
      await fetch("/api/intel/gdelt/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aoi: {
            name: aoi.name || "Selected Area",
            lat: aoi.lat,
            lon: aoi.lon,
            radiusKm: aoi.radiusKm || 50
          },
          timeWindowDays: 7
        })
      })
      refetch()
    } catch (error) {
      console.error("Failed to refresh intel data:", error)
    }
  }, [aoi, refetch])

  useEffect(() => {
    if (intelData?.coverage?.isStale && aoi) {
      triggerRefresh()
    }
  }, [intelData?.coverage?.isStale, aoi, triggerRefresh])

  useEffect(() => {
    if (!map || !isMapReady) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    if (popupRef.current) {
      popupRef.current.remove()
      popupRef.current = null
    }

    if (!visible || !intelData?.events) return

    const events: GdeltEvent[] = intelData.events

    events.forEach((event) => {
      if (!event.actionGeoLat || !event.actionGeoLon) return

      const color = getGoldsteinColor(event.goldsteinScale)
      const label = getGoldsteinLabel(event.goldsteinScale)
      
      const el = document.createElement("div")
      el.className = "intel-event-marker"
      
      const size = Math.min(36, Math.max(24, (event.numMentions || 10) / 3 + 20))
      
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid rgba(255,255,255,0.9);
        box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px ${color}40;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        pointer-events: auto;
      `
      
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      `
      
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.15)"
        el.style.boxShadow = `0 4px 12px rgba(0,0,0,0.5), 0 0 0 3px ${color}60`
      })
      
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)"
        el.style.boxShadow = `0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px ${color}40`
      })
      
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        
        if (popupRef.current) {
          popupRef.current.remove()
        }
        
        const popupContent = `
          <div style="min-width: 280px; font-family: system-ui, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
              <span style="font-weight: 600; font-size: 12px; color: ${color};">${label}</span>
              <span style="margin-left: auto; font-size: 11px; color: #6b7280;">${formatEventDate(event.eventDate)}</span>
            </div>
            
            <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 6px;">
              ${event.quadClass || "Event"}
            </div>
            
            <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px;">
              <div style="margin-bottom: 4px;">
                <span style="color: #6b7280;">Actor 1:</span> ${event.actor1Name || "Unknown"}
              </div>
              <div>
                <span style="color: #6b7280;">Actor 2:</span> ${event.actor2Name || "Unknown"}
              </div>
            </div>
            
            <div style="display: flex; gap: 12px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px;">
              <div><strong>${event.numMentions || 0}</strong> mentions</div>
              <div>Tone: <strong>${event.avgTone?.toFixed(1) || "N/A"}</strong></div>
              <div>Goldstein: <strong>${event.goldsteinScale?.toFixed(1) || "N/A"}</strong></div>
            </div>
            
            <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">
              ${event.actionGeoFullname || "Unknown location"}
            </div>
          </div>
        `
        
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: "320px",
          className: "intel-popup"
        })
          .setLngLat([event.actionGeoLon!, event.actionGeoLat!])
          .setHTML(popupContent)
          .addTo(map)
        
        if (onEventClick) {
          onEventClick(event)
        }
      })
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([event.actionGeoLon, event.actionGeoLat])
        .addTo(map)
      
      markersRef.current.push(marker)
    })
    
    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
    }
  }, [map, isMapReady, visible, intelData?.events, onEventClick])

  return {
    events: intelData?.events || [],
    docs: intelData?.docs || [],
    coverage: intelData?.coverage || null,
    isLoading: !intelData && visible,
    refetch: triggerRefresh
  }
}

export function IntelLegend({ className }: { className?: string }) {
  const levels = [
    { color: "#22c55e", label: "Cooperation", range: "+5 to +10" },
    { color: "#eab308", label: "Neutral", range: "0 to +2" },
    { color: "#f97316", label: "Tension", range: "-3 to 0" },
    { color: "#ef4444", label: "Conflict", range: "-6 to -3" },
    { color: "#dc2626", label: "Severe", range: "-10 to -6" }
  ]

  return (
    <div className={className}>
      <div className="text-xs font-medium text-muted-foreground mb-2">Event Severity (Goldstein Scale)</div>
      <div className="space-y-1.5">
        {levels.map((level) => (
          <div key={level.label} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-xs text-foreground">{level.label}</span>
            <span className="text-xs text-muted-foreground ml-auto">{level.range}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
