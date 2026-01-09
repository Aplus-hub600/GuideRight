import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"

interface TravelRing {
  minutes: number
  radius: number
  color: string
  opacity: number
}

const TRAVEL_RINGS: TravelRing[] = [
  { minutes: 60, radius: 15000, color: "#22c55e", opacity: 0.08 },
  { minutes: 30, radius: 8000, color: "#f59e0b", opacity: 0.12 },
  { minutes: 15, radius: 4000, color: "#ef4444", opacity: 0.15 }
]

interface DensityZone {
  id: string
  lat: number
  lng: number
  radius: number
  intensity: "high" | "medium" | "low"
}

const DENSITY_ZONES: DensityZone[] = [
  { id: "dense-1", lat: 23.7260, lng: 90.3975, radius: 2000, intensity: "high" },
  { id: "dense-2", lat: 23.7500, lng: 90.3900, radius: 3000, intensity: "medium" },
  { id: "dense-3", lat: 23.7800, lng: 90.4100, radius: 2500, intensity: "medium" },
  { id: "dense-4", lat: 23.7000, lng: 90.4200, radius: 2000, intensity: "low" }
]

const intensityColors = {
  high: "rgba(239, 68, 68, 0.25)",
  medium: "rgba(245, 158, 11, 0.18)",
  low: "rgba(34, 197, 94, 0.12)"
}

interface MapAccessibilityLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  centerLat: number
  centerLng: number
  visible: boolean
  showTravelRings: boolean
  showDensity: boolean
}

export function useMapAccessibilityLayer({
  map,
  isMapReady,
  centerLat,
  centerLng,
  visible,
  showTravelRings,
  showDensity
}: MapAccessibilityLayerProps) {
  const sourcesAdded = useRef<Set<string>>(new Set())
  
  useEffect(() => {
    if (!map || !isMapReady) return
    
    const cleanupLayers = () => {
      try {
        TRAVEL_RINGS.forEach((_, idx) => {
          const layerId = `travel-ring-layer-${idx}`
          const sourceId = `travel-ring-source-${idx}`
          try {
            if (map.getLayer(layerId)) map.removeLayer(layerId)
            if (map.getLayer(`${layerId}-outline`)) map.removeLayer(`${layerId}-outline`)
            if (map.getSource(sourceId)) map.removeSource(sourceId)
          } catch {}
        })
        DENSITY_ZONES.forEach((zone) => {
          const layerId = `density-layer-${zone.id}`
          const sourceId = `density-zone-${zone.id}`
          try {
            if (map.getLayer(layerId)) map.removeLayer(layerId)
            if (map.getSource(sourceId)) map.removeSource(sourceId)
          } catch {}
        })
      } catch {}
    }
    
    cleanupLayers()
    
    if (!visible) return
    
    if (showTravelRings) {
      TRAVEL_RINGS.forEach((ring, idx) => {
        const sourceId = `travel-ring-source-${idx}`
        const layerId = `travel-ring-layer-${idx}`
        
        if (!map.getSource(sourceId)) {
          const center = [centerLng, centerLat]
          const points = 64
          const coords: [number, number][] = []
          
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * 2 * Math.PI
            const dx = ring.radius * Math.cos(angle)
            const dy = ring.radius * Math.sin(angle)
            const lat = centerLat + (dy / 111320)
            const lng = centerLng + (dx / (111320 * Math.cos(centerLat * Math.PI / 180)))
            coords.push([lng, lat])
          }
          
          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: { minutes: ring.minutes },
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
              "fill-color": ring.color,
              "fill-opacity": ring.opacity
            }
          })
          
          map.addLayer({
            id: `${layerId}-outline`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": ring.color,
              "line-width": 1.5,
              "line-opacity": 0.4,
              "line-dasharray": [4, 2]
            }
          })
        }
      })
    }
    
    if (visible && showDensity) {
      DENSITY_ZONES.forEach((zone) => {
        const sourceId = `density-zone-${zone.id}`
        const layerId = `density-layer-${zone.id}`
        
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
              properties: { intensity: zone.intensity },
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
              "fill-color": intensityColors[zone.intensity],
              "fill-opacity": 1
            }
          })
        }
      })
    }
    
    return () => cleanupLayers()
  }, [map, isMapReady, centerLat, centerLng, visible, showTravelRings, showDensity])
}
