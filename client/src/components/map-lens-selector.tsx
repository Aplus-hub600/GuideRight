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

export function LensLegend({ activeLens, className }: LensLegendProps) {
  const lensConfig = LENS_CONFIGS.find(l => l.id === activeLens)
  if (!lensConfig) return null
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeLens}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "bg-background/95 backdrop-blur-sm border rounded-md shadow-lg min-w-[180px]",
          className
        )}
      >
        {/* Header with lens icon and name */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 border-b",
          activeLens === "infrastructure" && "bg-blue-500/10",
          activeLens === "human-activity" && "bg-purple-500/10",
          activeLens === "risk-stress" && "bg-orange-500/10",
          activeLens === "logistics" && "bg-cyan-500/10"
        )}>
          <lensConfig.icon className={cn(
            "h-4 w-4",
            activeLens === "infrastructure" && "text-blue-500",
            activeLens === "human-activity" && "text-purple-500",
            activeLens === "risk-stress" && "text-orange-500",
            activeLens === "logistics" && "text-cyan-500"
          )} />
          <span className="text-xs font-semibold uppercase tracking-wide">{lensConfig.label}</span>
        </div>
        
        <div className="p-3 space-y-3">
          {/* Infrastructure Legend */}
          {activeLens === "infrastructure" && (
            <>
              <LegendSection title="Facility Types">
                <LegendColorItem color="bg-red-500" label="Hospital / Medical" />
                <LegendColorItem color="bg-blue-500" label="Transport Hub" />
                <LegendColorItem color="bg-amber-500" label="Utility / Power" />
                <LegendColorItem color="bg-emerald-500" label="Government" />
                <LegendColorItem color="bg-purple-500" label="Education" />
              </LegendSection>
              <LegendSection title="Data Confidence">
                <LegendIconItem icon="solid-circle" color="text-emerald-500" label="Verified (multi-source)" />
                <LegendIconItem icon="hollow-circle" color="text-amber-500" label="Single source" />
                <LegendIconItem icon="faded-circle" color="text-muted-foreground" label="Inferred / aging" />
              </LegendSection>
            </>
          )}
          
          {/* Human Activity Legend */}
          {activeLens === "human-activity" && (
            <>
              <LegendSection title="Activity Intensity">
                <LegendColorItem color="bg-red-500" pulseColor="bg-red-400" pulse label="High intensity" />
                <LegendColorItem color="bg-amber-500" label="Moderate intensity" />
                <LegendColorItem color="bg-emerald-500" label="Low intensity" />
              </LegendSection>
              <LegendSection title="Activity Type">
                <LegendIconItem icon="circle-solid" color="text-purple-500" label="Gathering / Rally" />
                <LegendIconItem icon="arrow-flow" color="text-blue-500" label="Movement / Flow" />
                <LegendIconItem icon="alert-triangle" color="text-red-500" label="Incident" />
              </LegendSection>
            </>
          )}
          
          {/* Risk & Stress Legend */}
          {activeLens === "risk-stress" && (
            <>
              <LegendSection title="Risk Level">
                <LegendColorItem color="bg-red-500" pulseColor="bg-red-400" pulse label="High risk" />
                <LegendColorItem color="bg-orange-500" label="Elevated risk" />
                <LegendColorItem color="bg-amber-500" label="Moderate risk" />
                <LegendColorItem color="bg-emerald-500" label="Low risk" />
              </LegendSection>
              <LegendSection title="Zone Indicators">
                <LegendIconItem icon="zone-fill" color="text-red-500/30" label="Risk zone (fill)" />
                <LegendIconItem icon="zone-border" color="text-red-500" label="Zone boundary" />
              </LegendSection>
            </>
          )}
          
          {/* Logistics Legend */}
          {activeLens === "logistics" && (
            <>
              <LegendSection title="Route Status">
                <LegendLineItem color="bg-emerald-500" style="solid" label="Clear" />
                <LegendLineItem color="bg-amber-500" style="solid" label="Congested" />
                <LegendLineItem color="bg-red-500" style="dashed" label="Blocked" />
                <LegendLineItem color="bg-gray-500" style="dotted" label="Restricted" />
              </LegendSection>
              <LegendSection title="Supply Points">
                <LegendColorItem color="bg-orange-500" shape="diamond" label="Fuel depot" />
                <LegendColorItem color="bg-red-500" shape="diamond" label="Medical supply" />
                <LegendColorItem color="bg-emerald-500" shape="diamond" label="Food / water" />
                <LegendColorItem color="bg-blue-500" shape="diamond" label="General supply" />
              </LegendSection>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function LegendSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function LegendColorItem({ 
  color, 
  pulseColor,
  pulse,
  label,
  shape = "circle"
}: { 
  color: string
  pulseColor?: string
  pulse?: boolean
  label: string
  shape?: "circle" | "diamond"
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="relative flex items-center justify-center w-4 h-4">
        {pulse && pulseColor && (
          <div className={cn("absolute w-3 h-3 rounded-full animate-ping opacity-50", pulseColor)} />
        )}
        <div className={cn(
          "w-2.5 h-2.5 relative z-10",
          shape === "circle" && "rounded-full",
          shape === "diamond" && "rotate-45 rounded-sm",
          color
        )} />
      </div>
      <span className="text-foreground/80">{label}</span>
    </div>
  )
}

function LegendIconItem({
  icon,
  color,
  label
}: {
  icon: "solid-circle" | "hollow-circle" | "faded-circle" | "circle-solid" | "arrow-flow" | "alert-triangle" | "zone-fill" | "zone-border"
  color: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center justify-center w-4 h-4">
        {icon === "solid-circle" && (
          <div className={cn("w-2.5 h-2.5 rounded-full", color.replace("text-", "bg-"))} />
        )}
        {icon === "hollow-circle" && (
          <div className={cn("w-2.5 h-2.5 rounded-full border-2", color.replace("text-", "border-"))} />
        )}
        {icon === "faded-circle" && (
          <div className={cn("w-2.5 h-2.5 rounded-full bg-muted-foreground/40")} />
        )}
        {icon === "circle-solid" && (
          <div className={cn("w-2.5 h-2.5 rounded-full", color.replace("text-", "bg-"))} />
        )}
        {icon === "arrow-flow" && (
          <svg className={cn("w-4 h-4", color)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 8h10M10 5l3 3-3 3" />
          </svg>
        )}
        {icon === "alert-triangle" && (
          <svg className={cn("w-3.5 h-3.5", color)} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {icon === "zone-fill" && (
          <div className="w-4 h-3 rounded-sm bg-red-500/30 border border-red-500/50" />
        )}
        {icon === "zone-border" && (
          <div className="w-4 h-3 rounded-sm border-2 border-dashed border-red-500" />
        )}
      </div>
      <span className="text-foreground/80">{label}</span>
    </div>
  )
}

function LegendLineItem({
  color,
  style,
  label
}: {
  color: string
  style: "solid" | "dashed" | "dotted"
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center justify-center w-4 h-4">
        {style === "solid" && (
          <div className={cn("w-4 h-1 rounded-full", color)} />
        )}
        {style === "dashed" && (
          <div className="w-4 h-1 flex gap-0.5">
            <div className={cn("w-1.5 h-1 rounded-sm", color)} />
            <div className={cn("w-1.5 h-1 rounded-sm", color)} />
          </div>
        )}
        {style === "dotted" && (
          <div className="w-4 h-1 flex gap-0.5 items-center">
            <div className={cn("w-1 h-1 rounded-full", color)} />
            <div className={cn("w-1 h-1 rounded-full", color)} />
            <div className={cn("w-1 h-1 rounded-full", color)} />
          </div>
        )}
      </div>
      <span className="text-foreground/80">{label}</span>
    </div>
  )
}
