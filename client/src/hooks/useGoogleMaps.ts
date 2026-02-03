import { useEffect, useState } from 'react'

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

interface UseGoogleMapsOptions {
  apiKey?: string
  libraries?: string[]
  language?: string
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
        const language = options.language || 'en'
        const libraries = options.libraries || ['geometry', 'places', 'visualization']

        // Check if Google Maps script exists with required settings
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        const currentScriptSrc = existingScript?.getAttribute('src')
        const hasLanguage = currentScriptSrc?.includes(`language=${language}`)
        const hasRegion = currentScriptSrc?.includes(`region=US`)
        const hasVisualization = currentScriptSrc?.includes('visualization')
        const hasCorrectSettings = hasLanguage && hasRegion && hasVisualization

        console.log('Google Maps script check:', {
          scriptUrl: currentScriptSrc?.replace(/key=[^&]+/, 'key=***'),
          hasLanguage,
          hasRegion,
          hasVisualization,
          hasCorrectSettings,
          googleLoaded: !!window.google?.maps,
          visualizationAvailable: !!window.google?.maps?.visualization
        })

        // If script exists with correct settings and Maps+visualization is loaded, we're good
        if (window.google && window.google.maps && window.google.maps.visualization && hasCorrectSettings) {
          console.log('Google Maps already loaded with correct settings including visualization')
          setIsLoaded(true)
          return
        }

        // If script exists but doesn't have correct settings (including visualization), force page reload
        if (existingScript && !hasCorrectSettings) {
          console.log('Google Maps script missing required libraries (visualization), forcing reload...')
          // Remove old script
          existingScript.remove()
          // Delete google object to force fresh load
          delete (window as any).google
          // Force page reload to load Maps with correct settings
          window.location.reload()
          return
        }

        // Load Google Maps script with language support and region set to US for English-only labels
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&language=${language}&region=US`
        script.async = true
        script.defer = true

        console.log('Loading Google Maps with URL:', script.src.replace(/key=[^&]+/, 'key=***'))

        script.onload = () => {
          console.log('Google Maps loaded successfully with language:', language, 'region: US')
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
  }, [options.apiKey, options.libraries, options.language])

  return { isLoaded, loadError }
}