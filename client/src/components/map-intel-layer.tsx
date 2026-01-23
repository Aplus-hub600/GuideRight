import { useEffect, useRef, useCallback, useMemo } from "react"
import maplibregl from "maplibre-gl"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, Radio, Database, TrendingUp, Clock, RefreshCw, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

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

export type GoldsteinCategory = "severe" | "conflict" | "tension" | "neutral" | "cooperation"

export const GOLDSTEIN_CATEGORIES: Array<{
  id: GoldsteinCategory
  label: string
  color: string
  minScale: number
  maxScale: number
}> = [
  { id: "cooperation", label: "Cooperation", color: "#22c55e", minScale: 2, maxScale: 10 },
  { id: "neutral", label: "Neutral", color: "#eab308", minScale: 0, maxScale: 2 },
  { id: "tension", label: "Tension", color: "#f97316", minScale: -3, maxScale: 0 },
  { id: "conflict", label: "Conflict", color: "#ef4444", minScale: -6, maxScale: -3 },
  { id: "severe", label: "Severe Conflict", color: "#dc2626", minScale: -10, maxScale: -6 }
]

function getGoldsteinCategory(scale: number | null): GoldsteinCategory {
  if (scale === null) return "neutral"
  if (scale >= 2) return "cooperation"
  if (scale >= 0) return "neutral"
  if (scale >= -3) return "tension"
  if (scale >= -6) return "conflict"
  return "severe"
}

interface MapIntelLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  aoi?: AOI
  visible: boolean
  onEventClick?: (event: GdeltEvent) => void
  hiddenCategories?: Set<GoldsteinCategory>
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
  onEventClick,
  hiddenCategories = new Set()
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
      
      const category = getGoldsteinCategory(event.goldsteinScale)
      if (hiddenCategories.has(category)) return

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
          className: "intel-popup",
          anchor: "bottom",
          offset: [0, -10]
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
  }, [map, isMapReady, visible, intelData?.events, onEventClick, hiddenCategories])

  const categoryCounts = useMemo(() => {
    const counts: Record<GoldsteinCategory, number> = {
      cooperation: 0,
      neutral: 0,
      tension: 0,
      conflict: 0,
      severe: 0
    }
    const events: GdeltEvent[] = intelData?.events || []
    events.forEach(event => {
      const cat = getGoldsteinCategory(event.goldsteinScale)
      counts[cat]++
    })
    return counts
  }, [intelData?.events])

  const visibleEventCount = useMemo(() => {
    return (intelData?.events || []).filter((e: GdeltEvent) => 
      !hiddenCategories.has(getGoldsteinCategory(e.goldsteinScale))
    ).length
  }, [intelData?.events, hiddenCategories])

  return {
    events: intelData?.events || [],
    docs: intelData?.docs || [],
    coverage: intelData?.coverage || null,
    isLoading: !intelData && visible,
    refetch: triggerRefresh,
    categoryCounts,
    visibleEventCount,
    totalEvents: (intelData?.events || []).length
  }
}

interface SmartIntelLegendProps {
  events: GdeltEvent[]
  docs: GdeltDoc[]
  coverage: { eventsCount: number; docsCount: number; lastRefresh?: string } | null
  hiddenCategories: Set<GoldsteinCategory>
  onToggleCategory: (category: GoldsteinCategory) => void
  onRefresh?: () => void
  isLoading?: boolean
  mapStyle?: "streets" | "satellite" | "hybrid"
  className?: string
}

