import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup } from 'react-leaflet'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"  
import { Badge } from "@/components/ui/badge"
import { Navigation, Route, Target } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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

interface MapPanelProps {
  aoi?: AOI
  riskScore?: number
  movementPlan?: MovementPlan
  onAOIChange?: (aoi: AOI) => void
  onMovementPlanRequest?: () => void
  className?: string
}

export function MapPanel({ 
  aoi, 
  riskScore, 
  movementPlan, 
  onAOIChange, 
  onMovementPlanRequest,
  className 
}: MapPanelProps) {
  const { t } = useTranslation()
  const mapRef = useRef<L.Map | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Default AOI for demo
  const currentAOI = aoi || {
    name: "Kandahar City",
    lat: 31.6089,
    lng: 65.7372,
    radiusKm: 5
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newAOI: AOI = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      radiusKm: currentAOI.radiusKm || 5
    }
    console.log('New AOI selected:', newAOI)
    onAOIChange?.(newAOI)
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

  return (
    <div className={cn("relative h-full", className)}>
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

      <MapContainer
        center={[currentAOI.lat, currentAOI.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[currentAOI.lat, currentAOI.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">{currentAOI.name || "Area of Interest"}</p>
              <p className="text-muted-foreground">
                {currentAOI.lat.toFixed(4)}, {currentAOI.lng.toFixed(4)}
              </p>
              {riskScore !== undefined && (
                <p className="text-xs mt-1">
                  Risk: {getRiskLevel(riskScore)} ({riskScore}/100)
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {currentAOI.radiusKm && (
          <Circle
            center={[currentAOI.lat, currentAOI.lng]}
            radius={currentAOI.radiusKm * 1000}
            pathOptions={{
              color: getRiskColor(riskScore),
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.1
            }}
          />
        )}

        {(movementPlan || demoMovementPlan) && (
          <Polyline
            positions={demoMovementPlan.route.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.8,
              dashArray: '10, 5'
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}