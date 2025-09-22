import { useState, useEffect, useCallback } from 'react'

interface PositionData {
  lat: number
  lng: number
  accuracy?: number
  altitude?: number
  heading?: number
  speed?: number
}

interface GeolocationError {
  code: number
  message: string
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

interface UseGeolocationReturn {
  position: PositionData | null
  error: GeolocationError | null
  loading: boolean
  isSupported: boolean
  getCurrentPosition: () => void
  watchPosition: () => void
  clearWatch: () => void
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    watch = false
  } = options

  const [position, setPosition] = useState<PositionData | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [loading, setLoading] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  const isSupported = 'geolocation' in navigator

  const geolocationOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge
  }

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const newPosition: PositionData = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude || undefined,
      heading: pos.coords.heading || undefined,
      speed: pos.coords.speed || undefined
    }
    
    setPosition(newPosition)
    setError(null)
    setLoading(false)
  }, [])

  const handleError = useCallback((err: GeolocationPositionError) => {
    const errorMessages: Record<number, string> = {
      1: "Location access denied by user",
      2: "Location information unavailable", 
      3: "Location request timeout"
    }

    const newError: GeolocationError = {
      code: err.code,
      message: errorMessages[err.code] || "Unknown geolocation error"
    }
    
    setError(newError)
    setPosition(null)
    setLoading(false)
  }, [])

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser"
      })
      return
    }

    setLoading(true)
    setError(null)
    
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    )
  }, [isSupported, handleSuccess, handleError, geolocationOptions])

  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser"
      })
      return
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }

    setLoading(true)
    setError(null)
    
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    )
    
    setWatchId(id)
  }, [isSupported, watchId, handleSuccess, handleError, geolocationOptions])

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setLoading(false)
    }
  }, [watchId])

  // Auto-start geolocation based on options
  useEffect(() => {
    if (watch) {
      watchPosition()
    } else {
      getCurrentPosition()
    }

    return () => {
      clearWatch()
    }
  }, [watch]) // Only depend on watch to avoid infinite loops

  return {
    position,
    error,
    loading,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearWatch
  }
}