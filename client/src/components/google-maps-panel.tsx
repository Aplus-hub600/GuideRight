import { useEffect, useRef, useState, useCallback, useMemo } from "react"
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
import { RiskZoneLayer } from "./risk-zone-layer"

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
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-bl-md">
      <span className="font-mono text-[10px] text-white/70">{formatZulu()}</span>
      <div className="w-px h-3 bg-white/20" />
      <span className="font-mono text-[10px] text-white/60">{getLensLabel(activeLens)}</span>
      {dataAge !== null && (
        <>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            dataFresh && "bg-green-400",
            dataStale && "bg-amber-400",
            !dataFresh && !dataStale && "bg-red-400"
          )} />
          <span className="font-mono text-[10px] text-white/50">{formatAge(dataAge)}</span>
        </>
      )}
      {aoi && (
        <>
          <div className="w-px h-3 bg-white/20" />
          <span className="font-mono text-[10px] text-white/50">
            {aoi.lat.toFixed(3)}°, {aoi.lng.toFixed(3)}°
          </span>
        </>
      )}
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

// When the infrastructure lens is active, auto-switch to satellite so the base map
// renders zero city/neighborhood/road labels — giving infra markers a clean visual field.
// Restores the previous map style on lens change.
function MapLabelController({
  activeLens,
  mapStyle,
  setMapStyle,
}: {
  activeLens: MapLens
  mapStyle: "roadmap" | "satellite" | "hybrid"
  setMapStyle: (s: "roadmap" | "satellite" | "hybrid") => void
}) {
  const prevStyleRef = useRef<"roadmap" | "satellite" | "hybrid">(mapStyle)

  useEffect(() => {
    if (activeLens === "infrastructure") {
      // Save whatever the user had before and go label-free
      if (mapStyle !== "satellite") {
        prevStyleRef.current = mapStyle
        setMapStyle("satellite")
      }
    } else {
      // Restore what the user had (only if we were the ones who changed it)
      if (prevStyleRef.current && mapStyle === "satellite") {
        setMapStyle(prevStyleRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLens])

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
        <div className="absolute w-10 h-10 flex items-center justify-center">
          <div className="absolute w-10 h-0.5 bg-cyan-400/70" />
          <div className="absolute w-0.5 h-10 bg-cyan-400/70" />
          <div className="absolute w-5 h-5 border border-cyan-400/50 rounded-full" />
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full" />
        </div>
        <div 
          className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono"
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

  const shadowColor = sample.label === 'High' 
    ? 'shadow-red-500/40' 
    : sample.label === 'Medium' 
      ? 'shadow-yellow-500/40' 
      : 'shadow-green-500/40'
  
  return (
    <>
      <AdvancedMarker 
        position={{ lat: sample.lat, lng: sample.lng }}
        onClick={() => setShowInfo(true)}
      >
        <div className={cn(
          "w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold",
          bgColor, shadowColor
        )}>
          {index + 1}
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

function AOIAdvancedMarker({ aoi, dim }: { aoi: AOI; dim?: boolean }) {
  const [showInfo, setShowInfo] = useState(false)
  
  return (
    <>
      <AdvancedMarker
        position={{ lat: aoi.lat, lng: aoi.lng }}
        onClick={() => setShowInfo(true)}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", opacity: dim ? 0.2 : 1, transition: "opacity 0.3s ease" }}>
          <div style={{
            position: "absolute",
            width: 36,
            height: 36,
            background: "rgba(59,130,246,0.15)",
            borderRadius: "50%",
            border: "1px solid rgba(59,130,246,0.3)",
          }} />
          <div 
            style={{
              width: 20,
              height: 20,
              background: "#3b82f6",
              border: "2.5px solid white",
              borderRadius: "50%",
              boxShadow: "0 2px 6px rgba(59,130,246,0.4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 6, height: 6, background: "white", borderRadius: "50%" }} />
          </div>
        </div>
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

function SigActAdvancedMarkers({ sigacts, dim }: { sigacts: SigAct[]; dim?: boolean }) {
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
              width: 22,
              height: 22,
              background: confidenceColor,
              border: "2.5px solid white",
              borderRadius: "50%",
              boxShadow: `0 2px 8px ${confidenceColor}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: "-0.5px",
              opacity: dim ? 0.2 : 1,
              transition: "opacity 0.3s ease",
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

const INFRA_PALETTE: Record<string, { color: string; glow: string }> = {
  hospital:   { color: "#ef4444", glow: "rgba(239,68,68,0.6)"  },
  transport:  { color: "#3b82f6", glow: "rgba(59,130,246,0.6)" },
  government: { color: "#a855f7", glow: "rgba(168,85,247,0.6)" },
  utility:    { color: "#f59e0b", glow: "rgba(245,158,11,0.6)" },
  education:  { color: "#06b6d4", glow: "rgba(6,182,212,0.6)"  },
}

// SVG icons per category/subCategory — designed to be legible at 12-14px
function getInfraIconSvg(category: string, subCategory?: string): string {
  switch (category) {
    case "hospital":
      // Medical cross — universally understood
      return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><rect x="5" y="1" width="3" height="11" rx="0.8"/><rect x="1" y="5" width="11" height="3" rx="0.8"/></svg>`
    case "transport":
      if (subCategory?.includes("airport") || subCategory?.includes("air"))
        // Simplified plane silhouette
        return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><path d="M6.5 1 L10 7 H8 L8 10 H5 L5 7 H3 L6.5 1Z"/><rect x="2" y="11" width="9" height="1.2" rx="0.6"/></svg>`
      if (subCategory?.includes("rail") || subCategory?.includes("train"))
        // Railroad tracks
        return `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round"><line x1="4" y1="2" x2="3.2" y2="11"/><line x1="9" y1="2" x2="9.8" y2="11"/><line x1="3.8" y1="4.5" x2="9.2" y2="4.5"/><line x1="3.5" y1="7.5" x2="9.5" y2="7.5"/></svg>`
      // Water/port — anchor
      return `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round"><circle cx="6.5" cy="3.5" r="1.5"/><line x1="6.5" y1="5" x2="6.5" y2="11"/><path d="M3 7 Q6.5 11 10 7"/><line x1="3" y1="7" x2="3" y2="9"/><line x1="10" y1="7" x2="10" y2="9"/></svg>`
    case "utility":
      if (subCategory?.includes("water"))
        // Water drop
        return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><path d="M6.5 1 C6.5 1 2 6.5 2 8.5 C2 10.5 4.1 12 6.5 12 C8.9 12 11 10.5 11 8.5 C11 6.5 6.5 1 6.5 1Z"/></svg>`
      // Lightning bolt — power
      return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><path d="M7.5 1 L3 7.5 H6.5 L5.5 12 L10 5.5 H6.5 L7.5 1Z"/></svg>`
    case "government":
      // Classical columns / building
      return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><rect x="1" y="10.5" width="11" height="1.5"/><rect x="1" y="4" width="11" height="1.5"/><polygon points="6.5,1 1,4 12,4"/><rect x="2.5" y="5.5" width="1.5" height="5"/><rect x="5.75" y="5.5" width="1.5" height="5"/><rect x="9" y="5.5" width="1.5" height="5"/></svg>`
    case "education":
      // Graduation cap
      return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><polygon points="6.5,2 12,5 6.5,8 1,5"/><path d="M3.5 6.2 L3.5 9.5 Q3.5 11 6.5 11 Q9.5 11 9.5 9.5 L9.5 6.2"/><line x1="11" y1="5" x2="11" y2="8.5" stroke="white" stroke-width="1.2"/></svg>`
    default:
      return `<svg width="13" height="13" viewBox="0 0 13 13" fill="white"><circle cx="6.5" cy="6.5" r="4"/></svg>`
  }
}

// Confidence drives size, glow intensity, and label opacity — not border style
const INFRA_CONFIDENCE: Record<string, { size: number; glowMult: number; labelOpacity: number; markerOpacity: number }> = {
  verified:        { size: 32, glowMult: 1.0, labelOpacity: 0.95, markerOpacity: 1.00 },
  "single-source": { size: 22, glowMult: 0.5, labelOpacity: 0.75, markerOpacity: 0.85 },
  inferred:        { size: 16, glowMult: 0.2, labelOpacity: 0.55, markerOpacity: 0.60 },
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
  
  return (
    <>
      {/* Hover-reveal + pulse animation CSS */}
      <style>{`
        .infra-pin { position: relative; cursor: pointer; }
        .infra-pin .infra-label { visibility: hidden; }
        .infra-pin:hover .infra-label { visibility: visible; }
        @keyframes infra-pulse {
          0%   { box-shadow: var(--infra-shadow), 0 0 0 0 var(--infra-glow-color); }
          60%  { box-shadow: var(--infra-shadow), 0 0 0 10px transparent; }
          100% { box-shadow: var(--infra-shadow), 0 0 0 0 transparent; }
        }
        .infra-verified { animation: infra-pulse 2.4s ease-out infinite; }
      `}</style>

      {nodes.map((node, index) => {
        const palette = INFRA_PALETTE[node.category] ?? INFRA_PALETTE.utility
        const conf    = INFRA_CONFIDENCE[node.confidence] ?? INFRA_CONFIDENCE.inferred
        const glow    = conf.glowMult
        const iconSvg = getInfraIconSvg(node.category, node.subCategory)

        return (
          <AdvancedMarker
            key={index}
            position={{ lat: node.lat, lng: node.lng }}
            onClick={() => onNodeClick(node)}
          >
            <div className="infra-pin">
              {/* Circle icon — only thing visible by default */}
              <div
                className={node.confidence === "verified" ? "infra-verified" : undefined}
                style={{
                  width: conf.size,
                  height: conf.size,
                  background: palette.color,
                  borderRadius: "50%",
                  border: `2.5px solid rgba(255,255,255,${0.5 + glow * 0.5})`,
                  // CSS vars feed the pulse keyframe so glow color matches category
                  ["--infra-shadow" as string]: [
                    `0 0 ${Math.round(10 * glow + 4)}px ${palette.glow}`,
                    `0 0 ${Math.round(22 * glow + 4)}px ${palette.glow}`,
                    `0 3px 8px rgba(0,0,0,0.7)`,
                  ].join(", "),
                  ["--infra-glow-color" as string]: palette.glow,
                  boxShadow: [
                    `0 0 ${Math.round(10 * glow + 4)}px ${palette.glow}`,
                    `0 0 ${Math.round(22 * glow + 4)}px ${palette.glow}`,
                    `0 3px 8px rgba(0,0,0,0.7)`,
                  ].join(", "),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: conf.markerOpacity,
                }}
                dangerouslySetInnerHTML={{ __html: iconSvg }}
              />

              {/* Label — absolutely positioned, revealed on hover, no layout shift */}
              <div
                className="infra-label"
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.88)",
                  borderLeft: `2.5px solid ${palette.color}`,
                  padding: "2px 6px 2px 5px",
                  fontSize: 9,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  boxShadow: `0 1px 6px rgba(0,0,0,0.7), 0 0 5px ${palette.glow}`,
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {node.name}
              </div>
            </div>
          </AdvancedMarker>
        )
      })}
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
        const size = Math.min(22, Math.max(14, (event.numMentions || 10) / 5 + 12))
        
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
              border: "2px solid rgba(255,255,255,0.85)",
              borderRadius: "50%",
              boxShadow: `0 2px 6px ${color}55`,
              cursor: "pointer",
              opacity: 0.9
            }} />
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
            setActiveLens("risk-stress")
            break
          case 'L':
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
      <MapLabelController activeLens={activeLens} mapStyle={mapStyle} setMapStyle={setMapStyle} />
      <ZoomController onZoomChange={setZoomLevel} />
      <MapClickHandler 
        onAOIChange={onAOIChange} 
        onDensitySample={handleDensitySample}
        activeLens={activeLens}
      />
      
      {aoi && <AOIAdvancedMarker aoi={aoi} dim={activeLens === "infrastructure"} />}
      <SigActAdvancedMarkers sigacts={sigacts} dim={activeLens === "infrastructure"} />
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
      <RiskZoneLayer visible={activeLens === "risk-stress"} />
      
      {/* Top-left: Map style toggle - minimal */}
      <div className="absolute top-0 left-0 z-10">
        <div className="flex bg-black/50 backdrop-blur-sm overflow-hidden rounded-br-md">
          <button
            onClick={() => setMapStyle("roadmap")}
            className={cn("px-2 py-1 text-[10px] font-medium transition-colors", mapStyle === "roadmap" ? "bg-white/20 text-white" : "text-white/50 hover:text-white/70")}
            data-testid="button-map-streets"
            title="Streets (Ctrl+M)"
          >
            Map
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={cn("px-2 py-1 text-[10px] font-medium transition-colors", mapStyle === "satellite" ? "bg-white/20 text-white" : "text-white/50 hover:text-white/70")}
            data-testid="button-map-satellite"
            title="Satellite (Ctrl+S)"
          >
            Sat
          </button>
          <button
            onClick={() => setMapStyle("hybrid")}
            className={cn("px-2 py-1 text-[10px] font-medium transition-colors", mapStyle === "hybrid" ? "bg-white/20 text-white" : "text-white/50 hover:text-white/70")}
            data-testid="button-map-hybrid"
            title="Hybrid (Ctrl+H)"
          >
            Hyb
          </button>
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
