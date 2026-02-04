/**
 * Population Density Grid Layer
 * Uses a 40x40 grid with discrete rectangular cells for clear visual representation
 * Data source: WorldPop / VIIRS (Demo Baseline)
 */

import { useEffect, useRef } from "react"
import { useMap } from "@vis.gl/react-google-maps"
import { Loader2, Users, RefreshCw, Info } from "lucide-react"
import { getPopulationGrid, type PopulationGridData, GRID_CONFIG } from "@/lib/population-grid"

declare const google: any

interface PopulationHeatmapProps {
  visible: boolean
  onDataReady?: (data: PopulationGridData) => void
}

// 5-level tactical density classification
export const DENSITY_LEVELS = [
  { id: 'critical', label: 'CRITICAL', threshold: 0.8, fill: 'rgba(127, 29, 29, 0.75)', border: 'rgba(69, 10, 10, 0.9)', value: '>40k/km²', tooltip: 'Extreme density - mass casualty risk' },
  { id: 'high', label: 'HIGH', threshold: 0.6, fill: 'rgba(185, 28, 28, 0.7)', border: 'rgba(127, 29, 29, 0.85)', value: '25-40k/km²', tooltip: 'High density urban core' },
  { id: 'moderate', label: 'MODERATE', threshold: 0.4, fill: 'rgba(217, 119, 6, 0.65)', border: 'rgba(180, 83, 9, 0.8)', value: '12-25k/km²', tooltip: 'Urban/commercial areas' },
  { id: 'low', label: 'LOW', threshold: 0.2, fill: 'rgba(22, 163, 74, 0.55)', border: 'rgba(21, 128, 61, 0.7)', value: '5-12k/km²', tooltip: 'Suburban residential' },
  { id: 'minimal', label: 'MINIMAL', threshold: 0, fill: 'rgba(34, 197, 94, 0.4)', border: 'rgba(22, 163, 74, 0.55)', value: '<5k/km²', tooltip: 'Low density/rural' }
]

// Get density level for a normalized value
function getDensityLevel(density: number) {
  for (const level of DENSITY_LEVELS) {
    if (density >= level.threshold) return level
  }
  return DENSITY_LEVELS[DENSITY_LEVELS.length - 1]
}

// Get color for density level (0-1 normalized)
function getDensityColor(density: number): string {
  return getDensityLevel(density).fill
}

// Get border color for density level
function getDensityBorder(density: number): string {
  return getDensityLevel(density).border
}

/**
 * PopulationHeatmapLayer - Renders AOI-wide grid with discrete cells
 * Uses 40x40 grid (1600 cells) with clear rectangular boundaries
 * Includes zoom-based optimization and major grid lines
 */
