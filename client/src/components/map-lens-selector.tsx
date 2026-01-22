import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Truck,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export type MapLens = "infrastructure" | "human-activity" | "risk-stress" | "logistics"

interface LensConfig {
  id: MapLens
  label: string
  shortLabel: string
  icon: typeof Building2
  description: string
  suggestedQuestions: string[]
}

export const LENS_CONFIGS: LensConfig[] = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    shortLabel: "Infra",
    icon: Building2,
    description: "Healthcare, transport, utilities, and critical facilities",
    suggestedQuestions: [
      "Show healthcare access gaps",
      "Identify transport chokepoints",
      "Which areas are under-served?",
      "Map critical infrastructure"
    ]
  },
  {
    id: "human-activity",
    label: "Human Activity",
    shortLabel: "Activity",
    icon: Users,
    description: "Population movement, gatherings, and civil activity patterns",
    suggestedQuestions: [
      "Types of public disorder observed",
      "Primary protest drivers",
      "Population movement patterns",
      "Comparison to adjacent districts"
    ]
  },
  {
    id: "risk-stress",
    label: "Risk & Stress",
    shortLabel: "Risk",
    icon: AlertTriangle,
    description: "Threat assessment, tension indicators, and security concerns",
    suggestedQuestions: [
      "Current threat assessment",
      "Historical incident patterns",
      "Escalation indicators",
      "Safe corridor identification"
    ]
  },
  {
    id: "logistics",
    label: "Logistics & Mobility",
    shortLabel: "Logistics",
    icon: Truck,
    description: "Routes, supply lines, access corridors, and mobility constraints",
    suggestedQuestions: [
      "Optimal route analysis",
      "Supply line vulnerabilities",
      "Border crossing status",
      "Fuel and resupply points"
    ]
  }
]

