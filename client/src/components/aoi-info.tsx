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
    <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-full px-4 py-3 text-slate-100 text-sm shadow-2xl border border-slate-700/50 flex items-center gap-3" data-testid="aoi-info-display">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-400" />
        <span className="font-medium">{aoi.name || "Unknown Location"}</span>
      </div>
      
      <div className="h-4 w-px bg-gradient-to-b from-transparent via-slate-500/50 to-transparent" />
      
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-slate-400" />
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          riskScore < 30 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          riskScore < 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          riskScore < 80 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {riskLevel}
        </span>
      </div>
    </div>
  )
}
