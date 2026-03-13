/**
 * Risk Zone Layer — Google Maps native circles + AdvancedMarker labels
 * Renders vivid threat zone overlays for the risk-stress lens
 */

import { useEffect, useRef, useState } from "react"
import { useMap, AdvancedMarker } from "@vis.gl/react-google-maps"
import { cn } from "@/lib/utils"

declare const google: any

export type RiskLevel = "low" | "moderate" | "elevated" | "high"

interface RiskZone {
  id: string
  name: string
  lat: number
  lng: number
  radiusM: number
  riskLevel: RiskLevel
  factors: string[]
  confidence: number
  lastAssessed: string
}

const DHAKA_LAT = 23.8103
const DHAKA_LNG = 90.4125

const RISK_ZONES: RiskZone[] = [
  {
    id: "rz-1",
    name: "Sadarghat Port Zone",
    lat: DHAKA_LAT - 0.022,
    lng: DHAKA_LNG - 0.003,
    radiusM: 1100,
    riskLevel: "high",
    factors: ["Port vulnerability", "Transient pop.", "Cargo security"],
    confidence: 84,
    lastAssessed: "2h ago"
  },
  {
    id: "rz-2",
    name: "Old Dhaka District",
    lat: DHAKA_LAT - 0.018,
    lng: DHAKA_LNG - 0.007,
    radiusM: 2200,
    riskLevel: "elevated",
    factors: ["Dense pop.", "Narrow egress", "Historical incidents"],
    confidence: 79,
    lastAssessed: "Today"
  },
  {
    id: "rz-3",
    name: "University District",
    lat: DHAKA_LAT + 0.005,
    lng: DHAKA_LNG - 0.018,
    radiusM: 1500,
    riskLevel: "elevated",
    factors: ["Protest activity", "Large gatherings"],
    confidence: 72,
    lastAssessed: "Today"
  },
  {
    id: "rz-4",
    name: "Tejgaon Industrial",
    lat: DHAKA_LAT + 0.035,
    lng: DHAKA_LNG - 0.050,
    radiusM: 1800,
    riskLevel: "moderate",
    factors: ["Industrial hazards", "Limited emergency access"],
    confidence: 88,
    lastAssessed: "Yesterday"
  },
  {
    id: "rz-5",
    name: "Motijheel Commercial",
    lat: DHAKA_LAT,
    lng: DHAKA_LNG + 0.008,
    radiusM: 1200,
    riskLevel: "moderate",
    factors: ["High foot traffic", "Crowd dynamics"],
    confidence: 68,
    lastAssessed: "3h ago"
  },
  {
    id: "rz-6",
    name: "Gulshan Diplomatic",
    lat: DHAKA_LAT + 0.065,
    lng: DHAKA_LNG + 0.015,
    radiusM: 1400,
    riskLevel: "low",
    factors: ["Enhanced security", "Controlled access"],
    confidence: 95,
    lastAssessed: "Today"
  }
]

const RISK_STYLES: Record<RiskLevel, {
  fill: string
  fillOpacity: number
  stroke: string
  strokeOpacity: number
  strokeWeight: number
  labelBg: string
  labelText: string
  badgeBg: string
  badgeText: string
  glowColor: string
}> = {
  high: {
    fill: "#7f1d1d",
    fillOpacity: 0.52,
    stroke: "#ef4444",
    strokeOpacity: 0.90,
    strokeWeight: 2.5,
    labelBg: "rgba(0,0,0,0.90)",
    labelText: "#fca5a5",
    badgeBg: "#ef4444",
    badgeText: "#fff",
    glowColor: "rgba(239,68,68,0.6)"
  },
  elevated: {
    fill: "#7c2d12",
    fillOpacity: 0.42,
    stroke: "#f97316",
    strokeOpacity: 0.80,
    strokeWeight: 2,
    labelBg: "rgba(0,0,0,0.88)",
    labelText: "#fdba74",
    badgeBg: "#f97316",
    badgeText: "#fff",
    glowColor: "rgba(249,115,22,0.5)"
  },
  moderate: {
    fill: "#713f12",
    fillOpacity: 0.34,
    stroke: "#f59e0b",
    strokeOpacity: 0.70,
    strokeWeight: 1.5,
    labelBg: "rgba(0,0,0,0.85)",
    labelText: "#fde68a",
    badgeBg: "#f59e0b",
    badgeText: "#1c1917",
    glowColor: "rgba(245,158,11,0.4)"
  },
  low: {
    fill: "#14532d",
    fillOpacity: 0.26,
    stroke: "#22c55e",
    strokeOpacity: 0.60,
    strokeWeight: 1.5,
    labelBg: "rgba(0,0,0,0.82)",
    labelText: "#86efac",
    badgeBg: "#22c55e",
    badgeText: "#052e16",
    glowColor: "rgba(34,197,94,0.35)"
  }
}

