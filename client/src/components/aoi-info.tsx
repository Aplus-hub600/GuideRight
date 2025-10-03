import { Shield, Target } from "lucide-react"

interface AOI {
  name?: string
  lat: number
  lng: number
  radiusKm?: number
}

interface AoiInfoProps {
  aoi: AOI
  riskScore?: number
  confidence?: { belief: number; disbelief: number; uncertainty: number }
}

export function AoiInfo({ aoi, riskScore = 67, confidence = { belief: 0.78, disbelief: 0.12, uncertainty: 0.10 } }: AoiInfoProps) {
  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Low'
    if (score < 60) return 'Moderate'
    if (score < 80) return 'High'
    return 'Critical'
  }

  const riskLevel = getRiskLevel(riskScore)

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-full px-4 py-3 text-gray-800 text-sm shadow-lg flex items-center gap-3" data-testid="aoi-info-display">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-600" />
        <span className="font-medium">{aoi.name || "Unknown Location"}</span>
      </div>
      
      <div className="h-4 w-px bg-gray-300" />
      
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-gray-600" />
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          riskScore < 30 ? 'bg-green-100 text-green-800' :
          riskScore < 60 ? 'bg-yellow-100 text-yellow-800' :
          riskScore < 80 ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {riskLevel}
        </span>
      </div>
    </div>
  )
}
