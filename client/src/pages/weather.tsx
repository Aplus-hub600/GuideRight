import { WeatherPanel } from "@/components/weather-panel"
import { useTranslation } from "react-i18next"

export default function Weather() {
  const { t } = useTranslation()
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('weather.title', 'Weather Intelligence')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('weather.description', 'Real-time weather data and forecasting for tactical operations')}
        </p>
      </div>
      
      <WeatherPanel data-testid="weather-panel-main" />
    </div>
  )
}