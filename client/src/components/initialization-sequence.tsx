import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield } from "lucide-react"
import { type UserPersona, getQuickActionsForRole } from "@/lib/persona"

interface InitializationSequenceProps {
  persona: UserPersona
  onComplete: () => void
  // When true (e.g. switching persona mid-session), the boot runs ~4x faster so
  // it doesn't eat demo time. First launch keeps the full cinematic sequence.
  fast?: boolean
}

interface BootLine {
  label: string
  value: string
  status: string
  statusColor: string
  delay: number
}

function buildBootLines(persona: UserPersona): BootLine[] {
  const actions = getQuickActionsForRole(persona.role)
  const actionLabels = actions.map(a => a.label).join(" / ")

  const filterMap: Record<string, string> = {
    "Intelligence Analyst": "MULTI-SOURCE FUSION",
    "SOF Operator": "THREAT-FIRST",
    "Commander": "DECISION-WEIGHTED",
    "Civil Affairs Officer": "HUMAN TERRAIN",
    "Psychological Operations Officer": "INFO ENVIRONMENT",
    "Planner": "COA ANALYSIS",
    "Security Cooperation Officer": "PARTNER FOCUSED",
    "Diplomatic Security Officer": "PROTECTION-FIRST",
    "Executive Decision Maker": "BLUF MODE",
    "Port Operations Analyst": "THROUGHPUT OPTIMIZED",
  }

  return [
    {
      label: "OPERATOR PROFILE",
      value: persona.callsign.toUpperCase(),
      status: "VERIFIED",
      statusColor: "text-green-400",
      delay: 0.5,
    },
    {
      label: "ROLE MODULE",
      value: persona.role.toUpperCase(),
      status: "LOADED",
      statusColor: "text-green-400",
      delay: 1.0,
    },
    {
      label: "EXPERIENCE MODIFIER",
      value: persona.experienceLevel.toUpperCase(),
      status: "CALIBRATED",
      statusColor: "text-green-400",
      delay: 1.5,
    },
    {
      label: "MISSION CONTEXT",
      value: persona.missionContext.toUpperCase(),
      status: "ACTIVE",
      statusColor: "text-amber-400",
      delay: 2.0,
    },
    {
      label: "INTELLIGENCE FILTERS",
      value: filterMap[persona.role] ?? "ADAPTIVE",
      status: "ENABLED",
      statusColor: "text-green-400",
      delay: 2.6,
    },
    {
      label: "QUICK ACTIONS",
      value: actionLabels,
      status: "READY",
      statusColor: "text-green-400",
      delay: 3.2,
    },
    {
      label: "ADAPTIVE PROMPT ENGINE",
      value: "COMPILED",
      status: "OK",
      statusColor: "text-green-400",
      delay: 3.8,
    },
    {
      label: "SYSTEM INTEGRITY",
      value: "ALL CHECKS PASSED",
      status: "PASS",
      statusColor: "text-green-400",
      delay: 4.4,
    },
  ]
}

function TypingText({ text, startDelay }: { text: string; startDelay: number }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let i = 0
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, 18)
      return () => clearInterval(interval)
    }, startDelay * 1000)
    timeoutRef.current = start
    return () => clearTimeout(start)
  }, [text, startDelay])

  return (
    <span>
      {displayed}
      {!done && <span className="opacity-70 animate-pulse">_</span>}
    </span>
  )
}

// A slow, calm horizontal scan line that sweeps top-to-bottom on a loop.
// Provides quiet continuous motion without drawing attention.
function ScanSweep() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(59,130,246,0.06),transparent)]"
        initial={{ top: "-10%" }}
        animate={{ top: ["-10%", "100%"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

export function InitializationSequence({ persona, onComplete, fast = false }: InitializationSequenceProps) {
  // Time scale: full cinematic on first launch, ~4x faster when switching persona.
  const scale = fast ? 0.26 : 1
  const lines = buildBootLines(persona).map(line => ({ ...line, delay: line.delay * scale }))
  const [progress, setProgress] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Progress bar: 0→100% over the (scaled) load duration
    const start = Date.now()
    const duration = 4800 * scale
    let rafId = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct < 100) rafId = requestAnimationFrame(tick)
    })

    const t1 = setTimeout(() => setShowComplete(true), 4700 * scale)
    const t2 = setTimeout(() => setShowWelcome(true), 5100 * scale)
    let t4: ReturnType<typeof setTimeout>
    const t3 = setTimeout(() => {
      setExiting(true)
      t4 = setTimeout(onComplete, 600 * scale)
    }, 6900 * scale)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete, scale])

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="init"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)]" />

          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(59,130,246,0.07),transparent)]" />

          <div className="relative w-full max-w-xl px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-6px] rounded-full border border-dashed border-blue-500/30"
                />
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono font-bold tracking-[0.25em] text-blue-400 uppercase">
                  GuideRight
                </div>
                <div className="text-[10px] font-mono text-blue-400/50 tracking-widest uppercase">
                  Adaptive Intelligence System
                </div>
              </div>
              <div className="ml-auto text-[10px] font-mono text-blue-400/40 tracking-widest">
                INITIALIZING...
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="h-px bg-blue-500/20 mb-6 origin-left"
            />

            {/* Boot lines */}
            <div className="space-y-2 mb-8 font-mono text-xs">
              {lines.map((line) => (
                <motion.div
                  key={line.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: line.delay, duration: 0.2 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-blue-400/40 flex-shrink-0">›</span>
                  <span className="text-blue-400/60 flex-shrink-0 w-48">
                    {line.label}
                  </span>
                  <span className="text-blue-200/80 flex-1 truncate">
                    {line.value}
                  </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: line.delay + 0.15, duration: 0.2 }}
                    className={`flex-shrink-0 text-[10px] tracking-wider ${line.statusColor}`}
                  >
                    [{line.status}]
                  </motion.span>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 2.4 }}
              className="h-px bg-blue-500/20 mb-4 origin-left"
            />

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono text-blue-400/40 tracking-widest uppercase">
                  System Load
                </span>
                <span className="text-[10px] font-mono text-blue-400/60 tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-0.5 bg-blue-500/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Completion messages */}
            <AnimatePresence>
              {showComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] font-mono text-blue-400/60 tracking-widest uppercase mb-4"
                >
                  Initialization complete
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_50%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
                  <div className="text-2xl font-mono font-bold tracking-wider text-white">
                    WELCOME,{" "}
                    <span className="text-blue-400">{persona.callsign.toUpperCase()}.</span>
                  </div>
                  <div className="text-xs font-mono text-blue-400/50 tracking-widest mt-1 uppercase">
                    {persona.role} · {persona.missionContext} · {persona.experienceLevel}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Calm continuous scan sweep — quiet motion, no distraction */}
          <ScanSweep />
        </motion.div>
      ) : (
        <motion.div
          key="exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 bg-black pointer-events-none"
        />
      )}
    </AnimatePresence>
  )
}
