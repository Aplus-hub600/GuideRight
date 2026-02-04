import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import { getPopulationGrid, analyzeRouteExposure, type RouteExposureAnalysis } from "@/lib/population-grid"

export type RouteStatus = "clear" | "congested" | "blocked" | "restricted"
export type ExposureLevel = "lower" | "moderate" | "elevated" | "higher"
export type SupplyType = "fuel" | "medical" | "food" | "general"

export interface LogisticsRoute {
  id: string
  name: string
  status: RouteStatus
  coordinates: [number, number][]
  notes?: string
  exposure?: RouteExposureAnalysis
}

export interface SupplyPoint {
  id: string
  name: string
  type: SupplyType
  lat: number
  lng: number
  status: "operational" | "limited" | "closed"
  notes?: string
}

const DHAKA_LAT = 23.8103
const DHAKA_LNG = 90.4125

const LOGISTICS_ROUTES: LogisticsRoute[] = [
  {
    id: "route-1",
    name: "Airport Corridor (Shahjalal)",
    status: "clear",
    coordinates: [
      [DHAKA_LNG - 0.012, DHAKA_LAT + 0.033],
      [DHAKA_LNG - 0.010, DHAKA_LAT + 0.010],
      [DHAKA_LNG - 0.005, DHAKA_LAT - 0.020],
      [DHAKA_LNG, DHAKA_LAT - 0.050]
    ],
    notes: "Primary access to Hazrat Shahjalal International Airport"
  },
  {
    id: "route-2",
    name: "Dhaka-Chittagong Highway",
    status: "congested",
    coordinates: [
      [DHAKA_LNG + 0.016, DHAKA_LAT + 0.003],
      [DHAKA_LNG + 0.030, DHAKA_LAT - 0.020],
      [DHAKA_LNG + 0.045, DHAKA_LAT - 0.045],
      [DHAKA_LNG + 0.060, DHAKA_LAT - 0.070]
    ],
    notes: "Heavy commercial traffic during business hours"
  },
  {
    id: "route-3",
    name: "Western Bypass (Mirpur)",
    status: "clear",
    coordinates: [
      [DHAKA_LNG - 0.032, DHAKA_LAT + 0.003],
      [DHAKA_LNG - 0.040, DHAKA_LAT + 0.020],
      [DHAKA_LNG - 0.045, DHAKA_LAT + 0.040],
      [DHAKA_LNG - 0.050, DHAKA_LAT + 0.060]
    ],
    notes: "Alternative north-south corridor via Mirpur"
  },
  {
    id: "route-4",
    name: "Old Dhaka Access",
    status: "restricted",
    coordinates: [
      [DHAKA_LNG - 0.005, DHAKA_LAT - 0.012],
      [DHAKA_LNG - 0.003, DHAKA_LAT - 0.022],
      [DHAKA_LNG, DHAKA_LAT - 0.030]
    ],
    notes: "Narrow streets, vehicle size restrictions"
  }
]

const SUPPLY_POINTS: SupplyPoint[] = [
  {
    id: "supply-1",
    name: "Uttara Fuel Depot",
    type: "fuel",
    lat: DHAKA_LAT + 0.080,
    lng: DHAKA_LNG + 0.020,
    status: "operational",
    notes: "24/7 operation, large capacity"
  },
  {
    id: "supply-2",
    name: "Gulshan Medical Supply Center",
    type: "medical",
    lat: DHAKA_LAT + 0.062,
    lng: DHAKA_LNG + 0.005,
    status: "operational",
    notes: "Full pharmaceutical stock"
  },
  {
    id: "supply-3",
    name: "Banani Fuel Station",
    type: "fuel",
    lat: DHAKA_LAT + 0.048,
    lng: DHAKA_LNG - 0.008,
    status: "limited",
    notes: "Diesel shortage reported"
  },
  {
    id: "supply-4",
    name: "Karwan Bazar Food Distribution",
    type: "food",
    lat: DHAKA_LAT + 0.010,
    lng: DHAKA_LNG - 0.010,
    status: "operational",
    notes: "Wholesale distribution hub"
  }
]

// Legacy status colors (kept for compatibility)
const routeColors: Record<RouteStatus, string> = {
  clear: "#22c55e",
  congested: "#f59e0b",
  blocked: "#ef4444",
  restricted: "#8b5cf6"
}

// Muted exposure-based colors (whitepaper aligned - restrained palette)
const exposureColors: Record<ExposureLevel, string> = {
  lower: "rgba(134, 148, 134, 0.9)",      // Muted sage green
  moderate: "rgba(156, 133, 108, 0.9)",   // Muted tan
  elevated: "rgba(142, 108, 95, 0.9)",    // Muted brown
  higher: "rgba(127, 86, 96, 0.9)"        // Muted mauve
}

// Helper to analyze routes with exposure data
function getRoutesWithExposure(): (LogisticsRoute & { exposure: RouteExposureAnalysis })[] {
  const grid = getPopulationGrid()
  return LOGISTICS_ROUTES.map(route => ({
    ...route,
    exposure: analyzeRouteExposure(route.coordinates, grid)
  }))
}

