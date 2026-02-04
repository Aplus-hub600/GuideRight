import { useEffect, useState, useCallback, useMemo } from "react"
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow, useMapsLibrary } from "@vis.gl/react-google-maps"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Target, Layers, MapPin, Crosshair, ZoomIn, ZoomOut, Loader2, Clock, Navigation, Radio, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { INFRASTRUCTURE_NODES, type InfrastructureNode } from "./map-infrastructure-layer"
import { LensLegend, SmartMapControls, type MapLens } from "./map-lens-selector"
import { SmartIntelLegend, GOLDSTEIN_CATEGORIES, type GoldsteinCategory, type GdeltEvent, type GdeltDoc } from "./map-intel-layer"
import { MapLibrePanel } from "./maplibre-panel"
import { PopulationHeatmapLayer, PopulationLegend } from "./population-heatmap"
import { getPopulationGrid, sampleDensityAtLocation, type PopulationGridData } from "@/lib/population-grid"
import { TrafficLayer, TrafficLegend } from "./traffic-layer"
import { IntelHeatmapLayer, IntelHeatmapLegend } from "./intel-heatmap"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface MovementPlan {
  route: Array<{ lat: number; lng: number }>
  rationale: string
}

interface SigAct {
  who: string
  what: string
  where: string
  when: string
  why: string
  confidence: number
  lat?: number
  lng?: number
}

interface GoogleMapsPanelProps {
  aoi?: AOI
  riskScore?: number
  movementPlan?: MovementPlan
  sigacts?: SigAct[]
  onAOIChange?: (aoi: AOI) => void
  onMovementPlanRequest?: () => void
  selectedODINCountry?: string
  onODINCountryChange?: (country: string) => void
  activeLens?: MapLens
  onLensChange?: (lens: MapLens) => void
  onDensitySample?: (sample: DensitySample) => void
  className?: string
}

const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 }

// Per-lens data update timestamps
type LensDataTimestamps = Partial<Record<MapLens, Date>>

// Tactical Status Bar for map - shows Zulu time, coordinates, zoom, and active layer
function TacticalMapStatus({ 
  aoi, 
  zoomLevel, 
  activeLens,
  lensTimestamps
}: { 
  aoi?: AOI
  zoomLevel: number
  activeLens: MapLens
  lensTimestamps: LensDataTimestamps
}) {
  const [now, setNow] = useState(Date.now())
  
  // Update time and data age every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  
  const formatZulu = () => {
    return new Date(now).toISOString().slice(11, 19) + "Z"
  }
  
  const getLensLabel = (lens: MapLens) => {
    switch (lens) {
      case "intel": return "SIGINT"
      case "infrastructure": return "INFRA"
      case "human-activity": return "POP"
      case "logistics": return "TRAFFIC"
      default: return lens.toUpperCase()
    }
  }
  
  // Get timestamp for current active lens only
  const lastDataUpdate = lensTimestamps[activeLens]
  const dataAge = lastDataUpdate ? Math.floor((now - lastDataUpdate.getTime()) / 1000) : null
  const dataFresh = dataAge !== null && dataAge < 60
  const dataStale = dataAge !== null && dataAge >= 60 && dataAge < 300
  
  const formatAge = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    return `${Math.floor(seconds / 3600)}h`
  }
  
  return (
    <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm border-l border-b border-white/20 px-3 py-1.5 rounded-bl-md">
      {/* Zulu Time */}
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-white/70" />
        <span className="font-mono text-sm font-medium text-white">{formatZulu()}</span>
      </div>
      
      <div className="w-px h-4 bg-white/30" />
      
      {/* Coordinates */}
      {aoi && (
        <>
          <div className="flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-white/70" />
            <span className="font-mono text-sm text-white">
              {aoi.lat.toFixed(4)}°, {aoi.lng.toFixed(4)}°
            </span>
          </div>
          <div className="w-px h-4 bg-white/30" />
        </>
      )}
      
      {/* Zoom Level */}
      <div className="flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-white/70" />
        <span className="font-mono text-sm text-white">Z{zoomLevel}</span>
      </div>
      
      <div className="w-px h-4 bg-white/30" />
      
      {/* Active Layer with Data Freshness */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-bold gap-1.5 px-2 py-0.5 border-white/40 text-white bg-white/10">
          <Radio className={cn(
            "h-3 w-3",
            dataFresh && "text-green-400",
            dataStale && "text-amber-400",
            dataAge !== null && !dataFresh && !dataStale && "text-red-400",
            dataAge === null && "text-white/70"
          )} />
          {getLensLabel(activeLens)}
        </Badge>
        {dataAge !== null && (
          <span className={cn(
            "font-mono text-sm font-medium",
            dataFresh && "text-green-400",
            dataStale && "text-amber-400",
            !dataFresh && !dataStale && "text-red-400"
          )}>
            {formatAge(dataAge)}
          </span>
        )}
      </div>
    </div>
  )
}