export function PopulationHeatmapLayer({
  visible,
  onDataReady
}: PopulationHeatmapProps) {
  const map = useMap()
  const rectanglesRef = useRef<any[]>([])
  const gridLinesRef = useRef<any[]>([])
  const gridDataRef = useRef<PopulationGridData | null>(null)
  const zoomListenerRef = useRef<any>(null)
  const lastZoomRef = useRef<number>(0)
  
  useEffect(() => {
    if (!map) {
      console.log('[PopGrid] Map not ready')
      return
    }
    
    // Cleanup existing elements
    const cleanup = () => {
      rectanglesRef.current.forEach(rect => rect.setMap(null))
      rectanglesRef.current = []
      gridLinesRef.current.forEach(line => line.setMap(null))
      gridLinesRef.current = []
    }
    
    if (!visible) {
      cleanup()
      if (zoomListenerRef.current) {
        google.maps.event.removeListener(zoomListenerRef.current)
        zoomListenerRef.current = null
      }
      return
    }
    
    // Get or generate the population grid
    if (!gridDataRef.current) {
      gridDataRef.current = getPopulationGrid()
      console.log('[PopGrid] Grid generated:', gridDataRef.current.metadata)
      if (onDataReady) {
        onDataReady(gridDataRef.current)
      }
    }
    
    const gridData = gridDataRef.current
    const stepSize = GRID_CONFIG.stepSize
    const halfStep = stepSize / 2
    const { north, south, east, west } = gridData.bounds
    
    // Zoom-based rendering configuration
    const getZoomConfig = (zoom: number) => {
      // At low zoom: skip cells, thinner borders, lower opacity
      // At high zoom: full detail, thick borders, high opacity
      if (zoom >= 13) return { skip: 1, threshold: 0.05, strokeWeight: 2, opacityMult: 1.0 }
      if (zoom >= 11) return { skip: 1, threshold: 0.08, strokeWeight: 1.5, opacityMult: 0.9 }
      if (zoom >= 9) return { skip: 2, threshold: 0.15, strokeWeight: 1, opacityMult: 0.8 }
      return { skip: 4, threshold: 0.25, strokeWeight: 0.5, opacityMult: 0.6 }
    }
    
    // Render function for zoom-aware drawing
    const renderGrid = () => {
      cleanup()
      
      const zoom = (map as any).getZoom?.() || 10
      const config = getZoomConfig(zoom)
      
      // Track if zoom changed significantly (by integer level)
      const zoomLevel = Math.floor(zoom)
      if (zoomLevel === lastZoomRef.current && rectanglesRef.current.length > 0) {
        return // Skip re-render if zoom level unchanged
      }
      lastZoomRef.current = zoomLevel
      
      // Render density cells with zoom-aware optimization
      let cellCount = 0
      gridData.points.forEach((point, idx) => {
        // Skip cells based on zoom level for performance
        if (config.skip > 1 && idx % config.skip !== 0) return
        // Apply density threshold
        if (point.density < config.threshold) return
        
        const bounds = {
          north: point.lat + halfStep * (config.skip > 1 ? config.skip / 2 : 1),
          south: point.lat - halfStep * (config.skip > 1 ? config.skip / 2 : 1),
          east: point.lng + halfStep * (config.skip > 1 ? config.skip / 2 : 1),
          west: point.lng - halfStep * (config.skip > 1 ? config.skip / 2 : 1)
        }
        
        const rect = new google.maps.Rectangle({
          bounds,
          map,
          strokeColor: getDensityBorder(point.density),
          strokeOpacity: config.opacityMult,
          strokeWeight: config.strokeWeight,
          fillColor: getDensityColor(point.density),
          fillOpacity: config.opacityMult,
          clickable: false,
          zIndex: 1
        })
        
        rectanglesRef.current.push(rect)
        cellCount++
      })
      
      // Add major grid lines every 10 cells (4x4 major grid overlay)
      const majorStep = stepSize * 10
      const gridLineColor = `rgba(255, 255, 255, ${0.4 * config.opacityMult})`
      const gridLineWeight = config.strokeWeight
      
      // Vertical major grid lines
      for (let lng = west; lng <= east + 0.001; lng += majorStep) {
        const line = new google.maps.Polyline({
          path: [{ lat: north, lng }, { lat: south, lng }],
          map,
          strokeColor: gridLineColor,
          strokeOpacity: 1,
          strokeWeight: gridLineWeight,
          zIndex: 10
        })
        gridLinesRef.current.push(line)
      }
      
      // Horizontal major grid lines
      for (let lat = south; lat <= north + 0.001; lat += majorStep) {
        const line = new google.maps.Polyline({
          path: [{ lat, lng: west }, { lat, lng: east }],
          map,
          strokeColor: gridLineColor,
          strokeOpacity: 1,
          strokeWeight: gridLineWeight,
          zIndex: 10
        })
        gridLinesRef.current.push(line)
      }
      
      console.log('[PopGrid] Rendered', cellCount, 'cells +', gridLinesRef.current.length, 'grid lines (zoom:', zoom.toFixed(1), ')')
    }
    
    // Initial render
    renderGrid()
    
    // Add zoom listener for dynamic re-rendering
    if (!zoomListenerRef.current) {
      let debounceTimeout: any = null
      zoomListenerRef.current = (map as any).addListener?.('zoom_changed', () => {
        // Debounce zoom changes to avoid excessive re-renders
        if (debounceTimeout) clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(renderGrid, 150)
      })
    }
    
    return () => {
      cleanup()
      if (zoomListenerRef.current) {
        google.maps.event.removeListener(zoomListenerRef.current)
        zoomListenerRef.current = null
      }
    }
  }, [map, visible, onDataReady])
  
  return null
}

