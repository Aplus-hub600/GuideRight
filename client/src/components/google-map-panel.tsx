import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, Route, Target, Layers, Globe, MapPin, Crosshair, Camera, FileImage } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useGoogleMaps } from "@/hooks/useGoogleMaps"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useMapFocus } from "@/hooks/use-search-navigation"

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
  const { position: userPosition, loading: locationLoading, getCurrentPosition } = useGeolocation({ enableHighAccuracy: true })
  
  // Handle map focus events from global search
  useMapFocus(({ lat, lng, zoom = 15, title }) => {
    if (!isLoaded || !mapInstanceRef.current) return
    
    // Center map on the location
    mapInstanceRef.current.setCenter({ lat, lng })
    mapInstanceRef.current.setZoom(zoom)
    
    // Clear existing search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.map = null
    }
    
    // Create marker element for search result
    const markerElement = document.createElement('div')
    markerElement.innerHTML = '🔍'
    markerElement.style.fontSize = '24px'
    markerElement.style.cursor = 'pointer'
    markerElement.title = title || 'Search result'
    
    // Create and position search marker
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      searchMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat, lng },
        content: markerElement,
        title: title || 'Search result',
      })
    }
  })
  
  // Fetch waypoints and geotagged files
  const { data: waypointsData } = useQuery({
    queryKey: ['/api/waypoints'],
    enabled: isLoaded
  })
  
  const { data: geotaggedData } = useQuery({
    queryKey: ['/api/geotagged'],
    enabled: isLoaded
  })
  
  const waypoints = (waypointsData as any)?.waypoints || []
  const geotaggedFiles = (geotaggedData as any)?.files || []
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const circleRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const waypointMarkersRef = useRef<any[]>([])
  const geotaggedMarkersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const searchMarkerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('satellite')
  const [showUserLocation, setShowUserLocation] = useState(false)

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

  const getWaypointColor = (type: string) => {
    switch (type) {
      case 'cache': return '#10b981' // green
      case 'target': return '#ef4444' // red
      case 'safe_house': return '#3b82f6' // blue
      case 'waypoint':
      default: return '#f59e0b' // orange
    }
  }

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'cache': return '📦'
      case 'target': return '🎯'
      case 'safe_house': return '🏠'
      case 'waypoint':
      default: return '📍'
    }
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

    // Add click listener for AOI selection and intelligence analysis
    map.addListener('click', async (e: any) => {
      if (e.latLng) {
        const newAOI: AOI = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          radiusKm: currentAOI.radiusKm || 5
        }
        console.log('New AOI selected:', newAOI)
        onAOIChange?.(newAOI)
        
        // Trigger intelligence analysis for the clicked location
        try {
          console.log('Triggering intelligence analysis for location:', newAOI)
          
          // Dispatch analysis start event
          window.dispatchEvent(new CustomEvent('guideright:analysis-start'))
          
          const response = await fetch('/api/analysis/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lat: newAOI.lat,
              lng: newAOI.lng,
              radiusKm: newAOI.radiusKm,
              analysisType: 'general',
              context: `Tactical intelligence analysis for map click at coordinates ${newAOI.lat.toFixed(4)}, ${newAOI.lng.toFixed(4)}`
            })
          })
          
          if (response.ok) {
            const analysisResult = await response.json()
            console.log('Intelligence analysis result:', analysisResult)
            
            // Dispatch analysis result event for the analysis panel to pick up
            window.dispatchEvent(new CustomEvent('guideright:analysis-result', {
              detail: analysisResult
            }))
            
            console.log('Analysis complete:', {
              confidence: analysisResult.confidence,
              riskLevel: analysisResult.riskLevel,
              riskScore: analysisResult.riskScore,
              location: analysisResult.location
            })
          } else {
            console.error('Failed to get intelligence analysis:', response.statusText)
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('guideright:analysis-error', {
              detail: { message: `Failed to analyze location: ${response.statusText}` }
            }))
          }
        } catch (error) {
          console.error('Error during intelligence analysis:', error)
          // Dispatch error event
          window.dispatchEvent(new CustomEvent('guideright:analysis-error', {
            detail: { message: `Network error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}` }
          }))
        }
      }
    })

    // Load marker library for AdvancedMarkerElement
    const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker") as any;
    
    updateMapElements(map, AdvancedMarkerElement, PinElement)
  }, [isLoaded, onAOIChange])

  const updateMapElements = useCallback(async (map: any, AdvancedMarkerElement?: any, PinElement?: any) => {
    // Import marker library if not provided
    if (!AdvancedMarkerElement || !PinElement) {
      const { AdvancedMarkerElement: AME, PinElement: PE } = await window.google.maps.importLibrary("marker") as any;
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

    // Update user location marker if available
    if (showUserLocation && userPosition) {
      // Clear existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null
      }

      // Create user location pin
      const userPin = new PinElement({
        background: '#3b82f6',
        borderColor: '#ffffff',
        scale: 0.9,
        glyph: '📍'
      })

      // Add user location marker
      const userMarker = new AdvancedMarkerElement({
        position: { lat: userPosition.lat, lng: userPosition.lng },
        map: map,
        title: `Your Location (±${userPosition.accuracy?.toFixed(0)}m)`,
        content: userPin.element
      })

      userMarkerRef.current = userMarker
    }

    // Clear existing waypoint and geotagged markers
    waypointMarkersRef.current.forEach(marker => {
      marker.map = null
    })
    geotaggedMarkersRef.current.forEach(marker => {
      marker.map = null
    })
    waypointMarkersRef.current = []
    geotaggedMarkersRef.current = []

    // Add waypoint markers
    for (const waypoint of waypoints) {
      const waypointPin = new PinElement({
        background: getWaypointColor(waypoint.type),
        borderColor: '#ffffff',
        scale: 0.8,
        glyph: getWaypointIcon(waypoint.type)
      })

      const waypointMarker = new AdvancedMarkerElement({
        position: { lat: waypoint.lat, lng: waypoint.lng },
        map: map,
        title: `${waypoint.name} (${waypoint.type})`,
        content: waypointPin.element
      })

      // Add info window for waypoint
      const waypointInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${waypoint.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; text-transform: capitalize;">
              ${waypoint.type.replace('_', ' ')}
            </p>
            <p style="margin: 0 0 4px 0; color: #666; font-family: monospace;">
              ${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}
            </p>
            ${waypoint.description ? `
              <p style="margin: 4px 0 0 0; font-size: 12px;">
                ${waypoint.description}
              </p>
            ` : ''}
          </div>
        `
      })

      waypointMarker.addListener('click', () => {
        waypointInfoWindow.open({ map, anchor: waypointMarker })
      })

      waypointMarkersRef.current.push(waypointMarker)
    }

    // Add geotagged file markers
    for (const file of geotaggedFiles) {
      const filePin = new PinElement({
        background: '#8b5cf6',
        borderColor: '#ffffff',
        scale: 0.7,
        glyph: '📷'
      })

      const fileMarker = new AdvancedMarkerElement({
        position: { lat: file.lat, lng: file.lng },
        map: map,
        title: `Photo: ${file.filename}`,
        content: filePin.element
      })

      // Add info window for geotagged file
      const fileInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              📷 ${file.filename}
            </h3>
            <p style="margin: 0 0 4px 0; color: #666; font-family: monospace;">
              ${file.lat.toFixed(4)}, ${file.lng.toFixed(4)}
            </p>
            ${file.altitude ? `
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                Altitude: ${file.altitude.toFixed(0)}m
              </p>
            ` : ''}
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
              Source: ${file.source.toUpperCase()}
            </p>
          </div>
        `
      })

      fileMarker.addListener('click', () => {
        fileInfoWindow.open({ map, anchor: fileMarker })
      })

      geotaggedMarkersRef.current.push(fileMarker)
    }

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
  }, [currentAOI, riskScore, movementPlan, showUserLocation, userPosition, waypoints, geotaggedFiles])

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
  }, [currentAOI, riskScore, movementPlan, showUserLocation, userPosition, waypoints, geotaggedFiles, updateMapElements])

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
          <div className="space-y-2">
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
            
            <Button
              onClick={() => {
                if (!showUserLocation && userPosition) {
                  setShowUserLocation(true)
                  mapInstanceRef.current?.panTo({ lat: userPosition.lat, lng: userPosition.lng })
                } else if (!userPosition) {
                  getCurrentPosition()
                  setShowUserLocation(true)
                } else {
                  setShowUserLocation(!showUserLocation)
                }
              }}
              disabled={locationLoading}
              variant={showUserLocation ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-2"
              data-testid="button-user-location"
            >
              <Crosshair className="h-4 w-4" />
              {locationLoading ? 'Locating...' : 
               showUserLocation ? 'Hide Location' : 'My Location'}
            </Button>
          </div>
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