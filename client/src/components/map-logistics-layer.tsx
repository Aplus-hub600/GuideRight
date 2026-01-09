import { useEffect, useRef, useMemo } from "react"
import maplibregl from "maplibre-gl"

export type RouteStatus = "clear" | "congested" | "blocked" | "restricted"
export type SupplyType = "fuel" | "medical" | "food" | "general"

export interface LogisticsRoute {
  id: string
  name: string
  status: RouteStatus
  coordinates: [number, number][]
  notes?: string
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

function generateRoutes(centerLat: number, centerLng: number): LogisticsRoute[] {
  return [
    {
      id: "route-1",
      name: "Airport Corridor",
      status: "clear",
      coordinates: [
        [centerLng - 0.012, centerLat + 0.033],
        [centerLng - 0.010, centerLat + 0.010],
        [centerLng - 0.005, centerLat - 0.020],
        [centerLng, centerLat - 0.050]
      ],
      notes: "Primary access to international airport"
    },
    {
      id: "route-2",
      name: "Highway South",
      status: "congested",
      coordinates: [
        [centerLng + 0.016, centerLat + 0.003],
        [centerLng + 0.030, centerLat - 0.020],
        [centerLng + 0.045, centerLat - 0.045],
        [centerLng + 0.060, centerLat - 0.070]
      ],
      notes: "Heavy commercial traffic during business hours"
    },
    {
      id: "route-3",
      name: "Western Bypass",
      status: "clear",
      coordinates: [
        [centerLng - 0.032, centerLat + 0.003],
        [centerLng - 0.040, centerLat + 0.020],
        [centerLng - 0.045, centerLat + 0.040],
        [centerLng - 0.050, centerLat + 0.060]
      ],
      notes: "Alternative north-south corridor"
    },
    {
      id: "route-4",
      name: "Old Town Access",
      status: "restricted",
      coordinates: [
        [centerLng - 0.005, centerLat - 0.012],
        [centerLng - 0.003, centerLat - 0.022],
        [centerLng, centerLat - 0.030]
      ],
      notes: "Narrow streets, vehicle size restrictions"
    }
  ]
}

function generateSupplyPoints(centerLat: number, centerLng: number): SupplyPoint[] {
  return [
    {
      id: "supply-1",
      name: "North Fuel Depot",
      type: "fuel",
      lat: centerLat + 0.080,
      lng: centerLng + 0.020,
      status: "operational",
      notes: "24/7 operation, large capacity"
    },
    {
      id: "supply-2",
      name: "Central Medical Supply",
      type: "medical",
      lat: centerLat + 0.062,
      lng: centerLng + 0.005,
      status: "operational",
      notes: "Full pharmaceutical stock"
    },
    {
      id: "supply-3",
      name: "East Fuel Station",
      type: "fuel",
      lat: centerLat + 0.048,
      lng: centerLng - 0.008,
      status: "limited",
      notes: "Diesel shortage reported"
    },
    {
      id: "supply-4",
      name: "Central Food Distribution",
      type: "food",
      lat: centerLat + 0.010,
      lng: centerLng - 0.010,
      status: "operational",
      notes: "Wholesale distribution hub"
    }
  ]
}

const routeColors: Record<RouteStatus, string> = {
  clear: "#22c55e",
  congested: "#f59e0b",
  blocked: "#ef4444",
  restricted: "#8b5cf6"
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
  centerLat: number
  centerLng: number
}

const isMapValid = (m: maplibregl.Map | null): m is maplibregl.Map => {
  return m !== null && typeof m.getStyle === 'function' && m.getStyle() !== undefined
}

export function useMapLogisticsLayer({
  map,
  isMapReady,
  visible,
  centerLat,
  centerLng
}: MapLogisticsLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])
  
  const routes = useMemo(() => generateRoutes(centerLat, centerLng), [centerLat, centerLng])
  const supplyPoints = useMemo(() => generateSupplyPoints(centerLat, centerLng), [centerLat, centerLng])
  
  useEffect(() => {
    if (!map || !isMapReady) return
    
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    
    const cleanupLayers = () => {
      if (!isMapValid(map)) return
      for (let i = 1; i <= 4; i++) {
        const layerId = `logistics-layer-route-${i}`
        const sourceId = `logistics-route-route-${i}`
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }
    }
    
    cleanupLayers()
    
    if (!visible) return
    
    if (isMapValid(map)) {
      routes.forEach((route) => {
        if (!isMapValid(map)) return
        const sourceId = `logistics-route-${route.id}`
        const layerId = `logistics-layer-${route.id}`
        const color = routeColors[route.status]
        
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: { status: route.status },
              geometry: {
                type: "LineString",
                coordinates: route.coordinates
              }
            }
          })
          
          const dashArray = route.status === "restricted" ? [4, 4] :
                            route.status === "blocked" ? [2, 2] : undefined
          
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
              "line-width": 4,
              "line-opacity": 0.8,
              ...(dashArray ? { "line-dasharray": dashArray } : {})
            }
          })
        }
      })
      
      supplyPoints.forEach((point) => {
        if (!isMapValid(map)) return
        const color = supplyColors[point.type]
        const icon = supplyIcons[point.type]
        const statusOpacity = point.status === "operational" ? 1 : 
                              point.status === "limited" ? 0.7 : 0.4
        
        const el = document.createElement("div")
        el.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            color: white;
            border: 2px solid white;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 11px;
            font-family: system-ui;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            opacity: ${statusOpacity};
            transform: rotate(45deg);
          ">
            <span style="transform: rotate(-45deg);">${icon}</span>
          </div>
        `
        
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="padding: 10px; font-family: system-ui;">
            <strong style="color: #1a1a1a;">${point.name}</strong>
            <div style="font-size: 11px; color: #666; margin-top: 4px; text-transform: capitalize;">
              ${point.type} • ${point.status}
            </div>
            ${point.notes ? `<div style="font-size: 11px; color: #888; margin-top: 6px;">${point.notes}</div>` : ""}
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
  }, [map, isMapReady, visible, routes, supplyPoints])
}
