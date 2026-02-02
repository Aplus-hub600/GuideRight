/**
 * Threat Intelligence Panel
 * Displays Google Threat Intelligence / Mandiant data
 */

import { useQuery } from "@tanstack/react-query"
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Target, 
  RefreshCw,
  ChevronRight,
  Eye,
  Globe,
  Skull,
  Lock,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface ThreatActor {
  id: string
  name: string
  aliases: string[]
  origin: string
  targetSectors: string[]
  motivation: 'financial' | 'espionage' | 'hacktivism' | 'destructive'
  sophistication: 'low' | 'medium' | 'high' | 'advanced'
  lastActivity: string
  ttps: string[]
}

interface ThreatIndicator {
  id: string
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email'
  value: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  source: string
  firstSeen: string
  lastSeen: string
  tags: string[]
}

interface VulnerabilityInfo {
  cveId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cvssScore: number
  exploitationState: 'unknown' | 'poc' | 'active' | 'widespread'
  affectedProducts: string[]
  description: string
  mandiantRisk: number
}

interface RegionalThreatAssessment {
  region: string
  country: string
  overallRiskLevel: 'low' | 'moderate' | 'elevated' | 'high' | 'severe'
  riskScore: number
  activeThreats: number
  recentIncidents: number
  topThreatActors: ThreatActor[]
  activeVulnerabilities: VulnerabilityInfo[]
  indicators: ThreatIndicator[]
  analysis: string
  recommendations: string[]
  lastUpdated: string
}

interface ThreatIntelPanelProps {
  country: string
  region?: string
  compact?: boolean
}

const RISK_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  elevated: '#f97316',
  high: '#ef4444',
  severe: '#dc2626'
}

const SEVERITY_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444'
}

