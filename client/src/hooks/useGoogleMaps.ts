import { useEffect, useState } from 'react'

declare global {
  interface Window {
    google: typeof google
    initGoogleMaps?: () => void
  }
}

interface UseGoogleMapsOptions {
  apiKey?: string
  libraries?: string[]
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Get API key from server
        const response = await fetch('/api/config/maps')
        const config = await response.json()
        
        if (!config.success || !config.apiKey) {
          throw new Error(config.error || 'Google Maps API key not available')
        }
        
        const apiKey = config.apiKey

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          setIsLoaded(true)
          return
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          // Wait for existing script to load
          existingScript.addEventListener('load', () => setIsLoaded(true))
          existingScript.addEventListener('error', () => setLoadError(new Error('Failed to load Google Maps')))
          return
        }

        // Load Google Maps script
        const script = document.createElement('script')
        const libraries = options.libraries || ['geometry', 'places']
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
        script.async = true
        script.defer = true

        script.onload = () => {
          setIsLoaded(true)
        }

        script.onerror = () => {
          setLoadError(new Error('Failed to load Google Maps API'))
        }

        document.head.appendChild(script)
        
      } catch (error) {
        setLoadError(error as Error)
      }
    }
    
    loadGoogleMaps()

    return () => {
      // Cleanup is complex for Google Maps, usually not needed in practice
    }
  }, [options.apiKey, options.libraries])

  return { isLoaded, loadError }
}