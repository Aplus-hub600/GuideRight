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

// Whitepaper-aligned density classification using qualitative descriptors
// Philosophy: "Represent human activity as spatial patterns and intensity rather than discrete claims"
// Uses muted palette to convey uncertainty and avoid false precision
// Thresholds define intensity bands, not precise classifications
export const DENSITY_LEVELS = [
  { id: 'concentrated', label: 'Concentrated', threshold: 0.70, fill: 'rgba(127, 86, 96, 0.55)', border: 'rgba(127, 86, 96, 0.35)', value: 'Very High Activity', tooltip: 'Concentrated population activity observed' },
  { id: 'elevated', label: 'Elevated', threshold: 0.45, fill: 'rgba(142, 108, 95, 0.50)', border: 'rgba(142, 108, 95, 0.30)', value: 'High Activity', tooltip: 'Elevated activity patterns detected' },
  { id: 'moderate', label: 'Moderate', threshold: 0.25, fill: 'rgba(156, 133, 108, 0.45)', border: 'rgba(156, 133, 108, 0.25)', value: 'Moderate Activity', tooltip: 'Moderate activity levels' },
  { id: 'dispersed', label: 'Dispersed', threshold: 0.10, fill: 'rgba(148, 153, 131, 0.40)', border: 'rgba(148, 153, 131, 0.20)', value: 'Low Activity', tooltip: 'Dispersed activity patterns' },
  { id: 'sparse', label: 'Sparse', threshold: 0, fill: 'rgba(134, 148, 134, 0.30)', border: 'rgba(134, 148, 134, 0.15)', value: 'Minimal Activity', tooltip: 'Sparse or inferred activity' }
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
    
    // Zoom-based rendering configuration - whitepaper aligned
    // Uses softer stroke weights and lower opacity for pattern-based visualization
    // Emphasizes spatial patterns rather than discrete boundaries
    const getZoomConfig = (zoom: number) => {
      // At low zoom: skip cells, minimal borders, soft opacity for gradient effect
      // At high zoom: full detail but still soft borders to avoid false precision
      if (zoom >= 13) return { skip: 1, threshold: 0.05, strokeWeight: 0.5, opacityMult: 1.0 }
      if (zoom >= 11) return { skip: 1, threshold: 0.08, strokeWeight: 0.3, opacityMult: 0.85 }
      if (zoom >= 9) return { skip: 2, threshold: 0.12, strokeWeight: 0.2, opacityMult: 0.75 }
      return { skip: 4, threshold: 0.20, strokeWeight: 0, opacityMult: 0.6 }
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
        
        // Whitepaper: Remove hard cell boundaries for gradient-like pattern visualization
        // No borders, just soft fills to show spatial patterns
        const rect = new google.maps.Rectangle({
          bounds,
          map,
          strokeColor: 'transparent',
          strokeOpacity: 0,
          strokeWeight: 0,
          fillColor: getDensityColor(point.density),
          fillOpacity: config.opacityMult * 0.9, // Slightly lower opacity for softer blending
          clickable: false,
          zIndex: 1
        })
        
        rectanglesRef.current.push(rect)
        cellCount++
      })
      
      // Add subtle reference grid lines every 10 cells (4x4 major grid overlay)
      // Whitepaper: use subtle visual cues, not hard boundaries
      const majorStep = stepSize * 10
      const gridLineColor = `rgba(255, 255, 255, ${0.15 * config.opacityMult})`
      const gridLineWeight = Math.max(0.3, config.strokeWeight * 0.5)
      
      // Only show grid lines at higher zoom for subtle reference
      if (zoom >= 10) {
        // Vertical major grid lines
        for (let lng = west; lng <= east + 0.001; lng += majorStep) {
          const line = new google.maps.Polyline({
            path: [{ lat: north, lng }, { lat: south, lng }],
            map,
            strokeColor: gridLineColor,
            strokeOpacity: 1,
            strokeWeight: gridLineWeight,
            zIndex: 2
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
            zIndex: 2
          })
          gridLinesRef.current.push(line)
        }
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
        backgroundColor: isDark ? 'rgba(0,0,0,0.88)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 12,
        minWidth: 180,
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)'
      }}
    >
      {/* Header with title - whitepaper aligned: restrained, analytical */}
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
          color: isDark ? 'rgba(255,255,255,0.85)' : '#374151',
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: '0.02em'
        }}>
          <Users style={{ width: 13, height: 13, opacity: 0.8 }} />
          Activity Density
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
              alignItems: 'center',
              opacity: 0.6
            }}
          >
            {isLoading ? (
              <Loader2 style={{ width: 12, height: 12, color: isDark ? '#9ca3af' : '#6b7280' }} className="animate-spin" />
            ) : (
              <RefreshCw style={{ width: 12, height: 12, color: isDark ? '#9ca3af' : '#6b7280' }} />
            )}
          </button>
        )}
      </div>
      
      {/* Pattern-based indicator note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 5px',
        marginBottom: 10,
        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.08)',
        borderRadius: 3,
        border: isDark ? '1px solid rgba(148, 163, 184, 0.15)' : '1px solid rgba(100, 116, 139, 0.12)'
      }}>
        <Info style={{ width: 9, height: 9, color: isDark ? '#94a3b8' : '#64748b', opacity: 0.7 }} />
        <span style={{ 
          fontSize: 8, 
          color: isDark ? '#94a3b8' : '#64748b',
          fontWeight: 400,
          fontStyle: 'italic'
        }}>
          Pattern-based estimate
        </span>
      </div>
      
      {/* Intensity Bands - qualitative labels aligned with whitepaper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {DENSITY_LEVELS.map((level) => (
          <div 
            key={level.id} 
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            title={level.tooltip}
          >
            <div style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: level.fill,
              border: `1px solid ${level.border}`,
              boxShadow: 'none'
            }} />
            <span style={{ 
              fontSize: 10, 
              color: isDark ? 'rgba(255,255,255,0.75)' : '#4b5563',
              fontWeight: 500,
              minWidth: 70
            }}>
              {level.label}
            </span>
            <span style={{ 
              fontSize: 9, 
              color: isDark ? 'rgba(255,255,255,0.45)' : '#9ca3af',
              fontStyle: 'italic'
            }}>
              {level.value}
            </span>
          </div>
        ))}
      </div>
      
      {/* Coverage note - emphasizing uncertainty per whitepaper */}
      <div style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
        fontSize: 8,
        color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'
      }}>
        <div style={{ marginBottom: 4, fontStyle: 'italic' }}>
          Coverage varies by source availability
        </div>
        <div style={{ opacity: 0.7 }}>
          {gridData?.source || 'WorldPop / VIIRS Estimate'}
        </div>
      </div>
    </div>
  )
}
