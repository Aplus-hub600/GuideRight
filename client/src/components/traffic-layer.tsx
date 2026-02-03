/**
 * Traffic Layer Component
 * Shows real-time traffic conditions on roads using Google Maps TrafficLayer
 * Red = Heavy traffic, Yellow = Moderate, Green = Free flow
 */

import { useEffect, useRef } from "react"
import { useMap } from "@vis.gl/react-google-maps"
import { Car, AlertTriangle, Clock, TrendingUp } from "lucide-react"

declare const google: any

interface TrafficLayerProps {
  visible: boolean
}

export function TrafficLayer({ visible }: TrafficLayerProps) {
  const map = useMap()
  const trafficLayerRef = useRef<any>(null)
  
  useEffect(() => {
    if (!map || !window.google?.maps) {
      console.log('[TrafficLayer] Map or Google Maps not ready')
      return
    }
    
    console.log('[TrafficLayer] Creating/updating traffic layer, visible:', visible)
    
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer()
    }
    
    trafficLayerRef.current.setMap(visible ? map : null)
    
    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null)
      }
    }
  }, [map, visible])
  
  return null
}

interface TrafficLegendProps {
  mapStyle: 'streets' | 'satellite' | 'hybrid'
}

export function TrafficLegend({ mapStyle }: TrafficLegendProps) {
  const isDark = mapStyle === 'satellite' || mapStyle === 'hybrid'
  
  const trafficLevels = [
    { label: 'Heavy Traffic', color: '#ff0000', desc: 'Delays likely', icon: AlertTriangle },
    { label: 'Moderate', color: '#ff9900', desc: 'Some slowdowns', icon: Clock },
    { label: 'Light Traffic', color: '#00cc00', desc: 'Free flow', icon: TrendingUp },
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
        minWidth: 160,
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6,
        color: isDark ? '#fff' : '#1f2937',
        fontWeight: 600,
        fontSize: 12,
        marginBottom: 10
      }}>
        <Car style={{ width: 14, height: 14 }} />
        TRAFFIC CONDITIONS
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {trafficLevels.map((level, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20,
              height: 4,
              borderRadius: 2,
              backgroundColor: level.color,
            }} />
            <span style={{ 
              fontSize: 11, 
              color: isDark ? '#d1d5db' : '#4b5563',
              flex: 1
            }}>
              {level.label}
            </span>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: 10, 
        paddingTop: 8, 
        borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        fontSize: 9,
        color: isDark ? '#6b7280' : '#9ca3af'
      }}>
        Live traffic data from Google Maps
      </div>
    </div>
  )
}
