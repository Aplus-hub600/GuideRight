import { useEffect, useRef, useState, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation, Target, Layers, MapPin, Crosshair, ZoomIn, ZoomOut } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { MapScopeBar, type DataCoverage } from "./map-scope-bar"
import { MapLensSelector, LensLegend, SmartMapControls, type MapLens, LENS_CONFIGS } from "./map-lens-selector"
import { useMapInfrastructureLayer, INFRASTRUCTURE_NODES, type InfrastructureNode } from "./map-infrastructure-layer"
import { useMapAccessibilityLayer } from "./map-accessibility-layer"
import { useMapActivityLayer } from "./map-activity-layer"
import { useMapRiskLayer } from "./map-risk-layer"
import { useMapLogisticsLayer } from "./map-logistics-layer"

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

interface MapLibrePanelProps {
  aoi?: AOI
  riskScore?: number
  movementPlan?: MovementPlan
  sigacts?: SigAct[]
  onAOIChange?: (aoi: AOI) => void
  onMovementPlanRequest?: () => void
  activeLens?: MapLens
  hideLensSelector?: boolean
  className?: string
}

export function MapLibrePanel({
  aoi,
  riskScore,
  movementPlan,
  sigacts = [],
  onAOIChange,
  onMovementPlanRequest,
  activeLens: externalLens,
  hideLensSelector = false,
  className
}: MapLibrePanelProps) {
  const { t } = useTranslation()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const aoiMarker = useRef<maplibregl.Marker | null>(null)
  const sigactMarkers = useRef<maplibregl.Marker[]>([])
  
  const [mapStyle, setMapStyle] = useState<"satellite" | "streets" | "hybrid">("streets")
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [internalLens, setInternalLens] = useState<MapLens>("infrastructure")
  const [zoomLevel, setZoomLevel] = useState(10)
  const [selectedInfraNode, setSelectedInfraNode] = useState<InfrastructureNode | null>(null)
  
  const activeLens = externalLens ?? internalLens
  const setActiveLens = (lens: MapLens) => setInternalLens(lens)
  
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
  
  useMapInfrastructureLayer({
    map: map.current,
    isMapReady,
    nodes: INFRASTRUCTURE_NODES,
    onNodeClick: setSelectedInfraNode,
    visible: activeLens === "infrastructure"
  })
  
  useMapAccessibilityLayer({
    map: map.current,
    isMapReady,
    visible: activeLens === "infrastructure",
    showTravelRings: true,
    showDensity: true
  })
  
  useMapActivityLayer({
    map: map.current,
    isMapReady,
    visible: activeLens === "human-activity"
  })
  
  useMapRiskLayer({
    map: map.current,
    isMapReady,
    visible: activeLens === "risk-stress"
  })
  
  useMapLogisticsLayer({
    map: map.current,
    isMapReady,
    visible: activeLens === "logistics"
  })

  // Map tile sources - using CARTO for English labels
  const tileSources = {
    streets: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    hybrid: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initialCenter: [number, number] = aoi 
      ? [aoi.lng, aoi.lat] 
      : [90.4125, 23.8103] // Default: Dhaka

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: [tileSources[mapStyle]],
              tileSize: 256,
              attribution: mapStyle === "streets" 
                ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                : '&copy; <a href="https://www.esri.com/">Esri</a>'
            }
          },
          layers: [
            {
              id: "simple-tiles",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: initialCenter,
        zoom: 10,
        attributionControl: false
      })

      // Add attribution control - bottom-left to avoid legend overlap
      map.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left")

      map.current.on("load", () => {
        setIsMapReady(true)
      })
      
      map.current.on("error", (e) => {
        console.warn("MapLibre error:", e)
      })
      
      map.current.on("zoom", () => {
        if (map.current) {
          setZoomLevel(Math.round(map.current.getZoom()))
        }
      })

      // Click to set AOI
      map.current.on("click", (e) => {
        if (onAOIChange) {
          onAOIChange({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            radiusKm: 5
          })
        }
      })
    } catch (error) {
      console.error("Failed to initialize map:", error)
      setMapError("Map initialization failed. WebGL may not be available in this environment.")
    }

    return () => {
      // Clean up all markers on unmount
      if (aoiMarker.current) {
        aoiMarker.current.remove()
        aoiMarker.current = null
      }
      sigactMarkers.current.forEach(m => m.remove())
      sigactMarkers.current = []
      
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map style
  useEffect(() => {
    if (!map.current || !isMapReady) return

    const source = map.current.getSource("raster-tiles") as maplibregl.RasterTileSource
    if (source) {
      source.setTiles([tileSources[mapStyle]])
    }
  }, [mapStyle, isMapReady])

  // Update AOI marker
  useEffect(() => {
    if (!map.current || !isMapReady || !aoi) return

    // Remove existing marker
    if (aoiMarker.current) {
      aoiMarker.current.remove()
    }

    // Create AOI marker element
    const el = document.createElement("div")
    el.className = "aoi-marker"
    el.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>
    `

    // Add popup
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 8px; font-family: system-ui;">
        <strong>${aoi.name || "Area of Interest"}</strong><br/>
        <span style="color: #666; font-size: 12px;">
          ${aoi.lat.toFixed(4)}, ${aoi.lng.toFixed(4)}
          ${aoi.radiusKm ? ` (${aoi.radiusKm}km radius)` : ""}
        </span>
      </div>
    `)

    aoiMarker.current = new maplibregl.Marker({ element: el })
      .setLngLat([aoi.lng, aoi.lat])
      .setPopup(popup)
      .addTo(map.current)

    // Fly to new AOI
    map.current.flyTo({
      center: [aoi.lng, aoi.lat],
      zoom: 12,
      duration: 1000
    })
  }, [aoi, isMapReady])

  // Update SIGACT markers
  useEffect(() => {
    if (!map.current || !isMapReady) return

    // Remove existing markers
    sigactMarkers.current.forEach(m => m.remove())
    sigactMarkers.current = []

    // Add new markers for SIGACTs with coordinates
    sigacts.forEach((sigact, index) => {
      if (!sigact.lat || !sigact.lng) return

      const el = document.createElement("div")
      const confidenceColor = sigact.confidence >= 0.7 ? "#22c55e" : 
                              sigact.confidence >= 0.4 ? "#f59e0b" : "#ef4444"
      
      el.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background: ${confidenceColor};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">${index + 1}</div>
      `

      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="padding: 8px; font-family: system-ui; max-width: 250px;">
          <strong style="color: #333;">${sigact.what}</strong><br/>
          <span style="color: #666; font-size: 12px;">
            <b>Who:</b> ${sigact.who}<br/>
            <b>Where:</b> ${sigact.where}<br/>
            <b>When:</b> ${sigact.when}<br/>
            <b>Why:</b> ${sigact.why}<br/>
            <b>Confidence:</b> ${Math.round(sigact.confidence * 100)}%
          </span>
        </div>
      `)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([sigact.lng, sigact.lat])
        .setPopup(popup)
        .addTo(map.current!)

      sigactMarkers.current.push(marker)
    })
  }, [sigacts, isMapReady])

  // Draw movement plan route
  useEffect(() => {
    if (!map.current || !isMapReady || !movementPlan?.route?.length) return

    const sourceId = "movement-route"
    const layerId = "movement-route-layer"

    // Remove existing route
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    // Add route source
    map.current.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: movementPlan.route.map(p => [p.lng, p.lat])
        }
      }
    })

    // Add route layer
    map.current.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 4,
        "line-dasharray": [2, 1]
      }
    })
  }, [movementPlan, isMapReady])

  const handleZoomIn = () => map.current?.zoomIn()
  const handleZoomOut = () => map.current?.zoomOut()
  const handleCenterOnAOI = () => {
    if (map.current && aoi) {
      map.current.flyTo({ center: [aoi.lng, aoi.lat], zoom: 12 })
    }
  }

  if (mapError) {
    return (
      <div className={cn("relative w-full h-full bg-muted", className)}>
        {/* Error message in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4 opacity-50">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {mapError}
            </p>
            <div className="text-xs text-muted-foreground bg-background/50 rounded-md p-3 border">
              <strong>Current AOI:</strong> {aoi?.name || "Dhaka, Bangladesh"}<br/>
              <strong>Coordinates:</strong> {(aoi?.lat || 23.8103).toFixed(4)}, {(aoi?.lng || 90.4125).toFixed(4)}
            </div>
          </div>
        </div>
        
        {/* Show lens selector if not hidden */}
        {!hideLensSelector && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <MapLensSelector
              activeLens={activeLens}
              onLensChange={setActiveLens}
            />
          </div>
        )}
        
        {/* Always show the legend - flush bottom-right */}
        <div className="absolute bottom-0 right-0 z-10">
          <LensLegend activeLens={activeLens} mapStyle={mapStyle} className="rounded-br-none rounded-bl-none rounded-tr-none" />
        </div>
        
        {/* Smart Map Controls - flush bottom-left */}
        <div className="absolute bottom-0 left-0 z-10">
          <SmartMapControls
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenterAOI={aoi ? handleCenterOnAOI : undefined}
            onMovementPlan={onMovementPlanRequest}
            aoiName={aoi?.name || "Bangladesh"}
            mapStyle={mapStyle}
            className="rounded-bl-none rounded-tl-none rounded-br-none"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" data-testid="map-container" />

      {/* Scope Bar - Only show if lens selector is visible (not using external header) */}
      {!hideLensSelector && (
        <div className="absolute top-3 left-3 right-3 z-10">
          <MapScopeBar
            aoiName={aoi?.name || "Bangladesh"}
            scope="metropolitan"
            coverage={dynamicCoverage}
            zoomLevel={zoomLevel}
          />
        </div>
      )}

      {/* Left Rail: Lens Selector + Style - only show if not hidden */}
      {!hideLensSelector && (
        <div className="absolute top-16 left-3 z-10 flex flex-col gap-2">
          <MapLensSelector
            activeLens={activeLens}
            onLensChange={setActiveLens}
          />

          <div className="flex flex-col gap-0.5 bg-background/95 backdrop-blur-sm rounded-md border overflow-hidden">
            <Button
              size="sm"
              variant={mapStyle === "streets" ? "default" : "ghost"}
              onClick={() => setMapStyle("streets")}
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
          </div>
        </div>
      )}
      
      {/* Minimal map style toggle when lens selector is hidden - positioned at top left */}
      {hideLensSelector && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex gap-1 bg-background/95 backdrop-blur-sm rounded-md border p-1">
            <Button
              size="icon"
              variant={mapStyle === "streets" ? "default" : "ghost"}
              onClick={() => setMapStyle("streets")}
              className="h-8 w-8"
              data-testid="button-map-streets"
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={mapStyle === "satellite" ? "default" : "ghost"}
              onClick={() => setMapStyle("satellite")}
              className="h-8 w-8"
              data-testid="button-map-satellite"
            >
              <Target className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Legend - Flush bottom-right */}
      <div className="absolute bottom-0 right-0 z-10">
        <LensLegend activeLens={activeLens} mapStyle={mapStyle} className="rounded-br-none rounded-bl-none rounded-tr-none" />
      </div>

      {/* Smart Map Controls - flush bottom-left */}
      <div className="absolute bottom-0 left-0 z-10">
        <SmartMapControls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenterAOI={aoi ? handleCenterOnAOI : undefined}
          onMovementPlan={onMovementPlanRequest}
          aoiName={aoi?.name || "Bangladesh"}
          mapStyle={mapStyle}
          className="rounded-bl-none rounded-tl-none rounded-br-none"
        />
      </div>

      {/* Loading Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  )
}
