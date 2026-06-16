import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield } from "lucide-react"
import { type UserPersona, getQuickActionsForRole } from "@/lib/persona"

interface InitializationSequenceProps {
  persona: UserPersona
  onComplete: () => void
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

// Jagged bolt paths drawn over a 1000x1000 viewBox (stretched full-screen)
const BOLTS_A = [
  "M520 -20 L470 210 L560 280 L480 520 L575 590 L500 820 L545 1020",
  "M520 280 L610 360 L545 470",
  "M480 520 L390 600 L455 700",
]
const BOLTS_B = [
  "M300 -20 L350 180 L275 250 L345 470 L260 560 L320 800 L290 1020",
  "M720 -20 L675 200 L760 280 L690 500 L775 580 L715 1020",
  "M345 470 L260 540 L320 660",
  "M760 280 L850 350 L780 460",
]
const BOLTS_C = [
  "M170 -20 L220 220 L150 300 L230 560 L160 660 L210 1020",
  "M850 -20 L800 240 L880 320 L810 580 L885 680 L830 1020",
  "M220 220 L130 290 L195 400",
]
const BOLTS_D = [
  "M500 -20 L450 200 L555 270 L470 480 L580 560 L495 800 L540 1020",
  "M500 270 L600 200 L540 360",
  "M470 480 L370 420 L440 590",
  "M540 1020 L470 880 L560 800",
]

function LightningStrike({ delay, paths }: { delay: number; paths: string[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* Thunder flash */}
      <motion.div
        className="absolute inset-0 bg-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.05, 0.5, 0] }}
        transition={{ duration: 0.7, times: [0, 0.04, 0.16, 0.26, 1], delay, ease: "easeOut" }}
      />
      {/* Cool blue afterglow wash */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(59,130,246,0.35),transparent_70%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
        transition={{ duration: 0.9, times: [0, 0.05, 0.2, 0.3, 1], delay, ease: "easeOut" }}
      />
      {/* Bolts */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="#eaf6ff"
            strokeWidth={i === 0 ? 4 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px #7cc0ff) drop-shadow(0 0 18px #3b82f6)" }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 0.6,
              times: [0, 0.18, 0.7, 1],
              delay: delay + i * 0.03,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function InitializationSequence({ persona, onComplete }: InitializationSequenceProps) {
  const lines = buildBootLines(persona)
  const [progress, setProgress] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Progress bar: 0→100% over 4.8s
    const start = Date.now()
    const duration = 4800
    let rafId = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct < 100) rafId = requestAnimationFrame(tick)
    })

    const t1 = setTimeout(() => setShowComplete(true), 4700)
    const t2 = setTimeout(() => setShowWelcome(true), 5200)
    let t4: ReturnType<typeof setTimeout>
    const t3 = setTimeout(() => {
      setExiting(true)
      t4 = setTimeout(onComplete, 600)
    }, 7600)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete])

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

          {/* Lightning strikes — spread across the sequence, building to the WELCOME impact */}
          <LightningStrike delay={0.4} paths={BOLTS_A} />
          <LightningStrike delay={2.3} paths={BOLTS_C} />
          <LightningStrike delay={4.0} paths={BOLTS_B} />
          <LightningStrike delay={5.2} paths={BOLTS_D} />
          <LightningStrike delay={6.4} paths={BOLTS_A} />
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