function MapTypeController({ mapType }: { mapType: "roadmap" | "satellite" | "hybrid" }) {
  const map = useMap()
  
  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType)
    }
  }, [map, mapType])
  
  return null
}

function ZoomController({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap()
  const mapsLib = useMapsLibrary("maps")
  
  useEffect(() => {
    if (!map || !mapsLib) return
    
    const listener = map.addListener("zoom_changed", () => {
      onZoomChange(Math.round(map.getZoom() || 10))
    })
    
    return () => {
      if (listener && mapsLib.event) {
        mapsLib.event.removeListener(listener)
      }
    }
  }, [map, mapsLib, onZoomChange])
  
  return null
}

export interface DensitySample {
  lat: number
  lng: number
  density: number
  rawDensity: number
  urbanLevel: 'high' | 'medium' | 'low'
  label: string
  timestamp: string
  source: string
}

/**
 * GridCrosshair - Keyboard-navigable crosshair for precise grid sampling
 * G to toggle, Arrow keys to move (Shift for fast), Enter to sample, Escape to hide
 */
function GridCrosshair({
  visible,
  onSample,
  initialPosition
}: {
  visible: boolean
  onSample: (sample: DensitySample) => void
  initialPosition?: { lat: number; lng: number }
}) {
  const map = useMap()
  const [crosshairPosition, setCrosshairPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [showCrosshair, setShowCrosshair] = useState(false)
  
  // Grid step size based on 40x40 grid over ~30km area
  const GRID_STEP = 0.0075 // approximately 750m
  
  // Initialize crosshair position from map center or initial position
  useEffect(() => {
    if (visible && map && !crosshairPosition) {
      const center = map.getCenter()
      if (center) {
        setCrosshairPosition(initialPosition || { lat: center.lat(), lng: center.lng() })
      }
    }
  }, [visible, map, crosshairPosition, initialPosition])
  
  // Keyboard handler for crosshair navigation
  useEffect(() => {
    if (!visible || !map) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in interactive element
      const target = e.target as HTMLElement
      const tagName = target.tagName.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || 
          target.isContentEditable || 
          target.getAttribute('role') === 'textbox' ||
          target.getAttribute('role') === 'combobox') {
        return
      }
      
      // Toggle crosshair with G key
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setShowCrosshair(prev => !prev)
        if (!crosshairPosition && map) {
          const center = map.getCenter()
          if (center) {
            setCrosshairPosition({ lat: center.lat(), lng: center.lng() })
          }
        }
        return
      }
      
      if (!showCrosshair || !crosshairPosition) return
      
      // Arrow key navigation
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const step = e.shiftKey ? GRID_STEP * 3 : GRID_STEP // Shift for faster movement
        
        setCrosshairPosition(prev => {
          if (!prev) return prev
          let newLat = prev.lat
          let newLng = prev.lng
          
          switch (e.key) {
            case 'ArrowUp': newLat += step; break
            case 'ArrowDown': newLat -= step; break
            case 'ArrowRight': newLng += step; break
            case 'ArrowLeft': newLng -= step; break
          }
          
          // Pan map to keep crosshair visible
          if (map) {
            const bounds = map.getBounds()
            if (bounds && !bounds.contains({ lat: newLat, lng: newLng })) {
              map.panTo({ lat: newLat, lng: newLng })
            }
          }
          
          return { lat: newLat, lng: newLng }
        })
        return
      }
      
      // Enter to sample
      if (e.key === 'Enter' && crosshairPosition) {
        e.preventDefault()
        const grid = getPopulationGrid()
        const sample = sampleDensityAtLocation(crosshairPosition.lat, crosshairPosition.lng, grid)
        if (sample) {
          onSample({
            lat: crosshairPosition.lat,
            lng: crosshairPosition.lng,
            density: sample.density,
            rawDensity: sample.rawDensity,
            urbanLevel: sample.urbanLevel,
            label: sample.label,
            timestamp: grid.timestamp,
            source: grid.source
          })
        }
        return
      }
      
      // Escape to hide crosshair
      if (e.key === 'Escape') {
        setShowCrosshair(false)
        return
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, map, showCrosshair, crosshairPosition, onSample])
  
  if (!visible || !showCrosshair || !crosshairPosition) return null
  
  return (
    <AdvancedMarker position={crosshairPosition}>
      <div className="relative flex items-center justify-center">
        {/* Crosshair reticle */}
        <div className="absolute w-12 h-12 flex items-center justify-center">
          <div className="absolute w-12 h-0.5 bg-cyan-400 shadow-lg shadow-cyan-400/50" />
          <div className="absolute w-0.5 h-12 bg-cyan-400 shadow-lg shadow-cyan-400/50" />
          <div className="absolute w-6 h-6 border-2 border-cyan-400 rounded-full animate-pulse" />
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full" />
        </div>
        {/* Position indicator */}
        <div 
          className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-cyan-400 px-2 py-1 rounded text-xs font-mono"
          style={{ minWidth: 120, textAlign: 'center' }}
        >
          {crosshairPosition.lat.toFixed(4)}, {crosshairPosition.lng.toFixed(4)}
        </div>
      </div>
    </AdvancedMarker>
  )
}

