import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient, apiRequest } from "@/lib/queryClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  AlertTriangle,
  MapPin,
  RefreshCw,
  Calendar,
  Activity
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import type { WeatherData, WeatherAlert } from "@shared/schema"

interface WeatherApiResponse {
  success: boolean
  weather: WeatherData[]
  total: number
}

interface AlertsApiResponse {
  success: boolean
  alerts: WeatherAlert[]
  total: number
}

interface WeatherPanelProps {
  className?: string
  currentLocation?: { lat: number; lng: number; name?: string }
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void
}

// Weather code to icon mapping (WMO Weather interpretation codes)
const getWeatherIcon = (code: string) => {
  const weatherCode = parseInt(code)
  
  if (weatherCode === 0) return <Sun className="h-6 w-6 text-yellow-500" />
  if (weatherCode <= 3) return <Cloud className="h-6 w-6 text-gray-400" />
  if (weatherCode <= 67) return <CloudRain className="h-6 w-6 text-blue-500" />
  if (weatherCode <= 77) return <CloudSnow className="h-6 w-6 text-blue-300" />
  if (weatherCode <= 82) return <CloudRain className="h-6 w-6 text-blue-600" />
  if (weatherCode <= 99) return <CloudRain className="h-6 w-6 text-purple-500" />
  
  return <Cloud className="h-6 w-6 text-gray-400" />
}

const getWeatherDescription = (code: string) => {
  const weatherCode = parseInt(code)
  
  const descriptions: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
  }
  
  return descriptions[weatherCode] || "Unknown conditions"
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'low': return 'bg-green-500'
    case 'medium': return 'bg-yellow-500'
    case 'high': return 'bg-orange-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