const RISK_LABEL: Record<RiskLevel, string> = {
  high:     "HIGH RISK",
  elevated: "ELEVATED",
  moderate: "MODERATE",
  low:      "LOW"
}

interface RiskZoneLabelProps {
  zone: RiskZone
}

function RiskZoneLabel({ zone }: RiskZoneLabelProps) {
  const [expanded, setExpanded] = useState(false)
  const style = RISK_STYLES[zone.riskLevel]
  const isHighAlert = zone.riskLevel === "high" || zone.riskLevel === "elevated"

  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {/* Main badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: style.labelBg,
        border: `1px solid ${style.stroke}`,
        borderRadius: 5,
        padding: "4px 8px",
        boxShadow: `0 0 10px ${style.glowColor}, 0 2px 4px rgba(0,0,0,0.5)`,
        minWidth: 120
      }}>
        {/* Pulse dot for high/elevated */}
        {isHighAlert && (
          <span style={{
            display: "inline-block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: style.stroke,
            boxShadow: `0 0 6px ${style.stroke}`,
            flexShrink: 0,
            animation: "risk-pulse 1.4s ease-in-out infinite"
          }} />
        )}

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: style.labelText,
            fontFamily: "monospace",
            letterSpacing: "0.04em"
          }}>
            {zone.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              background: style.badgeBg,
              color: style.badgeText,
              padding: "1px 5px",
              borderRadius: 3,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const
            }}>
              {RISK_LABEL[zone.riskLevel]}
            </span>
            <span style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "monospace"
            }}>
              {zone.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Expanded detail card */}
      {expanded && (
        <div style={{
          marginTop: 4,
          background: "rgba(0,0,0,0.92)",
          border: `1px solid ${style.stroke}`,
          borderRadius: 5,
          padding: "6px 8px",
          minWidth: 160,
          boxShadow: `0 4px 12px rgba(0,0,0,0.6)`
        }}>
          <div style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            marginBottom: 4,
            fontFamily: "monospace"
          }}>
            Risk Factors
          </div>
          {zone.factors.map((f, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 5,
              marginBottom: 3
            }}>
              <span style={{
                color: style.stroke,
                fontSize: 9,
                lineHeight: "14px",
                flexShrink: 0
              }}>▸</span>
              <span style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.75)",
                lineHeight: "14px"
              }}>{f}</span>
            </div>
          ))}
          <div style={{
            marginTop: 5,
            paddingTop: 4,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: 9,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "monospace"
          }}>
            Assessed: {zone.lastAssessed}
          </div>
        </div>
      )}
    </div>
  )
}

interface RiskZoneLayerProps {
  visible: boolean
}

export function RiskZoneLayer({ visible }: RiskZoneLayerProps) {
  const map = useMap()
  const circlesRef = useRef<any[]>([])

  // Inject pulse keyframe animation once
  useEffect(() => {
    const id = "risk-pulse-style"
    if (!document.getElementById(id)) {
      const style = document.createElement("style")
      style.id = id
      style.textContent = `
        @keyframes risk-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  // Draw / remove Google Maps Circles
  useEffect(() => {
    const cleanup = () => {
      circlesRef.current.forEach(c => c.setMap(null))
      circlesRef.current = []
    }

    if (!map || !visible) {
      cleanup()
      return
    }

    cleanup()

    RISK_ZONES.forEach(zone => {
      const style = RISK_STYLES[zone.riskLevel]

      const circle = new google.maps.Circle({
        map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: zone.radiusM,
        strokeColor: style.stroke,
        strokeOpacity: style.strokeOpacity,
        strokeWeight: style.strokeWeight,
        fillColor: style.fill,
        fillOpacity: style.fillOpacity,
        clickable: false,
        zIndex: zone.riskLevel === "high" ? 4 : zone.riskLevel === "elevated" ? 3 : zone.riskLevel === "moderate" ? 2 : 1
      })

      circlesRef.current.push(circle)
    })

    return cleanup
  }, [map, visible])

  if (!visible) return null

  return (
    <>
      {RISK_ZONES.map(zone => (
        <AdvancedMarker
          key={zone.id}
          position={{ lat: zone.lat, lng: zone.lng }}
          zIndex={zone.riskLevel === "high" ? 40 : zone.riskLevel === "elevated" ? 30 : 20}
        >
          <RiskZoneLabel zone={zone} />
        </AdvancedMarker>
      ))}
    </>
  )
}
