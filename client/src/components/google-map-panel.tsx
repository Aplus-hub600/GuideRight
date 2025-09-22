import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, Route, Target, Layers, Globe } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useGoogleMaps } from "@/hooks/useGoogleMaps"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface MovementPlan {
  route: Array<{ lat: number; lng: number }>
  rationale: string
}

interface GoogleMapPanelProps {
  aoi?: AOI
  riskScore?: number
  movementPlan?: MovementPlan
  onAOIChange?: (aoi: AOI) => void
  onMovementPlanRequest?: () => void
  className?: string
}

export function GoogleMapPanel({
  aoi,
  riskScore,
  movementPlan,
  onAOIChange,
  onMovementPlanRequest,
  className
}: GoogleMapPanelProps) {
  const { t } = useTranslation()
  const { isLoaded, loadError } = useGoogleMaps()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  const waypointMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const geotaggedMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('satellite')

  // Default AOI for demo
  const currentAOI = aoi || {
    name: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    radiusKm: 5
  }

  const getRiskColor = (score?: number) => {
    if (!score) return '#3b82f6' // blue
    if (score < 30) return '#22c55e' // green
    if (score < 60) return '#f59e0b' // yellow
    if (score < 80) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getRiskLevel = (score?: number) => {
    if (!score) return 'Unknown'
    if (score < 30) return 'Low'
    if (score < 60) return 'Moderate'
    if (score < 80) return 'High'
    return 'Critical'
  }

  const handleMovementPlan = async () => {
    console.log('Movement plan requested')
    setIsLoading(true)
    
    // Mock movement plan generation
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    onMovementPlanRequest?.()
  }

  const initializeMap = useCallback(async () => {
    if (!isLoaded || !mapRef.current || !window.google || mapInstanceRef.current) return

    // Initialize map with map ID for advanced markers
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: currentAOI.lat, lng: currentAOI.lng },
      zoom: 13,
      mapId: 'TACTICAL_MAP', // Required for AdvancedMarkerElement
      mapTypeId: mapType,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      tilt: 45, // Enable 3D terrain capability
      styles: [
        // Dark mode styling for better tactical appearance
        {
          elementType: "labels",
          stylers: [{ visibility: "on" }]
        }
      ]
    })

    mapInstanceRef.current = map

    // Add click listener for AOI selection
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newAOI: AOI = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          radiusKm: currentAOI.radiusKm || 5
        }
        console.log('New AOI selected:', newAOI)
        onAOIChange?.(newAOI)
      }
    })

    // Load marker library for AdvancedMarkerElement
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
    
    updateMapElements(map, AdvancedMarkerElement, PinElement)
  }, [isLoaded, onAOIChange])

  const updateMapElements = useCallback(async (map: google.maps.Map, AdvancedMarkerElement?: any, PinElement?: any) => {
    // Import marker library if not provided
    if (!AdvancedMarkerElement || !PinElement) {
      const { AdvancedMarkerElement: AME, PinElement: PE } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      AdvancedMarkerElement = AME;
      PinElement = PE;
    }

    // Clear existing elements
    if (markerRef.current) {
      markerRef.current.map = null
    }
    if (circleRef.current) {
      circleRef.current.setMap(null)
    }
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
    }

    // Create custom pin for AOI marker
    const aoiPin = new PinElement({
      background: getRiskColor(riskScore),
      borderColor: '#ffffff',
      scale: 1.2,
      glyph: '🎯'
    })

    // Add advanced marker for AOI
    const marker = new AdvancedMarkerElement({
      position: { lat: currentAOI.lat, lng: currentAOI.lng },
      map: map,
      title: currentAOI.name || "Area of Interest",
      content: aoiPin.element
    })

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${currentAOI.name || "Area of Interest"}</h3>
          <p style="margin: 0 0 4px 0; color: #666; font-family: monospace;">
            ${currentAOI.lat.toFixed(4)}, ${currentAOI.lng.toFixed(4)}
          </p>
          ${riskScore !== undefined ? `
            <p style="margin: 4px 0 0 0; font-size: 12px;">
              Risk: ${getRiskLevel(riskScore)} (${riskScore}/100)
            </p>
          ` : ''}
        </div>
      `
    })

    marker.addListener('click', () => {
      infoWindow.open({ map, anchor: marker })
    })

    markerRef.current = marker

    // Add AOI circle
    if (currentAOI.radiusKm) {
      const circle = new window.google.maps.Circle({
        strokeColor: getRiskColor(riskScore),
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: getRiskColor(riskScore),
        fillOpacity: 0.1,
        map: map,
        center: { lat: currentAOI.lat, lng: currentAOI.lng },
        radius: currentAOI.radiusKm * 1000 // Convert to meters
      })
      circleRef.current = circle
    }

    // Add movement plan polyline
    if (movementPlan) {
      const polyline = new window.google.maps.Polyline({
        path: movementPlan.route.map(p => ({ lat: p.lat, lng: p.lng })),
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map
      })
      polylineRef.current = polyline
    }
  }, [currentAOI, riskScore, movementPlan])

  // Initialize map when Google Maps loads
  useEffect(() => {
    if (isLoaded) {
      initializeMap()
    }
  }, [isLoaded, initializeMap])

  // Update map elements when data changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapElements(mapInstanceRef.current)
      
      // Pan to new AOI
      mapInstanceRef.current.panTo({ lat: currentAOI.lat, lng: currentAOI.lng })
    }
  }, [currentAOI, riskScore, movementPlan, updateMapElements])

  // Update map type
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType)
    }
  }, [mapType])

  // Mock movement plan for demo
  const demoMovementPlan: MovementPlan = movementPlan || {
    route: [
      { lat: currentAOI.lat - 0.02, lng: currentAOI.lng - 0.02 },
      { lat: currentAOI.lat - 0.01, lng: currentAOI.lng + 0.01 },
      { lat: currentAOI.lat + 0.01, lng: currentAOI.lng + 0.015 },
      { lat: currentAOI.lat + 0.02, lng: currentAOI.lng - 0.01 }
    ],
    rationale: "Route avoids high-risk checkpoints identified in sector 7. Utilizes covered approach through industrial district. Cell coverage optimal along corridor. Hospital access available at waypoint 2."
  }

  if (loadError) {
    return (
      <div className={cn("relative h-full flex items-center justify-center bg-muted", className)}>
        <Card className="p-6 max-w-md">
          <div className="text-center space-y-3">
            <Globe className="h-8 w-8 mx-auto text-muted-foreground" />
            <h3 className="font-medium">Google Maps Setup Required</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{loadError.message}</p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md text-left">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Setup Instructions:</p>
                <ol className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                  <li>1. Enable the Maps JavaScript API in Google Cloud Console</li>
                  <li>2. Verify your API key has proper permissions</li>
                  <li>3. Restart the application</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("relative h-full", className)}>
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <Card className="p-3 backdrop-blur bg-background/90">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentAOI.name || `${currentAOI.lat.toFixed(4)}, ${currentAOI.lng.toFixed(4)}`}
              </span>
            </div>
            
            {riskScore !== undefined && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: getRiskColor(riskScore),
                    color: getRiskColor(riskScore)
                  }}
                >
                  {getRiskLevel(riskScore)} Risk ({riskScore}/100)
                </Badge>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-3 backdrop-blur bg-background/90">
          <Button
            onClick={handleMovementPlan}
            disabled={isLoading}
            size="sm"
            className="w-full gap-2"
            data-testid="button-movement-plan"
          >
            <Route className="h-4 w-4" />
            {isLoading ? "Computing..." : t('map.route')}
          </Button>
        </Card>
      </div>

      {/* Map Type Selector */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="p-2 backdrop-blur bg-background/90">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              onClick={() => setMapType('satellite')}
              className="text-xs px-2 h-7"
              data-testid="button-satellite-view"
            >
              <Globe className="h-3 w-3 mr-1" />
              Satellite
            </Button>
            <Button
              size="sm"
              variant={mapType === 'hybrid' ? 'default' : 'outline'}
              onClick={() => setMapType('hybrid')}
              className="text-xs px-2 h-7"
              data-testid="button-hybrid-view"
            >
              <Layers className="h-3 w-3 mr-1" />
              Hybrid
            </Button>
            <Button
              size="sm"
              variant={mapType === 'terrain' ? 'default' : 'outline'}
              onClick={() => setMapType('terrain')}
              className="text-xs px-2 h-7"
              data-testid="button-terrain-view"
            >
              Terrain
            </Button>
          </div>
        </Card>
      </div>

      {/* Movement Plan Info */}
      {movementPlan && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Card className="p-3 backdrop-blur bg-background/90 max-w-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span className="text-sm font-medium">{t('map.movement')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {demoMovementPlan.rationale}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-[999]">
          <Card className="p-6">
            <div className="text-center space-y-2">
              <Globe className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
            </div>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-full w-full"
        data-testid="google-map-container"
      />
    </div>
  )
}