export function SmartIntelLegend({
  events,
  docs,
  coverage,
  hiddenCategories,
  onToggleCategory,
  onRefresh,
  isLoading = false,
  mapStyle = "streets",
  className
}: SmartIntelLegendProps) {
  const isSatellite = mapStyle === "satellite" || mapStyle === "hybrid"
  
  const categoryCounts = useMemo(() => {
    const counts: Record<GoldsteinCategory, number> = {
      cooperation: 0,
      neutral: 0,
      tension: 0,
      conflict: 0,
      severe: 0
    }
    events.forEach(event => {
      const cat = getGoldsteinCategory(event.goldsteinScale)
      counts[cat]++
    })
    return counts
  }, [events])

  const visibleCount = useMemo(() => {
    return events.filter(e => !hiddenCategories.has(getGoldsteinCategory(e.goldsteinScale))).length
  }, [events, hiddenCategories])

  const totalEvents = events.length
  const totalDocs = docs.length

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`intel-legend-${mapStyle}`}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className={cn(
          "backdrop-blur-md border shadow-lg rounded-lg overflow-hidden",
          "font-mono text-[11px] select-none",
          isSatellite 
            ? "bg-zinc-900/95 text-zinc-100 border-zinc-700" 
            : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
          "border-r-0 border-b-0 rounded-br-none rounded-bl-none rounded-tr-none",
          className
        )}
        style={{ minWidth: "220px", maxWidth: "280px" }}
      >
        {/* Header with live data indicator */}
        <div 
          className={cn(
            "flex items-center justify-between px-3 py-2 border-b",
            isSatellite ? "bg-red-900/20 border-zinc-700" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-zinc-700"
          )}
        >
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500" />
            <span className="text-[11px] font-bold tracking-wide text-red-600 dark:text-red-400">
              LIVE INTEL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
              {visibleCount}
            </span>
            <span className="text-[9px] opacity-60">/{totalEvents}</span>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className={cn(
                  "p-0.5 rounded hover:bg-current/10 transition-colors",
                  isLoading && "animate-spin"
                )}
              >
                <RefreshCw className="h-3 w-3 opacity-60" />
              </button>
            )}
          </div>
        </div>
        
        {/* Event Categories - Interactive Toggles */}
        <div className="px-1 py-1.5">
          {GOLDSTEIN_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id]
            const isHidden = hiddenCategories.has(cat.id)
            
            return (
              <motion.button
                key={cat.id}
                initial={false}
                animate={{ opacity: isHidden ? 0.4 : 1 }}
                onClick={() => onToggleCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors",
                  "hover:bg-current/5 text-left",
                  isHidden && "line-through decoration-1"
                )}
              >
                {/* Visibility Toggle */}
                <div className="w-4 h-4 flex items-center justify-center shrink-0 opacity-50">
                  {isHidden ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </div>
                
                {/* Color indicator */}
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0 shadow-sm border border-white/50",
                    isHidden && "opacity-40"
                  )}
                  style={{ backgroundColor: cat.color }}
                />
                
                {/* Label */}
                <span className="flex-1 text-[10px] font-medium truncate">
                  {cat.label}
                </span>
                
                {/* Count */}
                <span className={cn(
                  "text-[10px] font-bold tabular-nums",
                  count > 0 && !isHidden ? "text-emerald-600 dark:text-emerald-400" : "opacity-50"
                )}>
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>
        
        {/* News Documents Section */}
        <div className={cn(
          "px-3 py-2 border-t flex items-center justify-between",
          isSatellite ? "border-zinc-700 bg-zinc-800/40" : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40"
        )}>
          <div className="flex items-center gap-2">
            <Newspaper className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-medium">News Sources</span>
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
            {totalDocs}
          </span>
        </div>
        
        {/* Data Intelligence Bar */}
        <div className={cn(
          "px-3 py-2 border-t",
          isSatellite ? "border-zinc-700 bg-zinc-800/60" : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60"
        )}>
          <div className="flex items-center justify-between gap-2">
            {/* Source */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Database className="w-3 h-3 opacity-50" />
                  <span className="text-[9px] opacity-70">GDELT</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Global Database of Events, Language, and Tone
              </TooltipContent>
            </Tooltip>
            
            {/* Confidence indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    LIVE
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Real-time data from GDELT
              </TooltipContent>
            </Tooltip>
            
            {/* Live pulse */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] opacity-70">Active</span>
            </div>
          </div>
        </div>
        
        {/* Footer with timestamp */}
        <div className={cn(
          "px-3 py-1.5 border-t text-[8px] flex items-center justify-between",
          isSatellite 
            ? "border-zinc-700 bg-zinc-800/80 text-zinc-400" 
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400"
        )}>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
          </span>
          <span className="uppercase tracking-wider">
            Bangladesh
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
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
