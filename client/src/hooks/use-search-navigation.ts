import { useCallback, useEffect } from "react"
import { useLocation } from "wouter"
import type { SearchResult } from "@shared/schema"

interface MapFocusEvent {
  lat: number
  lng: number
  zoom?: number
  title?: string
}

export function useSearchNavigation() {
  const [, setLocation] = useLocation()

  const handleResultSelect = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'waypoint':
      case 'geotagged':
        // Focus map on location for geographical results
        if (result.location) {
          // Dispatch custom event for map to focus on location
          window.dispatchEvent(new CustomEvent('map-focus', {
            detail: {
              lat: result.location.lat,
              lng: result.location.lng,
              zoom: 15,
              title: result.title
            } as MapFocusEvent
          }))
          // Navigate to map/dashboard page if not already there
          setLocation('/map')
        }
        break

      case 'pmesii':
        // Navigate to PMESII analysis page
        setLocation('/pmesii')
        break

      case 'intelligence':
        // Navigate to intelligence analysis page
        setLocation('/analysis')
        break

      case 'risk':
        // Navigate to risk assessment page
        setLocation('/risk')
        break

      default:
        // Fallback to dashboard
        setLocation('/')
        break
    }
  }, [setLocation])

  return { handleResultSelect }
}

// Hook for map components to listen for focus events
export function useMapFocus(callback: (event: MapFocusEvent) => void) {
  const handleMapFocus = useCallback((event: CustomEvent<MapFocusEvent>) => {
    callback(event.detail)
  }, [callback])

  // Set up event listener
  useEffect(() => {
    window.addEventListener('map-focus', handleMapFocus as EventListener)
    return () => {
      window.removeEventListener('map-focus', handleMapFocus as EventListener)
    }
  }, [handleMapFocus])
}