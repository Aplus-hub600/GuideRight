/**
 * Population Density Heatmap Layer
 * Uses Google Earth Engine / WorldPop data to display population density
 * Renders as a smooth gradient heatmap using Google Maps Visualization library
 */

import { useEffect, useRef } from "react"
import { useMap } from "@vis.gl/react-google-maps"
import { Loader2, Users, RefreshCw, Layers } from "lucide-react"

// Using any for Google Maps types since they're loaded at runtime
declare const google: any

interface PopulationCell {
  lat: number
  lng: number
  population: number
  density: number
  urbanLevel: 'urban' | 'suburban' | 'rural'
}

interface PopulationData {
  totalPopulation: number
  populationDensity: number
  urbanPopulation: number
  ruralPopulation: number
  gridCells: PopulationCell[]
}

interface SocioeconomicData {
  nightLightIntensity: number
  economicActivityIndex: number
  infrastructureDensity: number
  accessibilityScore: number
}

interface EarthEngineResponse {
  population: PopulationData
  socioeconomic: SocioeconomicData
  source: string
  timestamp: string
  coverage: {
    area_sq_km: number
    data_year: number
  }
}

interface PopulationHeatmapProps {
  cells: PopulationCell[]
  visible: boolean
}

/**
 * PopulationHeatmapLayer - Renders a smooth gradient heatmap using Google Maps Visualization
 * This creates a proper heatmap overlay instead of individual markers
 */
export function PopulationHeatmapLayer({
  cells,
  visible
}: PopulationHeatmapProps) {
  const map = useMap()
  const heatmapRef = useRef<any>(null)
  
  useEffect(() => {
    if (!map || !window.google?.maps?.visualization) return
    
    // Create heatmap layer if it doesn't exist
    if (!heatmapRef.current) {
      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        map: visible ? map : null,
        radius: 25,
        opacity: 0.7,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      })
    }
    
    // Update visibility
    heatmapRef.current.setMap(visible ? map : null)
    
    // Update data if visible
    if (visible && cells && cells.length > 0) {
      const heatmapData = cells.map(cell => ({
        location: new google.maps.LatLng(cell.lat, cell.lng),
        weight: Math.log10(cell.density + 1) * 10 // Log scale for better visualization
      }))
      heatmapRef.current.setData(heatmapData)
    }
    
    return () => {
      // Cleanup on unmount
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null)
      }
    }
  }, [map, cells, visible])
  
  // Update data when cells change
  useEffect(() => {
    if (!heatmapRef.current || !visible || !cells || cells.length === 0) return
    
    const heatmapData = cells.map(cell => ({
      location: new google.maps.LatLng(cell.lat, cell.lng),
      weight: Math.log10(cell.density + 1) * 10
    }))
    heatmapRef.current.setData(heatmapData)
  }, [cells, visible])
  
  return null // This component renders via Google Maps API, not React DOM
}

// Also keep the markers version as an alternative
export function PopulationHeatmapMarkers({
  cells,
  visible
}: PopulationHeatmapProps) {
  // Use the heatmap layer instead of individual markers
  return <PopulationHeatmapLayer cells={cells} visible={visible} />
}

// Population Legend component
interface PopulationLegendProps {
  data: EarthEngineResponse | null
  isLoading: boolean
  onRefresh: () => void
  mapStyle: 'streets' | 'satellite' | 'hybrid'
}

export function PopulationLegend({ data, isLoading, onRefresh, mapStyle }: PopulationLegendProps) {
  const isDark = mapStyle === 'satellite' || mapStyle === 'hybrid'
  
  const densityRanges = [
    { label: '>40k/km²', color: 'rgba(139, 0, 0, 0.9)', desc: 'Extreme' },
    { label: '25-40k', color: 'rgba(220, 38, 38, 0.85)', desc: 'Very High' },
    { label: '15-25k', color: 'rgba(249, 115, 22, 0.8)', desc: 'High' },
    { label: '8-15k', color: 'rgba(234, 179, 8, 0.75)', desc: 'Medium-High' },
    { label: '4-8k', color: 'rgba(132, 204, 22, 0.7)', desc: 'Medium' },
    { label: '1.5-4k', color: 'rgba(34, 197, 94, 0.65)', desc: 'Low-Medium' },
    { label: '<1.5k', color: 'rgba(14, 165, 233, 0.6)', desc: 'Low' }
  ]
  
  return (
    <div 
      style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        padding: 12,
        minWidth: 200,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          color: isDark ? '#fff' : '#1f2937',
          fontWeight: 600,
          fontSize: 12
        }}>
          <Users style={{ width: 14, height: 14 }} />
          POPULATION DENSITY
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'wait' : 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isLoading ? (
            <Loader2 style={{ width: 14, height: 14, color: isDark ? '#9ca3af' : '#6b7280' }} className="animate-spin" />
          ) : (
            <RefreshCw style={{ width: 14, height: 14, color: isDark ? '#9ca3af' : '#6b7280' }} />
          )}
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {densityRanges.map((range, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: range.color,
              border: '1px solid rgba(255,255,255,0.3)'
            }} />
            <span style={{ 
              fontSize: 10, 
              color: isDark ? '#d1d5db' : '#4b5563',
              flex: 1
            }}>
              {range.label}
            </span>
            <span style={{ 
              fontSize: 9, 
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              {range.desc}
            </span>
          </div>
        ))}
      </div>
      
      {data && (
        <div style={{ 
          marginTop: 8, 
          paddingTop: 8, 
          borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          fontSize: 10,
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Pop:</span>
            <strong style={{ color: isDark ? '#fff' : '#1f2937' }}>
              {(data.population.totalPopulation / 1000000).toFixed(1)}M
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Avg Density:</span>
            <strong style={{ color: isDark ? '#fff' : '#1f2937' }}>
              {data.population.populationDensity.toLocaleString()}/km²
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Urban:</span>
            <strong style={{ color: isDark ? '#fff' : '#1f2937' }}>
              {Math.round((data.population.urbanPopulation / Math.max(1, data.population.totalPopulation)) * 100)}%
            </strong>
          </div>
          <div style={{ marginTop: 4, fontSize: 9, color: isDark ? '#6b7280' : '#9ca3af' }}>
            {data.source} ({data.coverage.data_year})
          </div>
        </div>
      )}
    </div>
  )
}
