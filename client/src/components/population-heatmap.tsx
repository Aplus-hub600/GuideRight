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

// Get color for density level (0-1 normalized)
function getDensityColor(density: number): string {
  // 5-level tactical color scheme with clear boundaries
  if (density >= 0.8) return 'rgba(185, 28, 28, 0.65)' // Dark red - CRITICAL
  if (density >= 0.6) return 'rgba(239, 68, 68, 0.55)' // Red - HIGH
  if (density >= 0.4) return 'rgba(245, 158, 11, 0.45)' // Amber - MODERATE
  if (density >= 0.2) return 'rgba(34, 197, 94, 0.35)' // Green - LOW
  return 'rgba(34, 197, 94, 0.15)' // Light green - MINIMAL
}

// Get border color for density level
function getDensityBorder(density: number): string {
  if (density >= 0.8) return 'rgba(127, 29, 29, 0.8)'
  if (density >= 0.6) return 'rgba(185, 28, 28, 0.7)'
  if (density >= 0.4) return 'rgba(180, 83, 9, 0.6)'
  if (density >= 0.2) return 'rgba(21, 128, 61, 0.5)'
  return 'rgba(21, 128, 61, 0.3)'
}

/**
 * PopulationHeatmapLayer - Renders AOI-wide grid with discrete cells
 * Uses 40x40 grid (1600 cells) with clear rectangular boundaries
 */
export function PopulationHeatmapLayer({
  visible,
  onDataReady
}: PopulationHeatmapProps) {
  const map = useMap()
  const rectanglesRef = useRef<any[]>([])
  const gridDataRef = useRef<PopulationGridData | null>(null)
  
  useEffect(() => {
    if (!map) {
      console.log('[PopGrid] Map not ready')
      return
    }
    
    // Cleanup existing rectangles
    const cleanup = () => {
      rectanglesRef.current.forEach(rect => rect.setMap(null))
      rectanglesRef.current = []
    }
    
    if (!visible) {
      cleanup()
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
    
    // Create grid cells as rectangles
    cleanup()
    
    gridData.points.forEach(point => {
      // Only render cells with meaningful density (>5% of max)
      if (point.density < 0.05) return
      
      const bounds = {
        north: point.lat + halfStep,
        south: point.lat - halfStep,
        east: point.lng + halfStep,
        west: point.lng - halfStep
      }
      
      const rect = new google.maps.Rectangle({
        bounds,
        map,
        strokeColor: getDensityBorder(point.density),
        strokeOpacity: 1,
        strokeWeight: 0.5,
        fillColor: getDensityColor(point.density),
        fillOpacity: 1,
        clickable: false,
        zIndex: 1
      })
      
      rectanglesRef.current.push(rect)
    })
    
    console.log('[PopGrid] Rendered', rectanglesRef.current.length, 'grid cells')
    
    return cleanup
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
  // (API data may not have the same structure)
  const gridData = getPopulationGrid()
  
  // Simplified density ranges matching the gradient
  const densityRanges = [
    { label: 'High', color: 'rgba(220, 38, 38, 0.85)', value: '>20,000/km²', tooltip: 'Dense urban core' },
    { label: 'Medium', color: 'rgba(234, 179, 8, 0.7)', value: '8-20k/km²', tooltip: 'Urban/suburban areas' },
    { label: 'Low', color: 'rgba(34, 197, 94, 0.5)', value: '<8,000/km²', tooltip: 'Suburban/rural areas' }
  ]
  
  return (
    <div 
      style={{
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 12,
        minWidth: 180,
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)'
      }}
    >
      {/* Header with title and demo label */}
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
        marginBottom: 8,
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
      
      {/* Density scale with tooltips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {densityRanges.map((range, idx) => (
          <div 
            key={idx} 
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            title={range.tooltip}
          >
            <div style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: range.color,
              border: '1px solid rgba(255,255,255,0.2)'
            }} />
            <span style={{ 
              fontSize: 11, 
              color: isDark ? '#e5e7eb' : '#374151',
              fontWeight: 500,
              minWidth: 50
            }}>
              {range.label}
            </span>
            <span style={{ 
              fontSize: 10, 
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              {range.value}
            </span>
          </div>
        ))}
      </div>
      
      {/* Gradient bar for visual reference */}
      <div style={{
        marginTop: 8,
        height: 8,
        borderRadius: 4,
        background: 'linear-gradient(to right, rgba(34, 197, 94, 0.6), rgba(234, 179, 8, 0.7), rgba(239, 68, 68, 0.8), rgba(153, 27, 27, 0.85))',
        border: '1px solid rgba(255,255,255,0.1)'
      }} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 8,
        color: isDark ? '#6b7280' : '#9ca3af',
        marginTop: 2
      }}>
        <span>Low</span>
        <span>High</span>
      </div>
      
      {/* Metadata */}
      {gridData && (
        <div style={{ 
          marginTop: 8, 
          paddingTop: 8, 
          borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          fontSize: 9,
          color: isDark ? '#6b7280' : '#9ca3af'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Grid Points:</span>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              {gridData.metadata.totalPoints.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Avg Density:</span>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              {gridData.metadata.avgDensity.toLocaleString()}/km²
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 8, color: isDark ? '#4b5563' : '#9ca3af' }}>
            {gridData.source}
          </div>
        </div>
      )}
    </div>
  )
}