function RiskGauge({ score, level }: { score: number; level: string }) {
  const color = RISK_COLORS[level as keyof typeof RISK_COLORS] || '#6b7280'
  
  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
        />
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${score * 2.51} 251.2`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color }}>{score}</div>
        <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase' }}>{level}</div>
      </div>
    </div>
  )
}

function ThreatActorCard({ actor }: { actor: ThreatActor }) {
  const [expanded, setExpanded] = useState(false)
  
  const motivationColors = {
    espionage: '#8b5cf6',
    financial: '#22c55e',
    hacktivism: '#3b82f6',
    destructive: '#ef4444'
  }
  
  const sophisticationLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    advanced: 'APT'
  }
  
  return (
    <div 
      style={{
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer'
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Skull style={{ width: 16, height: 16, color: '#ef4444' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{actor.name}</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{actor.aliases.join(', ')}</div>
        </div>
        <Badge 
          variant="outline" 
          style={{ 
            fontSize: 9, 
            backgroundColor: motivationColors[actor.motivation],
            color: '#fff',
            border: 'none'
          }}
        >
          {actor.motivation}
        </Badge>
        <ChevronRight 
          style={{ 
            width: 14, 
            height: 14, 
            color: '#6b7280',
            transform: expanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s'
          }} 
        />
      </div>
      
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, marginBottom: 6 }}>
            <div><strong>Origin:</strong> {actor.origin}</div>
            <div><strong>Level:</strong> {sophisticationLabels[actor.sophistication]}</div>
          </div>
          <div style={{ fontSize: 11, marginBottom: 6 }}>
            <strong>Targets:</strong> {actor.targetSectors.join(', ')}
          </div>
          <div style={{ fontSize: 11 }}>
            <strong>TTPs:</strong> {actor.ttps.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

function VulnerabilityCard({ vuln }: { vuln: VulnerabilityInfo }) {
  const color = SEVERITY_COLORS[vuln.severity]
  
  const stateLabels = {
    unknown: 'Unknown',
    poc: 'PoC Available',
    active: 'Actively Exploited',
    widespread: 'Widespread'
  }
  
  return (
    <div 
      style={{
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Lock style={{ width: 14, height: 14, color }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{vuln.cveId}</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            {vuln.affectedProducts.join(', ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color 
          }}>
            {vuln.cvssScore}
          </div>
          <div style={{ fontSize: 9, color: '#9ca3af' }}>CVSS</div>
        </div>
      </div>
      <div style={{ 
        marginTop: 6, 
        fontSize: 10, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#9ca3af' }}>{vuln.description.slice(0, 60)}...</span>
        <Badge 
          variant="outline" 
          style={{ 
            fontSize: 8,
            backgroundColor: vuln.exploitationState === 'active' || vuln.exploitationState === 'widespread' 
              ? 'rgba(239,68,68,0.2)' 
              : 'rgba(255,255,255,0.05)',
            color: vuln.exploitationState === 'active' || vuln.exploitationState === 'widespread'
              ? '#ef4444'
              : '#9ca3af'
          }}
        >
          {stateLabels[vuln.exploitationState]}
        </Badge>
      </div>
    </div>
  )
}

export function ThreatIntelPanel({ country, region, compact = false }: ThreatIntelPanelProps) {
  const { data, isLoading, refetch } = useQuery<RegionalThreatAssessment>({
    queryKey: ['/api/intel/threat/assessment', country, region],
    queryFn: async () => {
      const response = await fetch('/api/intel/threat/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, region })
      })
      if (!response.ok) throw new Error('Failed to fetch threat assessment')
      const json = await response.json()
      if (!json.success) throw new Error(json.error || 'API error')
      return json
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
  
  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af' }}>
        <RefreshCw className="animate-spin" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
        <div>Loading threat intelligence...</div>
      </div>
    )
  }
  
  if (!data) return null
  
  if (compact) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RiskGauge score={data.riskScore} level={data.overallRiskLevel} />
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
              Cyber Threat Level
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' }}>
              {data.overallRiskLevel}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {data.activeThreats} active threats • {data.recentIncidents} incidents
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RiskGauge score={data.riskScore} level={data.overallRiskLevel} />
          <div>
            <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
              Regional Threat Assessment
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
              {data.country} - {data.region}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {data.activeThreats} active threats • {data.recentIncidents} recent incidents
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div style={{ 
        padding: 12, 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        borderRadius: 8,
        borderLeft: `3px solid ${RISK_COLORS[data.overallRiskLevel as keyof typeof RISK_COLORS]}`
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info style={{ width: 14, height: 14 }} />
          Analysis Summary
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: '#d1d5db' }}>
          {data.analysis}
        </p>
      </div>
      
      <div>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Skull style={{ width: 14, height: 14, color: '#ef4444' }} />
          Active Threat Actors ({data.topThreatActors.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.topThreatActors.map(actor => (
            <ThreatActorCard key={actor.id} actor={actor} />
          ))}
        </div>
      </div>
      
      <div>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Lock style={{ width: 14, height: 14, color: '#f97316' }} />
          Critical Vulnerabilities ({data.activeVulnerabilities.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.activeVulnerabilities.map(vuln => (
            <VulnerabilityCard key={vuln.cveId} vuln={vuln} />
          ))}
        </div>
      </div>
      
      <div style={{ 
        padding: 12, 
        backgroundColor: 'rgba(34,197,94,0.1)', 
        borderRadius: 8,
        border: '1px solid rgba(34,197,94,0.2)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#22c55e' }}>
          Recommendations
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#d1d5db' }}>
          {data.recommendations.map((rec, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>{rec}</li>
          ))}
        </ul>
      </div>
      
      <div style={{ fontSize: 9, color: '#6b7280', textAlign: 'right' }}>
        Source: Google Threat Intelligence / Mandiant
        <br />
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}

// Compact threat indicator for map legend
export function ThreatIndicatorBadge({ assessment }: { assessment: RegionalThreatAssessment | null }) {
  if (!assessment) return null
  
  const color = RISK_COLORS[assessment.overallRiskLevel as keyof typeof RISK_COLORS]
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 6,
      padding: '4px 8px',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 4,
      fontSize: 10
    }}>
      <Shield style={{ width: 12, height: 12, color }} />
      <span style={{ color: '#fff' }}>Cyber Risk:</span>
      <span style={{ color, fontWeight: 600, textTransform: 'uppercase' }}>
        {assessment.overallRiskLevel}
      </span>
    </div>
  )
}
