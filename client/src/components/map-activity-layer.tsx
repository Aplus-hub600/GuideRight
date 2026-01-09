import { useEffect, useRef, useMemo } from "react"
import maplibregl from "maplibre-gl"

export type ActivityIntensity = "high" | "moderate" | "low"

export interface ActivityZone {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
  intensity: ActivityIntensity
  type: "gathering" | "movement" | "incident"
  description?: string
  lastReported?: string
}

function generateActivityZones(centerLat: number, centerLng: number): ActivityZone[] {
  return [
    {
      id: "act-1",
      name: "Central Square",
      lat: centerLat + 0.008,
      lng: centerLng - 0.015,
      radius: 800,
      intensity: "high",
      type: "gathering",
      description: "Regular public gatherings, protests. University district.",
      lastReported: "2 hours ago"
    },
    {
      id: "act-2",
      name: "Commercial District",
      lat: centerLat,
      lng: centerLng + 0.008,
      radius: 1200,
      intensity: "moderate",
      type: "movement",
      description: "High foot traffic during business hours.",
      lastReported: "1 hour ago"
    },
    {
      id: "act-3",
      name: "Market Area",
      lat: centerLat + 0.062,
      lng: centerLng + 0.005,
      radius: 600,
      intensity: "moderate",
      type: "gathering",
      description: "Commercial activity, weekend gatherings.",
      lastReported: "3 hours ago"
    },
    {
      id: "act-4",
      name: "Old Town Markets",
      lat: centerLat - 0.020,
      lng: centerLng - 0.005,
      radius: 1500,
      intensity: "high",
      type: "movement",
      description: "Dense commercial activity, narrow streets.",
      lastReported: "30 min ago"
    },
    {
      id: "act-5",
      name: "Transit Junction",
      lat: centerLat + 0.028,
      lng: centerLng - 0.022,
      radius: 500,
      intensity: "low",
      type: "incident",
      description: "Minor traffic incident reported.",
      lastReported: "4 hours ago"
    }
  ]
}

const intensityStyles = {
  high: { color: "rgba(239, 68, 68, 0.35)", border: "#ef4444" },
  moderate: { color: "rgba(245, 158, 11, 0.25)", border: "#f59e0b" },
  low: { color: "rgba(34, 197, 94, 0.15)", border: "#22c55e" }
}

interface MapActivityLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  visible: boolean
  centerLat: number
  centerLng: number
  onZoneClick?: (zone: ActivityZone) => void
}

const isMapValid = (m: maplibregl.Map | null): m is maplibregl.Map => {
  return m !== null && typeof m.getStyle === 'function' && m.getStyle() !== undefined
}

export function useMapActivityLayer({
  map,
  isMapReady,
  visible,
  centerLat,
  centerLng,
  onZoneClick
}: MapActivityLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])
  
  const activityZones = useMemo(() => generateActivityZones(centerLat, centerLng), [centerLat, centerLng])
  
  useEffect(() => {
    if (!map || !isMapReady) return
    
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    
    const cleanupLayers = () => {
      if (!isMapValid(map)) return
      for (let i = 1; i <= 5; i++) {
        const layerId = `activity-layer-act-${i}`
        const sourceId = `activity-zone-act-${i}`
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(`${layerId}-outline`)) map.removeLayer(`${layerId}-outline`)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }
    }
    
    cleanupLayers()
    
    if (!visible) return
    
    if (isMapValid(map)) {
      activityZones.forEach((zone) => {
        if (!isMapValid(map)) return
        const sourceId = `activity-zone-${zone.id}`
        const layerId = `activity-layer-${zone.id}`
        const style = intensityStyles[zone.intensity]
        
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
              properties: { intensity: zone.intensity, type: zone.type },
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
              "fill-color": style.color,
              "fill-opacity": 1
            }
          })
          
          const dashArray = zone.type === "incident" ? [2, 2] : 
                            zone.type === "movement" ? [6, 3] : undefined
          
          map.addLayer({
            id: `${layerId}-outline`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": style.border,
              "line-width": 2,
              "line-opacity": 0.6,
              ...(dashArray ? { "line-dasharray": dashArray } : {})
            }
          })
        }
        
        const el = document.createElement("div")
        el.innerHTML = `
          <div style="
            width: 8px;
            height: 8px;
            background: ${style.border};
            border-radius: 50%;
            box-shadow: 0 0 8px ${style.border};
          "></div>
        `
        
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div style="padding: 10px; font-family: system-ui;">
            <strong style="color: #1a1a1a;">${zone.name}</strong>
            <div style="font-size: 11px; color: #666; margin-top: 4px; text-transform: capitalize;">
              ${zone.type} • ${zone.intensity} intensity
            </div>
            ${zone.description ? `<div style="font-size: 11px; color: #888; margin-top: 6px;">${zone.description}</div>` : ""}
            ${zone.lastReported ? `<div style="font-size: 10px; color: #999; margin-top: 6px;">Last: ${zone.lastReported}</div>` : ""}
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
  }, [map, isMapReady, visible, activityZones, onZoneClick])
}