// Keep legacy interface for backwards compatibility
interface LegacyPopulationCell {
  lat: number
  lng: number
  population: number
  density: number
  urbanLevel: 'urban' | 'suburban' | 'rural'
}

interface LegacyPopulationHeatmapProps {
  cells: LegacyPopulationCell[]
  visible: boolean
}

export function PopulationHeatmapMarkers({
  cells,
  visible
}: LegacyPopulationHeatmapProps) {
  // Ignore legacy cells, use new grid-based system
  return <PopulationHeatmapLayer visible={visible} />
}

// Population Legend component with "Baseline layer (demo)" label
interface PopulationLegendProps {
  data?: PopulationGridData | null
  isLoading?: boolean
  onRefresh?: () => void
  mapStyle: 'streets' | 'satellite' | 'hybrid'
}

export function PopulationLegend({ data, isLoading = false, onRefresh, mapStyle }: PopulationLegendProps) {
  const isDark = mapStyle === 'satellite' || mapStyle === 'hybrid'
  
  // Always use the local grid data for accurate metadata display
  const gridData = getPopulationGrid()
  
  return (
    <div 
      style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 12,
        minWidth: 190,
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)'
      }}
    >
      {/* Header with title */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 6
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
        {onRefresh && (
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
        )}
      </div>
      
      {/* Demo baseline label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 6px',
        marginBottom: 10,
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        borderRadius: 4,
        border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <Info style={{ width: 10, height: 10, color: isDark ? '#60a5fa' : '#3b82f6' }} />
        <span style={{ 
          fontSize: 9, 
          color: isDark ? '#93c5fd' : '#2563eb',
          fontWeight: 500
        }}>
          Baseline layer (demo)
        </span>
      </div>
      
      {/* 5-Level Discrete Density Scale */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {DENSITY_LEVELS.map((level) => (
          <div 
            key={level.id} 
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            title={level.tooltip}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: 2,
              backgroundColor: level.fill,
              border: `2px solid ${level.border}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }} />
            <span style={{ 
              fontSize: 10, 
              color: level.id === 'critical' ? (isDark ? '#fca5a5' : '#dc2626') :
                     level.id === 'high' ? (isDark ? '#fca5a5' : '#dc2626') :
                     level.id === 'moderate' ? (isDark ? '#fcd34d' : '#d97706') :
                     (isDark ? '#86efac' : '#16a34a'),
              fontWeight: 600,
              minWidth: 65,
              letterSpacing: '0.02em'
            }}>
              {level.label}
            </span>
            <span style={{ 
              fontSize: 9, 
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              {level.value}
            </span>
          </div>
        ))}
      </div>
      
      {/* Grid Info */}
      <div style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        fontSize: 9,
        color: isDark ? '#6b7280' : '#9ca3af'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span>Grid:</span>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280', fontFamily: 'monospace' }}>
            40×40 (~750m cells)
          </span>
        </div>
        {gridData && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span>Avg Density:</span>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              {gridData.metadata.avgDensity.toLocaleString()}/km²
            </span>
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 8, color: isDark ? '#4b5563' : '#9ca3af' }}>
          {gridData?.source || 'WorldPop / VIIRS Estimate'}
        </div>
      </div>
    </div>
  )
}
