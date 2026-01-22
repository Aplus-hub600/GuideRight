import { useEffect, useState, useCallback } from "react"
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow, useMapsLibrary } from "@vis.gl/react-google-maps"
import { Button } from "@/components/ui/button"
import { Navigation, Target, Layers, MapPin, Crosshair, ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { ScenarioSelector } from "./scenario-selector"
import { MapScopeBar, type DataCoverage } from "./map-scope-bar"
import { MapLensSelector, LensLegend, type MapLens } from "./map-lens-selector"
import { INFRASTRUCTURE_NODES, type InfrastructureNode } from "./map-infrastructure-layer"
import { MapContextPanel } from "./map-context-panel"

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

function AOIMarker({ aoi }: { aoi: AOI }) {
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

function SigActMarkers({ sigacts }: { sigacts: SigAct[] }) {
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

function InfrastructureMarkers({ 
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
  setSelectedInfraNode,
  dynamicCoverage
}: GoogleMapsPanelProps & {
  mapStyle: "roadmap" | "satellite" | "hybrid"
  setMapStyle: (style: "roadmap" | "satellite" | "hybrid") => void
  activeLens: MapLens
  setActiveLens: (lens: MapLens) => void
  zoomLevel: number
  setZoomLevel: (zoom: number) => void
  selectedInfraNode: InfrastructureNode | null
  setSelectedInfraNode: (node: InfrastructureNode | null) => void
  dynamicCoverage: DataCoverage
}) {
  const { t } = useTranslation()
  const map = useMap()
  
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
      
      {aoi && <AOIMarker aoi={aoi} />}
      <SigActMarkers sigacts={sigacts} />
      <InfrastructureMarkers 
        nodes={INFRASTRUCTURE_NODES} 
        visible={activeLens === "infrastructure"}
        onNodeClick={setSelectedInfraNode}
      />
      
      <div className="absolute top-3 left-3 right-3 z-10">
        <MapScopeBar
          aoiName={aoi?.name || selectedODINCountry}
          scope="metropolitan"
          coverage={dynamicCoverage}
          zoomLevel={zoomLevel}
        />
      </div>

      <div className="absolute top-16 left-3 z-10 flex flex-col gap-2">
        <MapLensSelector
          activeLens={activeLens}
          onLensChange={setActiveLens}
        />
        
        <ScenarioSelector
          selectedCountry={selectedODINCountry}
          onScenarioChange={onODINCountryChange}
        />

        <div className="flex flex-col gap-0.5 bg-background/95 backdrop-blur-sm rounded-md border overflow-hidden">
          <Button
            size="sm"
            variant={mapStyle === "roadmap" ? "default" : "ghost"}
            onClick={() => setMapStyle("roadmap")}
            className="rounded-none justify-start gap-2 h-8"
            data-testid="button-map-streets"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="text-xs">Streets</span>
          </Button>
          <Button
            size="sm"
            variant={mapStyle === "satellite" ? "default" : "ghost"}
            onClick={() => setMapStyle("satellite")}
            className="rounded-none justify-start gap-2 h-8"
            data-testid="button-map-satellite"
          >
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs">Satellite</span>
          </Button>
          <Button
            size="sm"
            variant={mapStyle === "hybrid" ? "default" : "ghost"}
            onClick={() => setMapStyle("hybrid")}
            className="rounded-none justify-start gap-2 h-8"
            data-testid="button-map-hybrid"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-xs">Hybrid</span>
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-16 left-3 z-10">
        <LensLegend activeLens={activeLens} mapStyle={mapStyle} />
      </div>
      
      <div className="absolute top-16 right-3 bottom-3 w-80 z-10">
        <div className="h-full bg-background/95 backdrop-blur-sm border rounded-md shadow-sm overflow-hidden">
          <MapContextPanel
            aoiName={aoi?.name || selectedODINCountry || "Dhaka"}
            activeLens={activeLens}
            selectedNode={selectedInfraNode}
          />
        </div>
      </div>

      <div className="absolute bottom-20 right-[22rem] z-10 flex flex-col gap-1">
        <Button size="icon" variant="secondary" onClick={handleZoomIn} data-testid="button-zoom-in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleZoomOut} data-testid="button-zoom-out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        {aoi && (
          <Button size="icon" variant="secondary" onClick={handleCenterOnAOI} data-testid="button-center-aoi">
            <Crosshair className="h-4 w-4" />
          </Button>
        )}
      </div>

      {onMovementPlanRequest && (
        <div className="absolute bottom-3 right-[22rem] z-10">
          <Button size="sm" onClick={onMovementPlanRequest} data-testid="button-movement-plan">
            <Navigation className="h-4 w-4 mr-1" />
            Plan Route
          </Button>
        </div>
      )}
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
  className
}: GoogleMapsPanelProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<"roadmap" | "satellite" | "hybrid">("roadmap")
  const [activeLens, setActiveLens] = useState<MapLens>("infrastructure")
  const [zoomLevel, setZoomLevel] = useState(10)
  const [selectedInfraNode, setSelectedInfraNode] = useState<InfrastructureNode | null>(null)
  
  const getDataCoverage = (zoom: number, lens: MapLens): DataCoverage => {
    switch (lens) {
      case "infrastructure":
        return {
          infrastructure: zoom >= 12 ? "high" : zoom >= 9 ? "medium" : "low",
          humanActivity: "sparse",
          temporal: zoom >= 10 ? "current" : "recent"
        }
      case "human-activity":
        return {
          infrastructure: "sparse",
          humanActivity: zoom >= 14 ? "high" : zoom >= 11 ? "medium" : "low",
          temporal: zoom >= 12 ? "current" : zoom >= 8 ? "recent" : "limited"
        }
      case "risk-stress":
        return {
          infrastructure: "sparse",
          humanActivity: zoom >= 12 ? "medium" : "low",
          temporal: zoom >= 10 ? "current" : "recent"
        }
      case "logistics":
        return {
          infrastructure: zoom >= 10 ? "medium" : "low",
          humanActivity: "sparse",
          temporal: zoom >= 8 ? "current" : "limited"
        }
      default:
        return { infrastructure: "low", humanActivity: "low", temporal: "limited" }
    }
  }
  
  const dynamicCoverage = getDataCoverage(zoomLevel, activeLens)
  
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
    return (
      <div className={cn("relative w-full h-full flex items-center justify-center bg-muted", className)}>
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4 opacity-50">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "Google Maps API key not configured"}
          </p>
          <div className="text-xs text-muted-foreground bg-background/50 rounded-md p-3 border">
            <strong>Current AOI:</strong> {aoi?.name || selectedODINCountry || "Dhaka, Bangladesh"}<br/>
            <strong>Coordinates:</strong> {(aoi?.lat || 23.8103).toFixed(4)}, {(aoi?.lng || 90.4125).toFixed(4)}
          </div>
        </div>
      </div>
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
            dynamicCoverage={dynamicCoverage}
          />
        </Map>
      </APIProvider>
    </div>
  )
}