const supplyIcons: Record<SupplyType, string> = {
  fuel: "F",
  medical: "M",
  food: "W",
  general: "S"
}

const supplyColors: Record<SupplyType, string> = {
  fuel: "#f59e0b",
  medical: "#ef4444",
  food: "#22c55e",
  general: "#3b82f6"
}

interface MapLogisticsLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  visible: boolean
}

const isMapValid = (m: maplibregl.Map | null): m is maplibregl.Map => {
  return m !== null && typeof m.getStyle === 'function' && m.getStyle() !== undefined
}

export function useMapLogisticsLayer({
  map,
  isMapReady,
  visible
}: MapLogisticsLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])
  
  useEffect(() => {
    if (!map || !isMapReady) return
    
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    
    const cleanupLayers = () => {
      if (!isMapValid(map)) return
      // Clean up layers using actual route IDs
      LOGISTICS_ROUTES.forEach((route) => {
        const layerId = `logistics-layer-${route.id}`
        const sourceId = `logistics-route-${route.id}`
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      })
    }
    
    cleanupLayers()
    
    if (!visible) return
    
    if (isMapValid(map)) {
      // Use exposure-analyzed routes for muted, whitepaper-aligned coloring
      const routesWithExposure = getRoutesWithExposure()
      
      routesWithExposure.forEach((route) => {
        if (!isMapValid(map)) return
        const sourceId = `logistics-route-${route.id}`
        const layerId = `logistics-layer-${route.id}`
        // Use exposure-based color (muted palette) instead of status color
        const color = exposureColors[route.exposure.exposureLevel]
        
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: { 
                status: route.status,
                exposure: route.exposure.exposureLevel,
                description: route.exposure.description
              },
              geometry: {
                type: "LineString",
                coordinates: route.coordinates
              }
            }
          })
          
          map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": color,
              "line-width": 5,
              "line-opacity": 0.85
            }
          })
        }
        
        // Add route label marker at midpoint with exposure info
        const midIdx = Math.floor(route.coordinates.length / 2)
        const midpoint = route.coordinates[midIdx]
        
        const exposureLabel = route.exposure.exposureLevel.charAt(0).toUpperCase() + 
                              route.exposure.exposureLevel.slice(1)
        
        const routeEl = document.createElement("div")
        routeEl.innerHTML = `
          <div style="
            padding: 4px 8px;
            background: ${color};
            border: 1px solid rgba(255,255,255,0.5);
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: white;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">
            ${exposureLabel}
          </div>
        `
        
        const routePopup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="padding: 12px; font-family: system-ui; max-width: 220px;">
            <strong style="color: #1a1a1a; font-size: 13px;">${route.name}</strong>
            <div style="
              margin-top: 8px; 
              padding: 8px; 
              background: #f5f5f5; 
              border-radius: 4px;
              border-left: 3px solid ${color};
            ">
              <div style="font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; margin-bottom: 4px;">
                Exposure: ${exposureLabel}
              </div>
              <div style="font-size: 11px; color: #666; line-height: 1.4;">
                ${route.exposure.description}
              </div>
            </div>
            <div style="font-size: 10px; color: #888; margin-top: 8px; font-style: italic;">
              ${route.exposure.recommendation}
            </div>
            ${route.notes ? `<div style="font-size: 10px; color: #999; margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">${route.notes}</div>` : ""}
          </div>
        `)
        
        const routeMarker = new maplibregl.Marker({ element: routeEl })
          .setLngLat(midpoint)
          .setPopup(routePopup)
          .addTo(map)
        
        markersRef.current.push(routeMarker)
      })
      
      SUPPLY_POINTS.forEach((point) => {
        const color = supplyColors[point.type]
        const icon = supplyIcons[point.type]
        const statusColor = point.status === "operational" ? "#22c55e" :
                            point.status === "limited" ? "#f59e0b" : "#ef4444"
        
        const el = document.createElement("div")
        el.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border: 2px solid white;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
          ">
            ${icon}
            <div style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 8px;
              height: 8px;
              background: ${statusColor};
              border-radius: 50%;
              border: 1px solid white;
            "></div>
          </div>
        `
        
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="padding: 10px; font-family: system-ui;">
            <strong style="color: #1a1a1a;">${point.name}</strong>
            <div style="font-size: 11px; margin-top: 4px;">
              <span style="text-transform: capitalize; color: ${color};">${point.type}</span>
              <span style="color: #888;"> • </span>
              <span style="color: ${statusColor};">${point.status}</span>
            </div>
            ${point.notes ? `<div style="font-size: 11px; color: #666; margin-top: 6px;">${point.notes}</div>` : ""}
          </div>
        `)
        
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([point.lng, point.lat])
          .setPopup(popup)
          .addTo(map)
        
        markersRef.current.push(marker)
      })
    }
    
    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      cleanupLayers()
    }
  }, [map, isMapReady, visible])
}
