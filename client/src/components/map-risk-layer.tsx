import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"

export type RiskLevel = "low" | "moderate" | "elevated" | "high"

export interface RiskZone {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
  riskLevel: RiskLevel
  factors: string[]
  lastAssessed?: string
}

const DHAKA_LAT = 23.8103
const DHAKA_LNG = 90.4125

const RISK_ZONES: RiskZone[] = [
  {
    id: "risk-1",
    name: "Old Dhaka District",
    lat: DHAKA_LAT - 0.020,
    lng: DHAKA_LNG - 0.005,
    radius: 2000,
    riskLevel: "elevated",
    factors: ["Dense population", "Narrow egress routes", "Historical incidents"],
    lastAssessed: "Today"
  },
  {
    id: "risk-2",
    name: "Tejgaon Industrial Zone",
    lat: DHAKA_LAT + 0.035,
    lng: DHAKA_LNG - 0.050,
    radius: 1800,
    riskLevel: "moderate",
    factors: ["Industrial hazards", "Limited emergency access"],
    lastAssessed: "Yesterday"
  },
  {
    id: "risk-3",
    name: "Gulshan Diplomatic Quarter",
    lat: DHAKA_LAT + 0.065,
    lng: DHAKA_LNG + 0.015,
    radius: 1200,
    riskLevel: "low",
    factors: ["Enhanced security", "Controlled access"],
    lastAssessed: "Today"
  },
  {
    id: "risk-4",
    name: "Sadarghat Port Area",
    lat: DHAKA_LAT - 0.022,
    lng: DHAKA_LNG - 0.003,
    radius: 1000,
    riskLevel: "elevated",
    factors: ["Cargo security", "Transient population"],
    lastAssessed: "2 days ago"
  },
  {
    id: "risk-5",
    name: "Dhaka University District",
    lat: DHAKA_LAT + 0.005,
    lng: DHAKA_LNG - 0.018,
    radius: 1500,
    riskLevel: "moderate",
    factors: ["Protest activity", "Large gatherings"],
    lastAssessed: "Today"
  }
]

const riskStyles: Record<RiskLevel, { fill: string; border: string }> = {
  low: { fill: "rgba(34, 197, 94, 0.15)", border: "#22c55e" },
  moderate: { fill: "rgba(245, 158, 11, 0.20)", border: "#f59e0b" },
  elevated: { fill: "rgba(249, 115, 22, 0.25)", border: "#f97316" },
  high: { fill: "rgba(239, 68, 68, 0.30)", border: "#ef4444" }
}

interface MapRiskLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  visible: boolean
  onZoneClick?: (zone: RiskZone) => void
}

const isMapValid = (m: maplibregl.Map | null): m is maplibregl.Map => {
  return m !== null && typeof m.getStyle === 'function' && m.getStyle() !== undefined
}

export function useMapRiskLayer({
  map,
  isMapReady,
  visible,
  onZoneClick
}: MapRiskLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])
  
  useEffect(() => {
    if (!map || !isMapReady) return
    
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    
    const cleanupLayers = () => {
      if (!isMapValid(map)) return
      for (let i = 1; i <= 5; i++) {
        const layerId = `risk-layer-risk-${i}`
        const sourceId = `risk-zone-risk-${i}`
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(`${layerId}-outline`)) map.removeLayer(`${layerId}-outline`)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }
    }
    
    cleanupLayers()
    
    if (!visible) return
    
    if (isMapValid(map)) {
      RISK_ZONES.forEach((zone) => {
        if (!isMapValid(map)) return
        const sourceId = `risk-zone-${zone.id}`
        const layerId = `risk-layer-${zone.id}`
        const style = riskStyles[zone.riskLevel]
        
        if (!map.getSource(sourceId)) {
          const points = 32
          const coords: [number, number][] = []
          
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * 2 * Math.PI
            const dx = zone.radius * Math.cos(angle)
            const dy = zone.radius * Math.sin(angle)
            const lat = zone.lat + (dy / 111320)
            const lng = zone.lng + (dx / (111320 * Math.cos(zone.lat * Math.PI / 180)))
            coords.push([lng, lat])
          }
          
          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: { riskLevel: zone.riskLevel },
              geometry: {
                type: "Polygon",
                coordinates: [coords]
              }
            }
          })
          
          map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": style.fill,
              "fill-opacity": 1
            }
          })
          
          map.addLayer({
            id: `${layerId}-outline`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": style.border,
              "line-width": 2,
              "line-opacity": 0.6
            }
          })
        }
        
        const el = document.createElement("div")
        el.innerHTML = `
          <div style="
            width: 10px;
            height: 10px;
            background: ${style.border};
            border-radius: 50%;
            box-shadow: 0 0 6px ${style.border};
          "></div>
        `
        
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="padding: 10px; font-family: system-ui;">
            <strong style="color: #1a1a1a;">${zone.name}</strong>
            <div style="font-size: 11px; color: ${style.border}; margin-top: 4px; text-transform: uppercase;">
              ${zone.riskLevel} RISK
            </div>
            <div style="font-size: 11px; color: #666; margin-top: 6px;">
              ${zone.factors.join(" • ")}
            </div>
            ${zone.lastAssessed ? `<div style="font-size: 10px; color: #999; margin-top: 6px;">Assessed: ${zone.lastAssessed}</div>` : ""}
          </div>
        `)
        
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([zone.lng, zone.lat])
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
  }, [map, isMapReady, visible, onZoneClick])
}