/**
 * PinnedSampleMarker - Displays a pinned density sample on the map
 */
function PinnedSampleMarker({ 
  sample, 
  index, 
  onRemove 
}: { 
  sample: DensitySample
  index: number
  onRemove: () => void 
}) {
  const [showInfo, setShowInfo] = useState(false)
  
  const bgColor = sample.label === 'High' 
    ? 'bg-red-500' 
    : sample.label === 'Medium' 
      ? 'bg-yellow-500' 
      : 'bg-green-500'
  
  return (
    <>
      <AdvancedMarker 
        position={{ lat: sample.lat, lng: sample.lng }}
        onClick={() => setShowInfo(true)}
      >
        <div className="relative">
          <div className={cn(
            "w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold",
            bgColor
          )}>
            {index + 1}
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border border-white" />
        </div>
      </AdvancedMarker>
      {showInfo && (
        <InfoWindow
          position={{ lat: sample.lat, lng: sample.lng }}
          onCloseClick={() => setShowInfo(false)}
        >
          <div style={{ padding: 8, fontFamily: "system-ui", minWidth: 180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ fontSize: 12 }}>PIN #{index + 1}</strong>
              <button 
                onClick={onRemove}
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  padding: '2px 6px', 
                  borderRadius: 4, 
                  fontSize: 10,
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Location:</span> {sample.lat.toFixed(4)}, {sample.lng.toFixed(4)}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Activity:</span> {sample.label}
              </div>
              <div style={{ marginBottom: 4, fontSize: 10, fontStyle: 'italic', color: '#888' }}>
                Pattern-based estimate
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>
                Sampled: {new Date(sample.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

/**
 * PinnedSamplesLayer - Manages and displays pinned density samples
 */
function PinnedSamplesLayer({
  visible,
  pinnedSamples,
  onRemoveSample
}: {
  visible: boolean
  pinnedSamples: DensitySample[]
  onRemoveSample: (index: number) => void
}) {
  if (!visible || pinnedSamples.length === 0) return null
  
  return (
    <>
      {pinnedSamples.map((sample, index) => (
        <PinnedSampleMarker
          key={`${sample.lat}-${sample.lng}-${index}`}
          sample={sample}
          index={index}
          onRemove={() => onRemoveSample(index)}
        />
      ))}
    </>
  )
}

function MapClickHandler({ 
  onAOIChange,
  onDensitySample,
  activeLens
}: { 
  onAOIChange?: (aoi: AOI) => void
  onDensitySample?: (sample: DensitySample) => void
  activeLens?: MapLens
}) {
  const map = useMap()
  const mapsLib = useMapsLibrary("maps")
  
  useEffect(() => {
    if (!map || !mapsLib) return
    
    const listener = map.addListener("click", (e: { latLng?: { lat: () => number; lng: () => number } }) => {
      if (!e.latLng) return
      
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      
      // When population density lens is active, sample density instead of changing AOI
      if (activeLens === "human-activity" && onDensitySample) {
        const grid = getPopulationGrid()
        const sample = sampleDensityAtLocation(lat, lng, grid)
        
        if (sample) {
          onDensitySample({
            lat,
            lng,
            density: sample.density,
            rawDensity: sample.rawDensity,
            urbanLevel: sample.urbanLevel,
            label: sample.label,
            timestamp: grid.timestamp,
            source: grid.source
          })
        }
        return // Don't change AOI when sampling density
      }
      
      // Default behavior: update AOI
      if (onAOIChange) {
        onAOIChange({
          lat,
          lng,
          radiusKm: 5
        })
      }
    })
    
    return () => {
      if (listener && mapsLib.event) {
        mapsLib.event.removeListener(listener)
      }
    }
  }, [map, mapsLib, onAOIChange, onDensitySample, activeLens])
  
  return null
}

function AOIAdvancedMarker({ aoi }: { aoi: AOI }) {
  const [showInfo, setShowInfo] = useState(false)
  
  return (
    <>
      <AdvancedMarker
        position={{ lat: aoi.lat, lng: aoi.lng }}
        onClick={() => setShowInfo(true)}
      >
        <div 
          style={{
            width: 24,
            height: 24,
            background: "#3b82f6",
            border: "3px solid white",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            cursor: "pointer"
          }}
        />
      </AdvancedMarker>
      {showInfo && (
        <InfoWindow
          position={{ lat: aoi.lat, lng: aoi.lng }}
          onCloseClick={() => setShowInfo(false)}
        >
          <div style={{ padding: 8, fontFamily: "system-ui" }}>
            <strong>{aoi.name || "Area of Interest"}</strong><br/>
            <span style={{ color: "#666", fontSize: 12 }}>
              {aoi.lat.toFixed(4)}, {aoi.lng.toFixed(4)}
              {aoi.radiusKm ? ` (${aoi.radiusKm}km radius)` : ""}
            </span>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

function SigActAdvancedMarkers({ sigacts }: { sigacts: SigAct[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  return (
    <>
      {sigacts.map((sigact, index) => {
        if (!sigact.lat || !sigact.lng) return null
        
        const confidenceColor = sigact.confidence >= 0.7 ? "#22c55e" : 
                                sigact.confidence >= 0.4 ? "#f59e0b" : "#ef4444"
        
        return (
          <AdvancedMarker
            key={index}
            position={{ lat: sigact.lat, lng: sigact.lng }}
            onClick={() => setSelectedIndex(index)}
          >
            <div style={{
              width: 20,
              height: 20,
              background: confidenceColor,
              border: "2px solid white",
              borderRadius: "50%",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 10,
              fontWeight: "bold"
            }}>
              {index + 1}
            </div>
          </AdvancedMarker>
        )
      })}
      {selectedIndex !== null && sigacts[selectedIndex]?.lat && sigacts[selectedIndex]?.lng && (
        <InfoWindow
          position={{ lat: sigacts[selectedIndex].lat!, lng: sigacts[selectedIndex].lng! }}
          onCloseClick={() => setSelectedIndex(null)}
        >
          <div style={{ padding: 8, fontFamily: "system-ui", maxWidth: 250 }}>
            <strong style={{ color: "#333" }}>{sigacts[selectedIndex].what}</strong><br/>
            <span style={{ color: "#666", fontSize: 12 }}>
              <b>Who:</b> {sigacts[selectedIndex].who}<br/>
              <b>Where:</b> {sigacts[selectedIndex].where}<br/>
              <b>When:</b> {sigacts[selectedIndex].when}<br/>
              <b>Why:</b> {sigacts[selectedIndex].why}<br/>
              <b>Confidence:</b> {Math.round(sigacts[selectedIndex].confidence * 100)}%
            </span>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

function InfrastructureAdvancedMarkers({ 
  nodes, 
  visible, 
  onNodeClick 
}: { 
  nodes: InfrastructureNode[]
  visible: boolean
  onNodeClick: (node: InfrastructureNode) => void 
}) {
  if (!visible) return null
  
  const getNodeColor = (category: string) => {
    switch (category) {
      case "hospital": return "#ef4444"
      case "transport": return "#3b82f6"
      case "government": return "#8b5cf6"
      case "utility": return "#f59e0b"
      case "education": return "#06b6d4"
      default: return "#6b7280"
    }
  }
  
  return (
    <>
      {nodes.map((node, index) => (
        <AdvancedMarker
          key={index}
          position={{ lat: node.lat, lng: node.lng }}
          onClick={() => onNodeClick(node)}
        >
          <div style={{
            width: 16,
            height: 16,
            background: getNodeColor(node.category),
            border: "2px solid white",
            borderRadius: "50%",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            cursor: "pointer"
          }} />
        </AdvancedMarker>
      ))}
    </>
  )
}

function CenterOnAOI({ aoi }: { aoi?: AOI }) {
  const map = useMap()
  
  useEffect(() => {
    if (map && aoi) {
      map.panTo({ lat: aoi.lat, lng: aoi.lng })
      map.setZoom(12)
    }
  }, [map, aoi?.lat, aoi?.lng])
  
  return null
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

function getGoldsteinCategory(scale: number | null): GoldsteinCategory {
  if (scale === null) return "neutral"
  if (scale >= 2) return "cooperation"
  if (scale >= 0) return "neutral"
  if (scale >= -3) return "tension"
  if (scale >= -6) return "conflict"
  return "severe"
}

function GdeltAdvancedMarkers({ 
  events, 
  visible,
  hiddenCategories = new Set(),
  onEventClick
}: { 
  events: GdeltEvent[]
  visible: boolean
  hiddenCategories?: Set<GoldsteinCategory>
  onEventClick?: (event: GdeltEvent) => void
}) {
  const [selectedEvent, setSelectedEvent] = useState<GdeltEvent | null>(null)
  
  if (!visible) return null
  
  const visibleEvents = events.filter(event => {
    if (!event.actionGeoLat || !event.actionGeoLon) return false
    const category = getGoldsteinCategory(event.goldsteinScale)
    return !hiddenCategories.has(category)
  })
  
  return (
    <>
      {visibleEvents.map((event, index) => {
        const color = getGoldsteinColor(event.goldsteinScale)
        const size = Math.min(24, Math.max(16, (event.numMentions || 10) / 5 + 14))
        
        return (
          <AdvancedMarker
            key={event.globalEventId || index}
            position={{ lat: event.actionGeoLat!, lng: event.actionGeoLon! }}
            onClick={() => {
              setSelectedEvent(event)
              if (onEventClick) onEventClick(event)
            }}
          >
            <div style={{
              width: size,
              height: size,
              background: color,
              border: "2px solid white",
              borderRadius: "50%",
              boxShadow: `0 2px 6px rgba(0,0,0,0.4), 0 0 0 2px ${color}40`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </AdvancedMarker>
        )
      })}
      
      {selectedEvent && selectedEvent.actionGeoLat && selectedEvent.actionGeoLon && (
        <InfoWindow
          position={{ lat: selectedEvent.actionGeoLat, lng: selectedEvent.actionGeoLon }}
          onCloseClick={() => setSelectedEvent(null)}
        >
          <div style={{ minWidth: 240, fontFamily: "system-ui, sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ 
                width: 10, 
                height: 10, 
                borderRadius: "50%", 
                background: getGoldsteinColor(selectedEvent.goldsteinScale) 
              }} />
              <span style={{ fontWeight: 600, fontSize: 11, color: getGoldsteinColor(selectedEvent.goldsteinScale) }}>
                {selectedEvent.quadClass || "GDELT Event"}
              </span>
            </div>
            
            <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 6 }}>
              {selectedEvent.actor1Name && (
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "#6b7280" }}>Actor 1:</span> {selectedEvent.actor1Name}
                </div>
              )}
              {selectedEvent.actor2Name && (
                <div>
                  <span style={{ color: "#6b7280" }}>Actor 2:</span> {selectedEvent.actor2Name}
                </div>
              )}
            </div>
            
            <div style={{ 
              display: "flex", 
              gap: 12, 
              fontSize: 10, 
              color: "#6b7280", 
              borderTop: "1px solid #e5e7eb", 
              paddingTop: 6 
            }}>
              <div><strong>{selectedEvent.numMentions || 0}</strong> mentions</div>
              <div>Tone: <strong>{selectedEvent.avgTone?.toFixed(1) || "N/A"}</strong></div>
              <div>GS: <strong>{selectedEvent.goldsteinScale?.toFixed(1) || "N/A"}</strong></div>
            </div>
            
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
              {selectedEvent.actionGeoFullname || "Unknown location"}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

function GoogleMapsContent({
  aoi,
  sigacts = [],
  onAOIChange,
  selectedODINCountry,
  onODINCountryChange,
  onMovementPlanRequest,
  onDensitySample,
  className,
  mapStyle,
  setMapStyle,
  activeLens,
  setActiveLens,
  zoomLevel,
  setZoomLevel,
  selectedInfraNode,
  setSelectedInfraNode
}: GoogleMapsPanelProps & {
  mapStyle: "roadmap" | "satellite" | "hybrid"
  setMapStyle: (style: "roadmap" | "satellite" | "hybrid") => void
  activeLens: MapLens
  setActiveLens: (lens: MapLens) => void
  zoomLevel: number
  setZoomLevel: (zoom: number) => void
  selectedInfraNode: InfrastructureNode | null
  setSelectedInfraNode: (node: InfrastructureNode | null) => void
}) {
  const map = useMap()
  const { toast } = useToast()
  const [hiddenCategories, setHiddenCategories] = useState<Set<GoldsteinCategory>>(new Set())
  const [lensTimestamps, setLensTimestamps] = useState<LensDataTimestamps>({ infrastructure: new Date() })
  const [pinnedSamples, setPinnedSamples] = useState<DensitySample[]>([])
  const [lastSample, setLastSample] = useState<DensitySample | null>(null)
  
  // Handle density sample and track last sample for pinning
  const handleDensitySample = useCallback((sample: DensitySample) => {
    setLastSample(sample)
    if (onDensitySample) {
      onDensitySample(sample)
    }
  }, [onDensitySample])
  
  // Pin sample handler with toast feedback
  const handlePinSample = useCallback(() => {
    if (!lastSample) {
      toast({
        title: "No sample to pin",
        description: "Click on the map or use crosshair (G) to sample first",
        variant: "destructive"
      })
      return
    }
    
    if (pinnedSamples.length >= 10) {
      toast({
        title: "Max pins reached",
        description: "Remove existing pins to add new ones (max 10)",
        variant: "destructive"
      })
      return
    }
    
    // Check if already pinned at this location
    const alreadyPinned = pinnedSamples.some(
      s => Math.abs(s.lat - lastSample.lat) < 0.0001 && Math.abs(s.lng - lastSample.lng) < 0.0001
    )
    
    if (alreadyPinned) {
      toast({
        title: "Already pinned",
        description: "This location is already pinned"
      })
      return
    }
    
    setPinnedSamples(prev => [...prev, lastSample])
    toast({
      title: `Pin #${pinnedSamples.length + 1} added`,
      description: `${lastSample.label} activity at ${lastSample.lat.toFixed(4)}, ${lastSample.lng.toFixed(4)}`
    })
  }, [lastSample, pinnedSamples, toast])
  
  // Remove pinned sample
  const handleRemovePinnedSample = useCallback((index: number) => {
    setPinnedSamples(prev => prev.filter((_, i) => i !== index))
  }, [])
  
  // Fetch GDELT data when intel lens is active
  const { data: intelData, refetch: refetchIntel, isLoading: intelLoading } = useQuery({
    queryKey: ["/api/intel/gdelt/query", aoi?.name, aoi?.lat, aoi?.lng],
    queryFn: async () => {
      if (!aoi) return null
      const response = await fetch("/api/intel/gdelt/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aoi: {
            name: aoi.name || "Selected Area",
            lat: aoi.lat,
            lon: aoi.lng,
            radiusKm: aoi.radiusKm || 50
          },
          timeWindowDays: 7
        })
      })
      if (!response.ok) throw new Error("Failed to fetch intel data")
      return response.json()
    },
    enabled: !!aoi && activeLens === "intel",
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
  
  // Fetch population data when human lens is active
  const { data: populationData, refetch: refetchPopulation, isLoading: populationLoading } = useQuery({
    queryKey: ["/api/intel/earth-engine/population", aoi?.lat, aoi?.lng],
    queryFn: async () => {
      if (!aoi) return null
      const response = await fetch("/api/intel/earth-engine/population", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: aoi.lat,
          lon: aoi.lng,
          radiusKm: 30,
          resolution: 'low'
        })
      })
      if (!response.ok) throw new Error("Failed to fetch population data")
      return response.json()
    },
    enabled: !!aoi && activeLens === "human-activity",
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  })
  
  const gdeltEvents: GdeltEvent[] = intelData?.events || []
  const gdeltDocs: GdeltDoc[] = intelData?.docs || []
  
  // Track when data was last updated per lens
  useEffect(() => {
    if (intelData) {
      setLensTimestamps(prev => ({ ...prev, intel: new Date() }))
    }
  }, [intelData])
  
  useEffect(() => {
    if (populationData) {
      setLensTimestamps(prev => ({ ...prev, "human-activity": new Date() }))
    }
  }, [populationData])
  
  const toggleCategory = useCallback((category: GoldsteinCategory) => {
    setHiddenCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])
  
  const handleZoomIn = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || 10) + 1)
    }
  }, [map])
  
  const handleZoomOut = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || 10) - 1)
    }
  }, [map])
  
  const handleCenterOnAOI = useCallback(() => {
    if (map && aoi) {
      map.panTo({ lat: aoi.lat, lng: aoi.lng })
      map.setZoom(12)
    }
  }, [map, aoi])

  // Map keyboard shortcuts - scoped to avoid conflicts with inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      
      // Skip if typing in any input-like element
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable ||
        target.getAttribute('role') === 'textbox' ||
        target.getAttribute('role') === 'combobox'
      ) return
      
      // Map style shortcuts with Ctrl modifier to avoid text conflicts
      if (e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault()
            setMapStyle("roadmap")
            break
          case 's':
            e.preventDefault()
            setMapStyle("satellite")
            break
          case 'h':
            e.preventDefault()
            setMapStyle("hybrid")
            break
        }
      }
      
      // Zoom and center shortcuts (no modifier needed for +/-/c)
      if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        switch (e.key) {
          case '+':
          case '=':
            handleZoomIn()
            break
          case '-':
            handleZoomOut()
            break
          case 'c':
          case 'C':
            if (aoi) handleCenterOnAOI()
            break
        }
      }
      
      // Alt+P to pin current sample (when in human-activity lens)
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key.toUpperCase() === 'P') {
        if (activeLens === "human-activity") {
          e.preventDefault()
          handlePinSample()
        }
      }
      
      // Layer shortcuts with Shift
      if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        switch (e.key.toUpperCase()) {
          case 'I':
            e.preventDefault()
            setActiveLens("intel")
            break
          case 'P':
            e.preventDefault()
            setActiveLens("human-activity")
            break
          case 'T':
            e.preventDefault()
            setActiveLens("logistics")
            break
          case 'F':
            e.preventDefault()
            setActiveLens("infrastructure")
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aoi, handleCenterOnAOI, handleZoomIn, handleZoomOut, setMapStyle, setActiveLens, activeLens, handlePinSample])

  return (
    <>
      <MapTypeController mapType={mapStyle} />
      <ZoomController onZoomChange={setZoomLevel} />
      <MapClickHandler 
        onAOIChange={onAOIChange} 
        onDensitySample={handleDensitySample}
        activeLens={activeLens}
      />
      
      {aoi && <AOIAdvancedMarker aoi={aoi} />}
      <SigActAdvancedMarkers sigacts={sigacts} />
      <InfrastructureAdvancedMarkers 
        nodes={INFRASTRUCTURE_NODES} 
        visible={activeLens === "infrastructure"}
        onNodeClick={setSelectedInfraNode}
      />
      <GdeltAdvancedMarkers
        events={gdeltEvents}
        visible={activeLens === "intel"}
        hiddenCategories={hiddenCategories}
      />
      <PopulationHeatmapLayer
        visible={activeLens === "human-activity"}
      />
      <GridCrosshair
        visible={activeLens === "human-activity"}
        onSample={handleDensitySample}
        initialPosition={aoi ? { lat: aoi.lat, lng: aoi.lng } : undefined}
      />
      <PinnedSamplesLayer
        visible={activeLens === "human-activity"}
        pinnedSamples={pinnedSamples}
        onRemoveSample={handleRemovePinnedSample}
      />
      <TrafficLayer visible={activeLens === "logistics"} />
      <IntelHeatmapLayer 
        events={gdeltEvents} 
        visible={activeLens === "intel"} 
      />
      
      {/* Top-left: Map style toggle - flush to corner */}
      <div className="absolute top-0 left-0 z-10">
        <div className="flex bg-background/95 backdrop-blur-sm border-r border-b overflow-hidden">
          <Button
            size="sm"
            variant={mapStyle === "roadmap" ? "default" : "ghost"}
            onClick={() => setMapStyle("roadmap")}
            className="rounded-none h-8 px-3"
            data-testid="button-map-streets"
            title="Streets (Ctrl+M)"
          >
            <Layers className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={mapStyle === "satellite" ? "default" : "ghost"}
            onClick={() => setMapStyle("satellite")}
            className="rounded-none h-8 px-3"
            data-testid="button-map-satellite"
            title="Satellite (Ctrl+S)"
          >
            <Target className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={mapStyle === "hybrid" ? "default" : "ghost"}
            onClick={() => setMapStyle("hybrid")}
            className="rounded-none h-8 px-3"
            data-testid="button-map-hybrid"
            title="Hybrid (Ctrl+H)"
          >
            <MapPin className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Top-right: Tactical Status Bar */}
      <div className="absolute top-0 right-0 z-10">
        <TacticalMapStatus
          aoi={aoi}
          zoomLevel={zoomLevel}
          activeLens={activeLens}
          lensTimestamps={lensTimestamps}
        />
      </div>

      {/* Bottom-left: Smart Map Controls - flush to corner */}
      <div className="absolute bottom-0 left-0 z-10">
        <SmartMapControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenterAOI={aoi ? handleCenterOnAOI : undefined}
          aoiName={aoi?.name}
          mapStyle={mapStyle === "roadmap" ? "streets" : mapStyle}
        />
      </div>

      {/* Bottom-right: Legend - flush to corner */}
      <div className="absolute bottom-0 right-0 z-10">
        {activeLens === "intel" ? (
          <IntelHeatmapLegend
            eventCount={gdeltEvents.length}
            conflictCount={gdeltEvents.filter(e => (e.goldsteinScale ?? 0) <= -3).length}
            tensionCount={gdeltEvents.filter(e => (e.goldsteinScale ?? 0) < 0 && (e.goldsteinScale ?? 0) > -3).length}
            cooperationCount={gdeltEvents.filter(e => (e.goldsteinScale ?? 0) >= 2).length}
            mapStyle={mapStyle === "roadmap" ? "streets" : mapStyle}
          />
        ) : activeLens === "human-activity" ? (
          <PopulationLegend
            data={populationData}
            isLoading={populationLoading}
            onRefresh={() => refetchPopulation()}
            mapStyle={mapStyle === "roadmap" ? "streets" : mapStyle}
          />
        ) : activeLens === "logistics" ? (
          <TrafficLegend
            mapStyle={mapStyle === "roadmap" ? "streets" : mapStyle}
          />
        ) : (
          <LensLegend 
            activeLens={activeLens} 
            mapStyle={mapStyle === "roadmap" ? "streets" : mapStyle}
          />
        )}
      </div>
    </>
  )
}

