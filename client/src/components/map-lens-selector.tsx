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
        {/* Header - Professional and accessible */}
        <div 
          className="flex items-center gap-2 px-2.5 py-2 border-b"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: colors.accent }} />
          <span 
            className="text-[11px] font-semibold tracking-wide truncate"
            style={{ color: colors.accent }}
          >
            {lensConfig.label}
          </span>
        </div>
        
        {/* Legend Content - Clear labels for executive understanding */}
        <div className="px-2.5 py-2 space-y-2.5">
          {/* Infrastructure */}
          {activeLens === "infrastructure" && (
            <>
              <LegendGroup label="Critical Facilities">
                <LegendItem color="#ef4444" label="Hospitals & Clinics" />
                <LegendItem color="#3b82f6" label="Transport Hubs" />
                <LegendItem color="#f59e0b" label="Power & Utilities" />
                <LegendItem color="#10b981" label="Government Buildings" />
                <LegendItem color="#8b5cf6" label="Schools & Universities" />
              </LegendGroup>
              <LegendGroup label="Data Quality">
                <LegendQuality status="high" label="Verified (3+ sources)" />
                <LegendQuality status="medium" label="Confirmed (1 source)" />
                <LegendQuality status="low" label="Estimated" />
              </LegendGroup>
            </>
          )}
          
          {/* Human Activity */}
          {activeLens === "human-activity" && (
            <>
              <LegendGroup label="Activity Level">
                <LegendLevel level="High" color="#ef4444" fill={100} pulse />
                <LegendLevel level="Moderate" color="#f59e0b" fill={60} />
                <LegendLevel level="Low" color="#10b981" fill={30} />
              </LegendGroup>
              <LegendGroup label="Activity Type">
                <LegendActivityIcon type="gathering" label="Public Gatherings" />
                <LegendActivityIcon type="movement" label="Population Flow" />
                <LegendActivityIcon type="incident" label="Reported Incidents" />
              </LegendGroup>
            </>
          )}
          
          {/* Risk & Stress */}
          {activeLens === "risk-stress" && (
            <>
              <LegendGroup label="Risk Assessment">
                <LegendRisk level="High Risk" color="#ef4444" pulse />
                <LegendRisk level="Elevated" color="#f97316" />
                <LegendRisk level="Moderate" color="#eab308" />
                <LegendRisk level="Low Risk" color="#22c55e" />
              </LegendGroup>
              <LegendGroup label="Map Overlay">
                <LegendOverlay type="fill" label="Risk Zone" />
                <LegendOverlay type="border" label="Zone Boundary" />
              </LegendGroup>
            </>
          )}
          
          {/* Logistics */}
          {activeLens === "logistics" && (
            <>
              <LegendGroup label="Route Conditions">
                <LegendRouteStatus status="Clear" color="#22c55e" desc="Open, no delays" />
                <LegendRouteStatus status="Congested" color="#f59e0b" desc="Slow traffic" />
                <LegendRouteStatus status="Blocked" color="#ef4444" desc="Impassable" />
                <LegendRouteStatus status="Restricted" color="#6b7280" desc="Limited access" />
              </LegendGroup>
              <LegendGroup label="Supply Points">
                <LegendSupplyPoint color="#f97316" label="Fuel Stations" />
                <LegendSupplyPoint color="#ef4444" label="Medical Supplies" />
                <LegendSupplyPoint color="#22c55e" label="Food & Water" />
                <LegendSupplyPoint color="#3b82f6" label="General Supplies" />
              </LegendGroup>
            </>
          )}
        </div>
        
        {/* Footer - Professional data attribution */}
        <div className="px-2.5 py-1.5 border-t border-border/40 bg-muted/30">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
            <span>Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Real-time
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Legend section group with clean header
function LegendGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-semibold text-muted-foreground/80 tracking-wide mb-1.5 pb-0.5 border-b border-border/40">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

// Simple color + label item for facilities
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div 
        className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-foreground/80">{label}</span>
    </div>
  )
}

// Data quality indicator with visual status
function LegendQuality({ status, label }: { status: "high" | "medium" | "low"; label: string }) {
  const colors = {
    high: { bg: "#22c55e", fill: true },
    medium: { bg: "#f59e0b", fill: false },
    low: { bg: "#9ca3af", fill: false }
  }
  const config = colors[status]
  
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div 
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ 
          backgroundColor: config.fill ? config.bg : "transparent",
          border: `2px solid ${config.bg}`,
          opacity: status === "low" ? 0.6 : 1
        }}
      />
      <span className="text-[10px] text-foreground/80">{label}</span>
    </div>
  )
}

// Activity level with proportional bar
function LegendLevel({ level, color, fill, pulse }: { level: string; color: string; fill: number; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div className="relative w-8 h-2 rounded-full overflow-hidden bg-border/40 shrink-0">
        <div 
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all", pulse && "animate-pulse")}
          style={{ backgroundColor: color, width: `${fill}%` }}
        />
      </div>
      <span className="text-[10px] text-foreground/80">{level}</span>
    </div>
  )
}

// Activity type with descriptive icon
function LegendActivityIcon({ type, label }: { type: "gathering" | "movement" | "incident"; label: string }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
        {type === "gathering" && (
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
        )}
        {type === "movement" && (
          <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 7h8M8 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {type === "incident" && (
          <svg className="w-3 h-3 text-red-500" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1L11 10H1L6 1z" />
          </svg>
        )}
      </div>
      <span className="text-[10px] text-foreground/80">{label}</span>
    </div>
  )
}

// Risk level with color band
function LegendRisk({ level, color, pulse }: { level: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div className="relative shrink-0">
        {pulse && (
          <div 
            className="absolute inset-0 rounded animate-ping opacity-30"
            style={{ backgroundColor: color }}
          />
        )}
        <div 
          className="w-6 h-3 rounded relative z-10 shadow-sm"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-foreground/80">{level}</span>
    </div>
  )
}

// Map overlay indicator
function LegendOverlay({ type, label }: { type: "fill" | "border"; label: string }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div className="w-5 h-3 shrink-0">
        {type === "fill" && (
          <div className="w-full h-full rounded-sm bg-red-500/30 border border-red-500/50" />
        )}
        {type === "border" && (
          <div className="w-full h-full rounded-sm border-2 border-dashed border-red-500/70" />
        )}
      </div>
      <span className="text-[10px] text-foreground/80">{label}</span>
    </div>
  )
}

// Route status with description
function LegendRouteStatus({ status, color, desc }: { status: string; color: string; desc: string }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div className="w-5 flex items-center shrink-0">
        <div className="w-full h-[3px] rounded-full shadow-sm" style={{ backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-medium text-foreground/90">{status}</span>
      <span className="text-[9px] text-muted-foreground/70 ml-auto">{desc}</span>
    </div>
  )
}

// Supply point with diamond marker
function LegendSupplyPoint({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 h-[18px]">
      <div 
        className="w-2.5 h-2.5 rotate-45 rounded-[2px] shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-foreground/80">{label}</span>
    </div>
  )
}
