import { useEffect, useRef } from "react"
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

const MOCK_ROUTES: LogisticsRoute[] = [
  {
    id: "route-1",
    name: "Airport Corridor",
    status: "clear",
    coordinates: [[90.3978, 23.8433], [90.4000, 23.8200], [90.4050, 23.7900], [90.4100, 23.7600]],
    notes: "Primary access to Shahjalal International Airport"
  },
  {
    id: "route-2",
    name: "Chittagong Highway",
    status: "congested",
    coordinates: [[90.4260, 23.7326], [90.4400, 23.7100], [90.4550, 23.6850], [90.4700, 23.6600]],
    notes: "Heavy commercial traffic during business hours"
  },
  {
    id: "route-3",
    name: "Mirpur Road",
    status: "clear",
    coordinates: [[90.3780, 23.7625], [90.3700, 23.7800], [90.3650, 23.8000], [90.3600, 23.8200]],
    notes: "Alternative north-south corridor"
  },
  {
    id: "route-4",
    name: "Old Dhaka Access",
    status: "restricted",
    coordinates: [[90.4051, 23.7182], [90.4071, 23.7080], [90.4100, 23.7000]],
    notes: "Narrow streets, vehicle size restrictions"
  }
]

const MOCK_SUPPLY_POINTS: SupplyPoint[] = [
  {
    id: "supply-1",
    name: "Bashundhara Fuel Depot",
    type: "fuel",
    lat: 23.8100,
    lng: 90.4300,
    status: "operational",
    notes: "24/7 operation, large capacity"
  },
  {
    id: "supply-2",
    name: "Gulshan Medical Supply",
    type: "medical",
    lat: 23.7920,
    lng: 90.4150,
    status: "operational",
    notes: "Full pharmaceutical stock"
  },
  {
    id: "supply-3",
    name: "Mohakhali Fuel Station",
    type: "fuel",
    lat: 23.7780,
    lng: 90.4020,
    status: "limited",
    notes: "Diesel shortage reported"
  },
  {
    id: "supply-4",
    name: "Central Food Distribution",
    type: "food",
    lat: 23.7400,
    lng: 90.4000,
    status: "operational",
    notes: "Wholesale distribution hub"
  }
]

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
      try {
        MOCK_ROUTES.forEach((route) => {
          const layerId = `logistics-layer-${route.id}`
          const sourceId = `logistics-route-${route.id}`
          try {
            if (map.getLayer(layerId)) map.removeLayer(layerId)
            if (map.getSource(sourceId)) map.removeSource(sourceId)
          } catch {}
        })
      } catch {}
    }
    
    cleanupLayers()
    
    if (!visible) return
    
    MOCK_ROUTES.forEach((route) => {
      try {
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
      } catch {}
    })
    
    MOCK_SUPPLY_POINTS.forEach((point) => {
      try {
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
      } catch {}
    })
    
    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      cleanupLayers()
    }
  }, [map, isMapReady, visible])
}
