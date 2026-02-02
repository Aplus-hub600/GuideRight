/**
 * Population Density Heatmap Layer
 * Uses Google Earth Engine / WorldPop data to display population density
 */

import { useEffect, useState, useCallback } from "react"
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Users, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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

// Get color based on population density
function getDensityColor(density: number): string {
  // Dhaka-calibrated density ranges (people per sq km)
  if (density >= 40000) return 'rgba(139, 0, 0, 0.7)' // Dark red - extreme
  if (density >= 25000) return 'rgba(220, 38, 38, 0.65)' // Red - very high
  if (density >= 15000) return 'rgba(249, 115, 22, 0.6)' // Orange - high
  if (density >= 8000) return 'rgba(234, 179, 8, 0.55)' // Yellow - medium-high
  if (density >= 4000) return 'rgba(132, 204, 22, 0.5)' // Light green - medium
  if (density >= 1500) return 'rgba(34, 197, 94, 0.45)' // Green - low-medium
  return 'rgba(14, 165, 233, 0.4)' // Blue - low
}

// Get marker size based on density
function getMarkerSize(density: number): number {
  if (density >= 40000) return 18
  if (density >= 25000) return 16
  if (density >= 15000) return 14
  if (density >= 8000) return 12
  if (density >= 4000) return 10
  return 8
}

function PopulationDensityMarker({ cell }: { cell: PopulationCell }) {
  const color = getDensityColor(cell.density)
  const size = getMarkerSize(cell.density)
  
  return (
    <AdvancedMarker position={{ lat: cell.lat, lng: cell.lng }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
        title={`Density: ${cell.density.toLocaleString()}/km² | ${cell.urbanLevel}`}
      />
    </AdvancedMarker>
  )
}

export function PopulationHeatmapMarkers({
  cells,
  visible
}: PopulationHeatmapProps) {
  if (!visible || !cells || cells.length === 0) return null
  
  // Limit displayed cells for performance
  const displayCells = cells.slice(0, 500)
  
  return (
    <>
      {displayCells.map((cell, idx) => (
        <PopulationDensityMarker key={`pop-${idx}`} cell={cell} />
      ))}
    </>
  )
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
