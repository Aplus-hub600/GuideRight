import { useState, useEffect } from "react"
import { Clock, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

interface MissionClockProps {
  className?: string
  compact?: boolean
}

export function MissionClock({ className, compact = false }: MissionClockProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatZulu = (date: Date) => {
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    const seconds = date.getUTCSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}Z`
  }

  const formatLocal = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}L`
  }

  const formatDate = (date: Date) => {
    const day = date.getUTCDate().toString().padStart(2, '0')
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = months[date.getUTCMonth()]
    const year = date.getUTCFullYear().toString().slice(-2)
    return `${day}${month}${year}`
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5 font-mono text-xs", className)}>
        <Clock className="h-3 w-3 text-primary" />
        <span className="text-foreground font-semibold">{formatZulu(time)}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50",
      className
    )}>
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Radio className="h-3 w-3 text-green-500" />
          <div className="absolute inset-0 animate-ping">
            <Radio className="h-3 w-3 text-green-500 opacity-30" />
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-green-500 font-medium">LIVE</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold text-foreground tracking-wide">
            {formatZulu(time)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatLocal(time)}
          </span>
        </div>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <span className="font-mono text-xs text-muted-foreground">
        {formatDate(time)}
      </span>
    </div>
  )
}

export function DataFreshness({ lastUpdated, className }: { lastUpdated?: Date | null, className?: string }) {
  const [ageText, setAgeText] = useState("")
  const [ageLevel, setAgeLevel] = useState<'fresh' | 'stale' | 'old'>('fresh')

  useEffect(() => {
    const updateAge = () => {
      if (!lastUpdated) {
        setAgeText("No data")
        setAgeLevel('old')
        return
      }

      const now = new Date()
      const diffMs = now.getTime() - lastUpdated.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)

      if (diffMins < 1) {
        setAgeText("Just now")
        setAgeLevel('fresh')
      } else if (diffMins < 5) {
        setAgeText(`${diffMins}m ago`)
        setAgeLevel('fresh')
      } else if (diffMins < 30) {
        setAgeText(`${diffMins}m ago`)
        setAgeLevel('stale')
      } else if (diffHours < 1) {
        setAgeText(`${diffMins}m ago`)
        setAgeLevel('old')
      } else {
        setAgeText(`${diffHours}h ago`)
        setAgeLevel('old')
      }
    }

    updateAge()
    const timer = setInterval(updateAge, 30000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <div className={cn(
        "h-1.5 w-1.5 rounded-full",
        ageLevel === 'fresh' && "bg-green-500",
        ageLevel === 'stale' && "bg-yellow-500",
        ageLevel === 'old' && "bg-red-500"
      )} />
      <span className={cn(
        "font-medium",
        ageLevel === 'fresh' && "text-green-500",
        ageLevel === 'stale' && "text-yellow-500",
        ageLevel === 'old' && "text-red-500"
      )}>
        {ageText}
      </span>
    </div>
  )
}
