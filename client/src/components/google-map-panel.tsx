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

// Utility functions for production resilience
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      // Don't retry if request was aborted
      if (error.name === 'AbortError') {
        throw error
      }
      
      // Retry on rate limits, server errors, and network issues
      const shouldRetry = error?.status === 429 || 
                         (error?.status >= 500 && error?.status < 600 && error?.status !== 501) ||
                         (error.name === 'TypeError' && error.message.includes('Failed to fetch'))
      
      if (shouldRetry && attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
        console.log(`Retrying due to ${error?.status || 'network error'} in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await sleep(delay)
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

// Cache for analysis results to avoid repeated API calls
const analysisCache = new Map<string, { result: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const getCacheKey = (lat: number, lng: number, radiusKm: number) => {
  // Round coordinates to reduce cache fragmentation
  const roundedLat = Math.round(lat * 1000) / 1000
  const roundedLng = Math.round(lng * 1000) / 1000
  return `${roundedLat},${roundedLng},${radiusKm}`
}

const getCachedAnalysis = (lat: number, lng: number, radiusKm: number) => {
  const key = getCacheKey(lat, lng, radiusKm)
  const cached = analysisCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result
  }
  return null
}

const setCachedAnalysis = (lat: number, lng: number, radiusKm: number, result: any) => {
  const key = getCacheKey(lat, lng, radiusKm)
  analysisCache.set(key, { result, timestamp: Date.now() })
}

// Security helper function to escape HTML content
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    markerElement.innerHTML = '⌕'
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
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null)
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false)
  const pendingRequestsRef = useRef(new Set<string>())
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastClickTimeRef = useRef(0)
  const CLICK_DEBOUNCE_MS = 500 // Prevent rapid clicking

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

  // Get confidence-based border styling
  const getConfidenceBorder = (confidence?: number) => {
    if (!confidence) return '#ffffff'
    const normalizedConfidence = confidence <= 1 ? confidence * 100 : confidence
    if (normalizedConfidence >= 80) return '#22c55e' // Green for high confidence
    if (normalizedConfidence >= 60) return '#f59e0b' // Yellow for medium confidence
    return '#ef4444' // Red for low confidence
  }

  // Get confidence-based scale
  const getConfidenceScale = (confidence?: number, baseScale: number = 1.0) => {
    if (!confidence) return baseScale
    const normalizedConfidence = confidence <= 1 ? confidence * 100 : confidence
    // Scale between 0.8 and 1.3 based on confidence
    const scaleFactor = 0.8 + (normalizedConfidence / 100) * 0.5
    return baseScale * scaleFactor
  }

  // Get confidence indicator content (using proper icons instead of emojis)
  const getConfidenceContent = (confidence?: number, type: string = 'aoi') => {
    const element = document.createElement('div')
    element.style.fontSize = type === 'aoi' ? '20px' : '16px'
    element.style.fontWeight = 'bold'
    element.style.color = '#ffffff'
    element.style.textAlign = 'center'
    element.style.display = 'flex'
    element.style.alignItems = 'center'
    element.style.justifyContent = 'center'
    element.style.width = '100%'
    element.style.height = '100%'
    
    if (!confidence) {
      element.innerHTML = type === 'aoi' ? '●' : type === 'waypoint' ? '◆' : '■'
      return element
    }
    
    const normalizedConfidence = confidence <= 1 ? confidence * 100 : confidence
    if (normalizedConfidence >= 90) {
      element.innerHTML = type === 'aoi' ? '●' : type === 'waypoint' ? '◆' : '■'
    } else if (normalizedConfidence >= 70) {
      element.innerHTML = '✓'
    } else if (normalizedConfidence >= 50) {
      element.innerHTML = '!'
    } else {
      element.innerHTML = '✗'
    }
    
    return element
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
      case 'cache': return '■'
      case 'target': return '◉'
      case 'safe_house': return '▲'
      case 'waypoint':
      default: return '●'
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
      tilt: 45 // Enable 3D terrain capability
      // Note: styles removed when mapId is present (configured via Google Cloud Console)
    })

    mapInstanceRef.current = map

    // Add click listener for AOI selection and intelligence analysis with resilience
    map.addListener('click', async (e: any) => {
      if (e.latLng) {
        // Debounce rapid clicks
        const now = Date.now()
        if (now - lastClickTimeRef.current < CLICK_DEBOUNCE_MS) {
          console.log('Click debounced - too rapid')
          return
        }
        lastClickTimeRef.current = now
        
        // Cancel any ongoing analysis and start new one
        if (abortControllerRef.current) {
          console.log('Canceling previous analysis for new location')
          abortControllerRef.current.abort()
        }
        const newAOI: AOI = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          radiusKm: currentAOI.radiusKm || 5
        }
        console.log('New AOI selected:', newAOI)
        onAOIChange?.(newAOI)
        
        // Check if we're already analyzing this location
        const requestKey = getCacheKey(newAOI.lat, newAOI.lng, newAOI.radiusKm)
        if (pendingRequestsRef.current.has(requestKey)) {
          console.log('Analysis already in progress for this location, skipping duplicate request')
          return
        }
        
        // Check cache first
        const cachedResult = getCachedAnalysis(newAOI.lat, newAOI.lng, newAOI.radiusKm)
        if (cachedResult) {
          console.log('Using cached analysis result for location:', newAOI)
          setLatestAnalysis(cachedResult)
          window.dispatchEvent(new CustomEvent('guideright:analysis-result', {
            detail: cachedResult
          }))
          return
        }
        
        // Start analysis with resilience features
        try {
          console.log('Triggering intelligence analysis for location:', newAOI)
          pendingRequestsRef.current.add(requestKey)
          setIsAnalysisInProgress(true)
          
          // Dispatch analysis start event
          window.dispatchEvent(new CustomEvent('guideright:analysis-start'))
          
          // Create abort controller for this request
          const controller = new AbortController()
          abortControllerRef.current = controller
          
          const analysisResult = await retryWithBackoff(async () => {
            const response = await fetch('/api/analysis/location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify({
                lat: newAOI.lat,
                lng: newAOI.lng,
                radiusKm: newAOI.radiusKm,
                analysisType: 'general',
                context: `Tactical intelligence analysis for map click at coordinates ${newAOI.lat.toFixed(4)}, ${newAOI.lng.toFixed(4)}`
              })
            })
            
            if (!response.ok) {
              const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
              ;(error as any).status = response.status
              throw error
            }
            
            return await response.json()
          })
          
          console.log('Intelligence analysis result:', analysisResult)
          
          // Cache the result
          setCachedAnalysis(newAOI.lat, newAOI.lng, newAOI.radiusKm, analysisResult)
          
          // Store analysis result for map markers
          setLatestAnalysis(analysisResult)
          
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
        } catch (error: any) {
          console.error('Error during intelligence analysis:', error)
          
          // Try to fallback to any cached result for nearby location
          const fallbackResult = getCachedAnalysis(newAOI.lat, newAOI.lng, newAOI.radiusKm)
          if (fallbackResult) {
            console.log('Using fallback cached result due to error')
            setLatestAnalysis(fallbackResult)
            window.dispatchEvent(new CustomEvent('guideright:analysis-result', {
              detail: fallbackResult
            }))
          } else {
            // Dispatch error event with user-friendly message
            const errorMessage = error.status === 429 
              ? 'Analysis service is currently busy. Please try again in a moment.'
              : `Network error during analysis: ${error.message || 'Unknown error'}`
            
            window.dispatchEvent(new CustomEvent('guideright:analysis-error', {
              detail: { message: errorMessage }
            }))
          }
        } finally {
          pendingRequestsRef.current.delete(requestKey)
          setIsAnalysisInProgress(false)
        }
      }
    })

    // Load marker library for AdvancedMarkerElement
    const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker") as any;
    
    updateMapElements(map, AdvancedMarkerElement, PinElement)
  }, [isLoaded, onAOIChange, currentAOI, mapType])

  // Update map elements when analysis results change
  useEffect(() => {
    if (mapInstanceRef.current && latestAnalysis) {
      // Trigger a re-render of map elements to show updated confidence indicators
      const updateMarkersWithAnalysis = async () => {
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker") as any;
        updateMapElements(mapInstanceRef.current, AdvancedMarkerElement, PinElement)
      }
      updateMarkersWithAnalysis()
    }
  }, [latestAnalysis])

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

    // Create custom pin for AOI marker with confidence indicators
    const currentConfidence = latestAnalysis?.confidence
    const currentRiskScore = latestAnalysis?.riskScore || riskScore
    
    // Create AOI marker with custom content instead of PinElement to avoid emoji
    const aoiMarkerContent = document.createElement('div')
    aoiMarkerContent.style.width = `${24 * getConfidenceScale(currentConfidence, 1.2)}px`
    aoiMarkerContent.style.height = `${24 * getConfidenceScale(currentConfidence, 1.2)}px`
    aoiMarkerContent.style.backgroundColor = getRiskColor(currentRiskScore)
    aoiMarkerContent.style.border = `3px solid ${getConfidenceBorder(currentConfidence)}`
    aoiMarkerContent.style.borderRadius = '50%'
    aoiMarkerContent.style.display = 'flex'
    aoiMarkerContent.style.alignItems = 'center'
    aoiMarkerContent.style.justifyContent = 'center'
    aoiMarkerContent.style.color = '#ffffff'
    aoiMarkerContent.style.fontSize = '12px'
    aoiMarkerContent.style.fontWeight = 'bold'
    aoiMarkerContent.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
    aoiMarkerContent.style.cursor = 'pointer'
    
    // Add confidence indicator
    const confidenceText = currentConfidence ? 
      `${currentConfidence <= 1 ? Math.round(currentConfidence * 100) : Math.round(currentConfidence)}%` : '●'
    aoiMarkerContent.innerHTML = confidenceText

    // Create title with confidence and risk information
    let markerTitle = currentAOI.name || "Area of Interest"
    if (latestAnalysis) {
      const confidenceText = currentConfidence ? 
        `${currentConfidence <= 1 ? Math.round(currentConfidence * 100) : Math.round(currentConfidence)}%` : 'N/A'
      const riskText = latestAnalysis.riskLevel || getRiskLevel(currentRiskScore)
      markerTitle += `\nConfidence: ${confidenceText} | Risk: ${riskText} (${currentRiskScore}/100)`
    }

    // Add advanced marker for AOI
    const marker = new AdvancedMarkerElement({
      position: { lat: currentAOI.lat, lng: currentAOI.lng },
      map: map,
      title: markerTitle,
      content: aoiMarkerContent
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
        scale: 0.9
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

    // Add waypoint markers with risk and confidence indicators
    for (const waypoint of waypoints) {
      // Create custom waypoint marker content with unified risk/confidence styling
      const waypointContent = document.createElement('div')
      waypointContent.style.width = '20px'
      waypointContent.style.height = '20px'
      waypointContent.style.backgroundColor = getRiskColor(currentRiskScore) // Use risk color instead of type color
      waypointContent.style.border = `2px solid ${getConfidenceBorder(currentConfidence)}`
      waypointContent.style.borderRadius = '4px'
      waypointContent.style.display = 'flex'
      waypointContent.style.alignItems = 'center'
      waypointContent.style.justifyContent = 'center'
      waypointContent.style.color = '#ffffff'
      waypointContent.style.fontSize = '10px'
      waypointContent.style.fontWeight = 'bold'
      waypointContent.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'
      waypointContent.style.cursor = 'pointer'
      waypointContent.style.transform = `scale(${getConfidenceScale(currentConfidence, 0.8)})`
      waypointContent.innerHTML = getWaypointIcon(waypoint.type)

      const waypointMarker = new AdvancedMarkerElement({
        position: { lat: waypoint.lat, lng: waypoint.lng },
        map: map,
        title: `${escapeHtml(waypoint.name)} (${escapeHtml(waypoint.type)})${currentConfidence ? ` | Confidence: ${currentConfidence <= 1 ? Math.round(currentConfidence * 100) : Math.round(currentConfidence)}%` : ''}`,
        content: waypointContent
      })

      // Add info window for waypoint
      const waypointInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${escapeHtml(waypoint.name)}</h3>
            <p style="margin: 0 0 4px 0; color: #666; text-transform: capitalize;">
              ${escapeHtml(waypoint.type.replace('_', ' '))}
            </p>
            <p style="margin: 0 0 4px 0; color: #666; font-family: monospace;">
              ${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}
            </p>
            ${waypoint.description ? `
              <p style="margin: 4px 0 0 0; font-size: 12px;">
                ${escapeHtml(waypoint.description || '')}
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
      // Create custom file marker with unified risk/confidence styling
      const fileContent = document.createElement('div')
      fileContent.style.width = '18px'
      fileContent.style.height = '18px'
      fileContent.style.backgroundColor = getRiskColor(currentRiskScore) // Use risk color
      fileContent.style.border = `2px solid ${getConfidenceBorder(currentConfidence)}`
      fileContent.style.borderRadius = '3px'
      fileContent.style.display = 'flex'
      fileContent.style.alignItems = 'center'
      fileContent.style.justifyContent = 'center'
      fileContent.style.color = '#ffffff'
      fileContent.style.fontSize = '9px'
      fileContent.style.fontWeight = 'bold'
      fileContent.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'
      fileContent.style.cursor = 'pointer'
      fileContent.style.transform = `scale(${getConfidenceScale(currentConfidence, 0.7)})`
      fileContent.innerHTML = '□'

      const fileMarker = new AdvancedMarkerElement({
        position: { lat: file.lat, lng: file.lng },
        map: map,
        title: `Photo: ${escapeHtml(file.filename)}${currentConfidence ? ` | Confidence: ${currentConfidence <= 1 ? Math.round(currentConfidence * 100) : Math.round(currentConfidence)}%` : ''}${currentRiskScore ? ` | Risk: ${getRiskLevel(currentRiskScore)}` : ''}`,
        content: fileContent
      })

      // Add info window for geotagged file
      const fileInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              ${escapeHtml(file.filename)}
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
              Source: ${escapeHtml(file.source || 'Unknown').toUpperCase()}
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
          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${escapeHtml(currentAOI.name || "Area of Interest")}</h3>
          <p style="margin: 0 0 4px 0; color: #666; font-family: monospace;">
            ${currentAOI.lat.toFixed(4)}, ${currentAOI.lng.toFixed(4)}
          </p>
          ${currentRiskScore !== undefined ? `
            <p style="margin: 4px 0 0 0; font-size: 12px;">
              Risk: ${getRiskLevel(currentRiskScore)} (${currentRiskScore}/100)
            </p>
          ` : ''}
          ${currentConfidence !== undefined ? `
            <p style="margin: 4px 0 0 0; font-size: 12px;">
              Confidence: ${currentConfidence <= 1 ? Math.round(currentConfidence * 100) : Math.round(currentConfidence)}%
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
        strokeColor: getRiskColor(currentRiskScore),
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: getRiskColor(currentRiskScore),
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
  }, [currentAOI, riskScore, movementPlan, showUserLocation, userPosition, waypoints, geotaggedFiles, latestAnalysis])

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