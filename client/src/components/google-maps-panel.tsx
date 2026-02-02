import { useEffect, useState, useCallback } from "react"
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow, useMapsLibrary } from "@vis.gl/react-google-maps"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Target, Layers, MapPin, Crosshair, ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { INFRASTRUCTURE_NODES, type InfrastructureNode } from "./map-infrastructure-layer"
import { LensLegend, SmartMapControls, type MapLens } from "./map-lens-selector"
import { SmartIntelLegend, GOLDSTEIN_CATEGORIES, type GoldsteinCategory, type GdeltEvent, type GdeltDoc } from "./map-intel-layer"
import { MapLibrePanel } from "./maplibre-panel"

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
  className?: string
}

const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 }

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

function MapClickHandler({ onAOIChange }: { onAOIChange?: (aoi: AOI) => void }) {
  const map = useMap()
  const mapsLib = useMapsLibrary("maps")
  
  useEffect(() => {
    if (!map || !onAOIChange || !mapsLib) return
    
    const listener = map.addListener("click", (e: { latLng?: { lat: () => number; lng: () => number } }) => {
      if (e.latLng) {
        onAOIChange({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          radiusKm: 5
        })
      }
    })
    
    return () => {
      if (listener && mapsLib.event) {
        mapsLib.event.removeListener(listener)
      }
    }
  }, [map, mapsLib, onAOIChange])
  
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
  const [hiddenCategories, setHiddenCategories] = useState<Set<GoldsteinCategory>>(new Set())
  
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
  
  const gdeltEvents: GdeltEvent[] = intelData?.events || []
  const gdeltDocs: GdeltDoc[] = intelData?.docs || []
  
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

  return (
    <>
      <MapTypeController mapType={mapStyle} />
      <ZoomController onZoomChange={setZoomLevel} />
      <MapClickHandler onAOIChange={onAOIChange} />
      
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
      
      {/* Top-left: Map style toggle only */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex gap-0.5 bg-background/95 backdrop-blur-sm rounded-md border overflow-hidden">
          <Button
            size="sm"
            variant={mapStyle === "roadmap" ? "default" : "ghost"}
            onClick={() => setMapStyle("roadmap")}
            className="rounded-none h-8 px-3"
            data-testid="button-map-streets"
          >
            <Layers className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={mapStyle === "satellite" ? "default" : "ghost"}
            onClick={() => setMapStyle("satellite")}
            className="rounded-none h-8 px-3"
            data-testid="button-map-satellite"
          >
            <Target className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={mapStyle === "hybrid" ? "default" : "ghost"}
            onClick={() => setMapStyle("hybrid")}
            className="rounded-none h-8 px-3"
            data-testid="button-map-hybrid"
          >
            <MapPin className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bottom-left: Smart Map Controls with innovative zoom */}
      <div className="absolute bottom-3 left-3 z-10">
        <SmartMapControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenterAOI={aoi ? handleCenterOnAOI : undefined}
          aoiName={aoi?.name}
          mapStyle={mapStyle === "roadmap" ? "streets" : mapStyle}
        />
      </div>

      {/* Bottom-right: Legend - switches based on active lens */}
      <div className="absolute bottom-3 right-3 z-10">
        {activeLens === "intel" ? (
          <SmartIntelLegend
            events={gdeltEvents}
            docs={gdeltDocs}
            coverage={intelData?.coverage || null}
            hiddenCategories={hiddenCategories}
            onToggleCategory={toggleCategory}
            onRefresh={() => refetchIntel()}
            isLoading={intelLoading}
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
      <APIProvider apiKey={apiKey}>
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
