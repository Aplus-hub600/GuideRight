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
          "bg-background/95 backdrop-blur-sm border rounded-md p-3 shadow-sm",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <lensConfig.icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{lensConfig.label} Lens</span>
        </div>
        
        <div className="space-y-1.5 text-xs">
          {activeLens === "infrastructure" && (
            <>
              <LegendItem icon="solid" label="Multi-source verified" />
              <LegendItem icon="hollow" label="Single source" />
              <LegendItem icon="faded" label="Inferred / aging data" />
            </>
          )}
          {activeLens === "human-activity" && (
            <>
              <LegendItem icon="solid" label="Reported events" />
              <LegendItem icon="dotted" label="Inferred activity" />
              <LegendItem icon="band" label="Intensity zone" />
            </>
          )}
          {activeLens === "risk-stress" && (
            <>
              <LegendItem color="emerald" label="Low risk" />
              <LegendItem color="amber" label="Moderate risk" />
              <LegendItem color="red" label="High risk" />
            </>
          )}
          {activeLens === "logistics" && (
            <>
              <LegendItem icon="solid-line" label="Primary route" />
              <LegendItem icon="dashed-line" label="Alternate route" />
              <LegendItem icon="point" label="Supply point" />
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function LegendItem({ 
  icon, 
  color, 
  label 
}: { 
  icon?: "solid" | "hollow" | "faded" | "dotted" | "band" | "solid-line" | "dashed-line" | "point"
  color?: "emerald" | "amber" | "red"
  label: string 
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon === "solid" && (
        <div className="w-3 h-3 rounded-full bg-primary" />
      )}
      {icon === "hollow" && (
        <div className="w-3 h-3 rounded-full border-2 border-primary" />
      )}
      {icon === "faded" && (
        <div className="w-3 h-3 rounded-full bg-primary/40" />
      )}
      {icon === "dotted" && (
        <div className="w-3 h-3 rounded-full border-2 border-dashed border-primary" />
      )}
      {icon === "band" && (
        <div className="w-4 h-2 rounded-sm bg-primary/30" />
      )}
      {icon === "solid-line" && (
        <div className="w-4 h-0.5 bg-primary" />
      )}
      {icon === "dashed-line" && (
        <div className="w-4 h-0.5 bg-primary" style={{ background: "repeating-linear-gradient(90deg, hsl(var(--primary)) 0 2px, transparent 2px 4px)" }} />
      )}
      {icon === "point" && (
        <div className="w-2.5 h-2.5 rounded-sm bg-primary rotate-45" />
      )}
      {color === "emerald" && (
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
      )}
      {color === "amber" && (
        <div className="w-3 h-3 rounded-full bg-amber-500" />
      )}
      {color === "red" && (
        <div className="w-3 h-3 rounded-full bg-red-500" />
      )}
      <span>{label}</span>
    </div>
  )
}
