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
        const libraries = options.libraries || ['geometry', 'places']

        // Check if Google Maps script exists with current language and region
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        const currentScriptSrc = existingScript?.getAttribute('src')
        const hasCorrectLanguage = currentScriptSrc?.includes(`language=${language}`) && currentScriptSrc?.includes(`region=US`)

        // If script exists with correct language and Maps is loaded, we're good
        if (window.google && window.google.maps && hasCorrectLanguage) {
          setIsLoaded(true)
          return
        }

        // If language changed, we need to reload the page to load Maps with new language
        // Google Maps doesn't support dynamic language changes after loading
        if (existingScript && !hasCorrectLanguage && window.google && window.google.maps) {
          // Force page reload to load Maps with new language
          console.log(`Reloading page to load Google Maps in ${language}`)
          window.location.reload()
          return
        }

        // Check if script is already being loaded with correct language
        if (existingScript && hasCorrectLanguage) {
          // Wait for existing script to load
          existingScript.addEventListener('load', () => setIsLoaded(true))
          existingScript.addEventListener('error', () => setLoadError(new Error('Failed to load Google Maps')))
          return
        }

        // Remove old script if it exists with wrong language
        if (existingScript && !hasCorrectLanguage) {
          existingScript.remove()
        }

        // Load Google Maps script with language support and region set to US for English-only labels
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&language=${language}&region=US`
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
  }, [options.apiKey, options.libraries, options.language])

  return { isLoaded, loadError }
}