interface MapLensSelectorProps {
  activeLens: MapLens
  onLensChange: (lens: MapLens) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function MapLensSelector({
  activeLens,
  onLensChange,
  collapsed = false,
  onToggleCollapse,
  className
}: MapLensSelectorProps) {
  const activeLensConfig = LENS_CONFIGS.find(l => l.id === activeLens)
  
  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-sm border rounded-md shadow-sm overflow-hidden",
      className
    )}>
      <div className="flex flex-col">
        {LENS_CONFIGS.map((lens) => {
          const isActive = activeLens === lens.id
          const Icon = lens.icon
          
          return (
            <Tooltip key={lens.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onLensChange(lens.id)}
                  className={cn(
                    "justify-start gap-2 rounded-none border-b last:border-b-0 h-9",
                    isActive && "bg-primary text-primary-foreground",
                    !collapsed && "px-3"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <span className="text-xs font-medium">{lens.shortLabel}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">{lens.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{lens.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

interface LensLegendProps {
  activeLens: MapLens
  className?: string
}

// Lens accent colors - consistent military-style color coding
const LENS_COLORS = {
  infrastructure: { accent: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.2)" },
  "human-activity": { accent: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.08)", border: "rgba(168, 85, 247, 0.2)" },
  "risk-stress": { accent: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.08)", border: "rgba(249, 115, 22, 0.2)" },
  logistics: { accent: "rgb(6, 182, 212)", bg: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.2)" }
}

export function LensLegend({ activeLens, className }: LensLegendProps) {
  const lensConfig = LENS_CONFIGS.find(l => l.id === activeLens)
  if (!lensConfig) return null
  
  const colors = LENS_COLORS[activeLens]
  const Icon = lensConfig.icon
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeLens}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className={cn(
          "bg-background/98 backdrop-blur-md border shadow-xl rounded",
          "font-mono text-[11px] select-none",
          className
        )}
        style={{ 
          borderColor: colors.border,
          minWidth: "156px",
          maxWidth: "180px"
        }}
      >
        {/* Header - Compact military style */}
        <div 
          className="flex items-center gap-1.5 px-2 py-1.5 border-b"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <Icon className="h-3 w-3 shrink-0" style={{ color: colors.accent }} />
          <span 
            className="text-[10px] font-bold tracking-[0.08em] uppercase truncate"
            style={{ color: colors.accent }}
          >
            {lensConfig.shortLabel}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide">LIVE</span>
          </div>
        </div>
        
        {/* Legend Content - Tight grid layout */}
        <div className="px-2 py-1.5 space-y-2">
          {/* Infrastructure */}
          {activeLens === "infrastructure" && (
            <>
              <LegendGroup label="FACILITIES">
                <LegendRow color="#ef4444" code="MED" label="Medical" />
                <LegendRow color="#3b82f6" code="TRN" label="Transport" />
                <LegendRow color="#f59e0b" code="UTL" label="Utility" />
                <LegendRow color="#10b981" code="GOV" label="Government" />
                <LegendRow color="#8b5cf6" code="EDU" label="Education" />
              </LegendGroup>
              <LegendGroup label="CONFIDENCE">
                <LegendConfidence level="A" label="Multi-source" status="verified" />
                <LegendConfidence level="B" label="Single source" status="partial" />
                <LegendConfidence level="C" label="Inferred" status="low" />
              </LegendGroup>
            </>
          )}
          
          {/* Human Activity */}
          {activeLens === "human-activity" && (
            <>
              <LegendGroup label="INTENSITY">
                <LegendIntensity level="HIGH" color="#ef4444" pulse />
                <LegendIntensity level="MOD" color="#f59e0b" />
                <LegendIntensity level="LOW" color="#10b981" />
              </LegendGroup>
              <LegendGroup label="TYPE">
                <LegendActivityType type="gathering" label="Gathering" />
                <LegendActivityType type="movement" label="Movement" />
                <LegendActivityType type="incident" label="Incident" />
              </LegendGroup>
            </>
          )}
          
          {/* Risk & Stress */}
          {activeLens === "risk-stress" && (
            <>
              <LegendGroup label="THREAT LEVEL">
                <LegendThreat level="HIGH" color="#ef4444" pulse />
                <LegendThreat level="ELEV" color="#f97316" />
                <LegendThreat level="MOD" color="#eab308" />
                <LegendThreat level="LOW" color="#22c55e" />
              </LegendGroup>
              <LegendGroup label="ZONES">
                <LegendZone type="fill" label="Risk Area" />
                <LegendZone type="border" label="Boundary" />
              </LegendGroup>
            </>
          )}
          
          {/* Logistics */}
          {activeLens === "logistics" && (
            <>
              <LegendGroup label="MSR STATUS">
                <LegendRoute status="GREEN" color="#22c55e" />
                <LegendRoute status="AMBER" color="#f59e0b" />
                <LegendRoute status="RED" color="#ef4444" />
                <LegendRoute status="BLACK" color="#6b7280" />
              </LegendGroup>
              <LegendGroup label="LOG POINTS">
                <LegendSupply type="POL" color="#f97316" label="Fuel" />
                <LegendSupply type="MED" color="#ef4444" label="Medical" />
                <LegendSupply type="CL1" color="#22c55e" label="Subsist" />
                <LegendSupply type="GEN" color="#3b82f6" label="General" />
              </LegendGroup>
            </>
          )}
        </div>
        
        {/* Footer - Data freshness indicator */}
        <div className="px-2 py-1 border-t border-border/50 flex items-center justify-between">
          <span className="text-[8px] text-muted-foreground/70 uppercase tracking-wide">
            DTG: {new Date().toISOString().slice(11, 16)}Z
          </span>
          <span className="text-[8px] text-muted-foreground/70 uppercase tracking-wide">
            REF: AOI-01
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Compact legend group with military-style section header
function LegendGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[8px] font-semibold text-muted-foreground/60 tracking-[0.1em] mb-1 border-b border-border/30 pb-0.5">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

// Facility type row with color indicator and military code
function LegendRow({ color, code, label }: { color: string; code: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div 
        className="w-2 h-2 rounded-sm shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[9px] font-bold text-muted-foreground w-6 shrink-0">{code}</span>
      <span className="text-[9px] text-foreground/70 truncate">{label}</span>
    </div>
  )
}

// Confidence level indicator with reliability rating
function LegendConfidence({ level, label, status }: { level: string; label: string; status: "verified" | "partial" | "low" }) {
  const statusColors = {
    verified: { bg: "#22c55e", border: "#16a34a" },
    partial: { bg: "#f59e0b", border: "#d97706" },
    low: { bg: "#6b7280", border: "#4b5563" }
  }
  const colors = statusColors[status]
  
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div 
        className="w-2 h-2 rounded-full shrink-0"
        style={{ 
          backgroundColor: status === "verified" ? colors.bg : "transparent",
          border: `1.5px solid ${colors.border}`,
          opacity: status === "low" ? 0.5 : 1
        }}
      />
      <span className="text-[9px] font-bold text-muted-foreground w-3 shrink-0">({level})</span>
      <span className="text-[9px] text-foreground/70 truncate">{label}</span>
    </div>
  )
}

// Activity intensity bar with pulse for high
function LegendIntensity({ level, color, pulse }: { level: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div className="relative w-6 h-2 rounded-sm overflow-hidden bg-border/30 shrink-0">
        <div 
          className={cn("absolute inset-y-0 left-0 rounded-sm", pulse && "animate-pulse")}
          style={{ 
            backgroundColor: color,
            width: level === "HIGH" ? "100%" : level === "MOD" ? "60%" : "30%"
          }}
        />
      </div>
      <span className="text-[9px] font-bold text-foreground/80">{level}</span>
    </div>
  )
}

// Activity type icon indicator
function LegendActivityType({ type, label }: { type: "gathering" | "movement" | "incident"; label: string }) {
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div className="w-3 h-3 flex items-center justify-center shrink-0">
        {type === "gathering" && (
          <div className="w-2 h-2 rounded-full bg-purple-500" />
        )}
        {type === "movement" && (
          <svg className="w-3 h-3 text-blue-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 6h7M7 3.5l2.5 2.5-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {type === "incident" && (
          <svg className="w-2.5 h-2.5 text-red-500" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1L11 10H1L6 1z" />
          </svg>
        )}
      </div>
      <span className="text-[9px] text-foreground/70">{label}</span>
    </div>
  )
}

// Threat level indicator with color band
function LegendThreat({ level, color, pulse }: { level: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div className="relative shrink-0">
        {pulse && (
          <div 
            className="absolute inset-0 rounded-sm animate-ping opacity-40"
            style={{ backgroundColor: color }}
          />
        )}
        <div 
          className="w-5 h-2.5 rounded-sm relative z-10"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[9px] font-bold text-foreground/80 w-8">{level}</span>
    </div>
  )
}

// Risk zone indicator
function LegendZone({ type, label }: { type: "fill" | "border"; label: string }) {
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div className="w-4 h-2.5 shrink-0">
        {type === "fill" && (
          <div className="w-full h-full rounded-sm bg-red-500/25 border border-red-500/40" />
        )}
        {type === "border" && (
          <div className="w-full h-full rounded-sm border border-dashed border-red-500" />
        )}
      </div>
      <span className="text-[9px] text-foreground/70">{label}</span>
    </div>
  )
}

// Route status indicator with line style
function LegendRoute({ status, color }: { status: string; color: string }) {
  const lineStyle = status === "BLACK" ? "dashed" : "solid"
  
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div className="w-5 flex items-center shrink-0">
        {lineStyle === "solid" ? (
          <div className="w-full h-[3px] rounded-full" style={{ backgroundColor: color }} />
        ) : (
          <div className="w-full h-[3px] flex gap-0.5">
            <div className="flex-1 h-full rounded-full" style={{ backgroundColor: color }} />
            <div className="flex-1 h-full rounded-full" style={{ backgroundColor: color }} />
          </div>
        )}
      </div>
      <span className="text-[9px] font-bold text-foreground/80">{status}</span>
    </div>
  )
}

// Supply point indicator with class code
function LegendSupply({ type, color, label }: { type: string; color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 h-4">
      <div 
        className="w-2 h-2 rotate-45 rounded-[1px] shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[9px] font-bold text-muted-foreground w-6 shrink-0">{type}</span>
      <span className="text-[9px] text-foreground/70 truncate">{label}</span>
    </div>
  )
}