export function GoogleMapsPanel({
  aoi,
  riskScore,
  movementPlan,
  sigacts = [],
  onAOIChange,
  onMovementPlanRequest,
  selectedODINCountry,
  onODINCountryChange,
  activeLens: propActiveLens,
  onLensChange,
  onDensitySample,
  className
}: GoogleMapsPanelProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<"roadmap" | "satellite" | "hybrid">("roadmap")
  const [internalLens, setInternalLens] = useState<MapLens>("infrastructure")
  const [zoomLevel, setZoomLevel] = useState(10)
  const [selectedInfraNode, setSelectedInfraNode] = useState<InfrastructureNode | null>(null)
  
  // Use prop if provided, otherwise use internal state
  const activeLens = propActiveLens ?? internalLens
  const setActiveLens = onLensChange ?? setInternalLens
  
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/config/maps")
        const data = await response.json()
        
        if (data.success && data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setError(data.error || "Google Maps API key not available")
        }
      } catch (err) {
        setError("Failed to load Google Maps configuration")
      } finally {
        setLoading(false)
      }
    }
    
    fetchApiKey()
  }, [])
  
  if (loading) {
    return (
      <div className={cn("relative w-full h-full flex items-center justify-center bg-muted", className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading Google Maps...</span>
        </div>
      </div>
    )
  }
  
  if (error || !apiKey) {
    // Fallback to OpenStreetMap when Google Maps unavailable
    return (
      <MapLibrePanel
        aoi={aoi}
        onAOIChange={onAOIChange}
        activeLens="infrastructure"
        hideLensSelector={true}
        className={className}
      />
    )
  }

  const center = aoi ? { lat: aoi.lat, lng: aoi.lng } : DHAKA_CENTER

  return (
    <div className={cn("relative w-full h-full", className)}>
      <APIProvider apiKey={apiKey} libraries={['visualization', 'geometry', 'places']}>
        <Map
          defaultCenter={center}
          defaultZoom={10}
          gestureHandling="greedy"
          disableDefaultUI={true}
          mapId="tactical-map"
          style={{ width: "100%", height: "100%" }}
        >
          <GoogleMapsContent
            aoi={aoi}
            sigacts={sigacts}
            onAOIChange={onAOIChange}
            selectedODINCountry={selectedODINCountry}
            onODINCountryChange={onODINCountryChange}
            onMovementPlanRequest={onMovementPlanRequest}
            onDensitySample={onDensitySample}
            className={className}
            mapStyle={mapStyle}
            setMapStyle={setMapStyle}
            activeLens={activeLens}
            setActiveLens={setActiveLens}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            selectedInfraNode={selectedInfraNode}
            setSelectedInfraNode={setSelectedInfraNode}
          />
        </Map>
      </APIProvider>
    </div>
  )
}