export function WeatherPanel({ className, currentLocation, onLocationSelect }: WeatherPanelProps) {
  const { t } = useTranslation()
  const [selectedLocation, setSelectedLocation] = useState({
    lat: currentLocation?.lat || 23.8103,
    lng: currentLocation?.lng || 90.4125,
    name: currentLocation?.name || "Dhaka, Bangladesh"
  })
  const [forecastDays, setForecastDays] = useState<number>(3)

  // Fetch current weather data
  const { data: weatherData, isLoading: isLoadingWeather, refetch: refetchWeather, error: weatherError } = useQuery<WeatherApiResponse>({
    queryKey: ['/api/weather', selectedLocation.lat, selectedLocation.lng],
    queryFn: async () => {
      const response = await fetch(`/api/weather?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}&current_only=false`)
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      return response.json()
    },
    enabled: Boolean(selectedLocation.lat && selectedLocation.lng)
  })

  // Fetch weather alerts
  const { data: alertsData, isLoading: isLoadingAlerts, error: alertsError } = useQuery<AlertsApiResponse>({
    queryKey: ['/api/weather/alerts', selectedLocation.lat, selectedLocation.lng],
    queryFn: async () => {
      const response = await fetch(`/api/weather/alerts?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}&active_only=false`)
      if (!response.ok) {
        throw new Error('Failed to fetch weather alerts')
      }
      return response.json()
    },
    enabled: Boolean(selectedLocation.lat && selectedLocation.lng)
  })

  // Fetch weather from Open-Meteo API
  const fetchWeatherMutation = useMutation({
    mutationFn: async (data: { lat: number; lng: number; location: string; includeForecast: boolean; forecastDays: number }) => {
      const response = await apiRequest('POST', '/api/weather', data)
      return response.json()
    },
    onSuccess: () => {
      // Invalidate both the general weather queries and the specific location queries
      queryClient.invalidateQueries({ queryKey: ['/api/weather'] })
      queryClient.invalidateQueries({ queryKey: ['/api/weather', selectedLocation.lat, selectedLocation.lng] })
      queryClient.invalidateQueries({ queryKey: ['/api/weather/alerts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/weather/alerts', selectedLocation.lat, selectedLocation.lng] })
      queryClient.invalidateQueries({ queryKey: ['/api/timeline'] })
      
      // Force refetch the current queries
      refetchWeather()
    },
    onError: (error) => {
      console.error('Failed to fetch weather data:', error)
    }
  })

  const handleFetchWeather = () => {
    fetchWeatherMutation.mutate({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      location: selectedLocation.name,
      includeForecast: true,
      forecastDays
    })
  }

  const handleLocationChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setSelectedLocation(prev => ({
        ...prev,
        [field]: numValue,
        name: `${field === 'lat' ? numValue : prev.lat}, ${field === 'lng' ? numValue : prev.lng}`
      }))
    }
  }

  const currentWeather = weatherData?.weather?.find((w: WeatherData) => w.isCurrentWeather)
  const forecastWeather = weatherData?.weather?.filter((w: WeatherData) => !w.isCurrentWeather) || []
  const alerts = alertsData?.alerts || []

  return (
    <div className={cn("space-y-6", className)}>
      {/* Location Selection */}
      <Card data-testid="card-weather-location">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('weather.location.title', 'Weather Location')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={selectedLocation.lat}
                onChange={(e) => handleLocationChange('lat', e.target.value)}
                data-testid="input-weather-latitude"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={selectedLocation.lng}
                onChange={(e) => handleLocationChange('lng', e.target.value)}
                data-testid="input-weather-longitude"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Location Name</label>
            <Input
              value={selectedLocation.name}
              onChange={(e) => setSelectedLocation(prev => ({ ...prev, name: e.target.value }))}
              data-testid="input-weather-location-name"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Forecast Days</label>
              <Select value={forecastDays.toString()} onValueChange={(value) => setForecastDays(parseInt(value))}>
                <SelectTrigger data-testid="select-forecast-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleFetchWeather}
              disabled={fetchWeatherMutation.isPending}
              className="mt-6"
              data-testid="button-fetch-weather"
            >
              {fetchWeatherMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {t('weather.fetch', 'Fetch Weather')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Card data-testid="card-weather-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('weather.alerts.title', 'Weather Alerts')}
              <Badge variant="secondary">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert: WeatherAlert) => (
              <Alert key={alert.id} variant="destructive" data-testid={`alert-weather-${alert.id}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {alert.title}
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {alert.description}
                  <div className="text-xs text-muted-foreground mt-2">
                    {alert.location} • {new Date(alert.startTime).toLocaleDateString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weather Data */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" data-testid="tab-current-weather">
            {t('weather.current', 'Current Weather')}
          </TabsTrigger>
          <TabsTrigger value="forecast" data-testid="tab-forecast-weather">
            {t('weather.forecast', 'Forecast')}
          </TabsTrigger>
        </TabsList>

        {/* Current Weather */}
        <TabsContent value="current" className="space-y-4">
          {isLoadingWeather ? (
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">{t('common.loading', 'Loading...')}</span>
              </CardContent>
            </Card>
          ) : currentWeather ? (
            <Card data-testid="card-current-weather">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(currentWeather.weatherCode)}
                    <div>
                      <div className="text-2xl font-bold">{currentWeather.temperature}°C</div>
                      <div className="text-sm text-muted-foreground">
                        {getWeatherDescription(currentWeather.weatherCode)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{currentWeather.location}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentWeather.apparentTemperature && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium">Feels like</div>
                        <div className="text-lg">{currentWeather.apparentTemperature}°C</div>
                      </div>
                    </div>
                  )}
                  {currentWeather.humidity && (
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Humidity</div>
                        <div className="text-lg">{currentWeather.humidity}%</div>
                      </div>
                    </div>
                  )}
                  {currentWeather.windSpeed && (
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Wind Speed</div>
                        <div className="text-lg">{currentWeather.windSpeed} km/h</div>
                      </div>
                    </div>
                  )}
                  {currentWeather.pressure && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Pressure</div>
                        <div className="text-lg">{currentWeather.pressure} hPa</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {currentWeather.cloudCover && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Cloud Cover</span>
                      <span>{currentWeather.cloudCover}%</span>
                    </div>
                    <Progress value={currentWeather.cloudCover} className="h-2" />
                  </div>
                )}
                
                {currentWeather.uvIndex && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>UV Index</span>
                      <span>{currentWeather.uvIndex}</span>
                    </div>
                    <Progress value={(currentWeather.uvIndex / 11) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <div className="text-muted-foreground">
                  {t('weather.noData', 'No current weather data available')}
                </div>
                <Button onClick={handleFetchWeather} className="mt-4" variant="outline">
                  {t('weather.fetchFirst', 'Fetch Weather Data')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forecast */}
        <TabsContent value="forecast" className="space-y-4">
          {isLoadingWeather ? (
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">{t('common.loading', 'Loading...')}</span>
              </CardContent>
            </Card>
          ) : forecastWeather.length > 0 ? (
            <div className="grid gap-4">
              {forecastWeather.map((forecast: WeatherData, index: number) => (
                <Card key={forecast.id} data-testid={`card-forecast-${index}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getWeatherIcon(forecast.weatherCode)}
                        <div>
                          <div className="font-medium">
                            {forecast.forecastTime ? 
                              new Date(forecast.forecastTime).toLocaleDateString() : 
                              `Day ${index + 1}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getWeatherDescription(forecast.weatherCode)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{forecast.temperature}°C</div>
                        {forecast.precipitationProbability && (
                          <div className="text-sm text-blue-500">
                            {forecast.precipitationProbability}% rain
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <div className="text-muted-foreground">
                  {t('weather.noForecast', 'No forecast data available')}
                </div>
                <Button onClick={handleFetchWeather} className="mt-4" variant="outline">
                  {t('weather.fetchForecast', 'Fetch Forecast Data')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}