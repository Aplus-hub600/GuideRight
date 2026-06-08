import { useState, useRef } from "react"
import { Shield, ChevronRight, CheckCircle2, Zap, Layers, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ROLES, EXPERIENCE_LEVELS, MISSION_CONTEXTS, PRIORITY_LENSES,
  PRIORITY_LENS_DEFAULTS, ROLE_OPTIMIZATIONS, ROLE_DESCRIPTIONS,
  CONTEXT_DESCRIPTIONS, TEMPORAL_HORIZON_DEFAULTS, TEMPORAL_HORIZON_LABELS,
  type Role, type ExperienceLevel, type MissionContext,
  type PriorityLens, type TemporalHorizon, type ResponseDepth, type UserPersona,
  savePersona
} from "@/lib/persona"
import { InitializationSequence } from "./initialization-sequence"

interface PersonaSetupProps {
  onComplete: (persona: UserPersona) => void
}

const RECOMMENDED: {
  role: Role
  experienceLevel: ExperienceLevel
  missionContext: MissionContext
  responseDepth: ResponseDepth
  temporalHorizon: TemporalHorizon | null
  priorityLenses: PriorityLens[]
} = {
  role: "Intelligence Analyst",
  experienceLevel: "Senior",
  missionContext: "Crisis Response",
  responseDepth: "Balanced",
  temporalHorizon: null,
  priorityLenses: ["Threat Activity", "Infrastructure", "Human Activity"],
}

const DEPTH_DESCRIPTIONS: Record<ResponseDepth, string> = {
  "Executive Summary": "One-paragraph BLUF. Key judgment and top risk only.",
  "Balanced": "Structured summary with evidence, confidence, and key gaps.",
  "Deep Analysis": "Full reasoning chain, competing hypotheses, and source evaluation.",
}

const HORIZON_OPTIONS: Array<{ label: string; value: TemporalHorizon | null; description: string }> = [
  { label: "Last 24 Hours", value: "24h", description: "Recent events and immediate threats" },
  { label: "Last 7 Days", value: "7d", description: "Near-term patterns and trends" },
  { label: "Last 30 Days", value: "30d", description: "Medium-term analysis and baselines" },
  { label: "Mission Adaptive", value: null, description: "GuideRight selects window based on role and query" },
]

export function PersonaSetup({ onComplete }: PersonaSetupProps) {
  const [callsign, setCallsign] = useState("")
  const [role, setRole] = useState<Role | null>(null)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [missionContext, setMissionContext] = useState<MissionContext | null>(null)
  const [responseDepth, setResponseDepth] = useState<ResponseDepth>("Balanced")
  const [temporalHorizon, setTemporalHorizon] = useState<TemporalHorizon | null>(null)
  const [priorityLenses, setPriorityLenses] = useState<PriorityLens[]>([])
  const [initializing, setInitializing] = useState<UserPersona | null>(null)

  const formRef = useRef<HTMLDivElement>(null)

  const handleRecommendedProfile = () => {
    setRole(RECOMMENDED.role)
    setExperienceLevel(RECOMMENDED.experienceLevel)
    setMissionContext(RECOMMENDED.missionContext)
    setResponseDepth(RECOMMENDED.responseDepth)
    setTemporalHorizon(RECOMMENDED.temporalHorizon)
    setPriorityLenses(RECOMMENDED.priorityLenses)
    setTimeout(() => formRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50)
  }

  const handleLaunchDemo = () => {
    const demoPersona: UserPersona = {
      callsign: "SHERIFF",
      role: "SOF Operator",
      experienceLevel: "Senior",
      missionContext: "Conflict",
      responseDepth: "Balanced",
      priorityLenses: ["Threat Activity", "Human Activity", "Infrastructure"],
    }
    savePersona(demoPersona)
    setInitializing(demoPersona)
  }

  const toggleLens = (lens: PriorityLens) => {
    if (priorityLenses.includes(lens)) {
      setPriorityLenses(priorityLenses.filter(l => l !== lens))
    } else if (priorityLenses.length < 3) {
      setPriorityLenses([...priorityLenses, lens])
    }
  }

  const effectiveLenses = priorityLenses.length > 0
    ? priorityLenses
    : role ? PRIORITY_LENS_DEFAULTS[role] : []

  const resolvedHorizon: TemporalHorizon | null = temporalHorizon
    ?? (role ? TEMPORAL_HORIZON_DEFAULTS[role] : null)

  const canSubmit = !!(role && experienceLevel && missionContext)

  const handleComplete = () => {
    if (!canSubmit || !role || !experienceLevel || !missionContext) return
    const persona: UserPersona = {
      callsign: callsign.trim() || "Analyst",
      role,
      experienceLevel,
      missionContext,
      temporalHorizon: temporalHorizon ?? undefined,
      responseDepth,
      priorityLenses: priorityLenses.length > 0 ? priorityLenses : PRIORITY_LENS_DEFAULTS[role],
    }
    savePersona(persona)
    setInitializing(persona)
  }

  if (initializing) {
    return (
      <InitializationSequence
        persona={initializing}
        onComplete={() => onComplete(initializing)}
      />
    )
  }

  return (
    <div ref={formRef} className="fixed inset-0 z-50 bg-background overflow-y-auto">

      {/* Ambient background layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 0%, hsl(217 91% 60% / 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, hsl(217 91% 60% / 0.04) 0%, transparent 50%),
            linear-gradient(hsl(217 91% 60% / 0.025) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217 91% 60% / 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
        }}
      />

      <div className="relative min-h-screen max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10 pb-5 border-b border-border/60">
          <div className="flex items-center gap-4">
            {/* Shield icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground">GuideRight</h1>
                <Badge className="text-[9px] font-mono h-4 px-1.5 bg-primary/10 text-primary/80 border-primary/20 no-default-active-elevate no-default-hover-elevate">
                  v2
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground tracking-widest uppercase font-medium">
                Mission Configuration System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecommendedProfile}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 bg-muted/30 text-muted-foreground text-xs font-semibold tracking-wide hover-elevate active-elevate-2 transition-all"
            >
              <Zap className="h-3 w-3" />
              Recommended Profile
            </button>
            <button
              onClick={handleLaunchDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-green-500/50 bg-green-500/10 text-green-400 text-xs font-bold tracking-widest uppercase hover-elevate active-elevate-2 transition-all"
              style={{ boxShadow: "0 0 16px hsl(142 70% 45% / 0.2)" }}
            >
              <Play className="h-3.5 w-3.5 fill-green-400" />
              Launch Demo
            </button>
          </div>
        </div>

        <div className="flex gap-10 items-start">

          {/* ── Left column: Form ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-12">

            {/* SECTION 1 — Define Mission Profile */}
            <section>
              <SectionLabel step="01" title="Define Mission Profile" />
              <p className="text-xs text-muted-foreground/70 mb-6 max-w-lg">
                GuideRight adapts vocabulary, response format, and quick action priorities to your role and operational identity.
              </p>

              {/* Callsign */}
              <div className="mb-6">
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 block mb-2">
                  Callsign / Name <span className="font-normal opacity-60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                  placeholder="e.g. Sheriff, Archer, Delta-6"
                  maxLength={32}
                  autoFocus
                  className="w-full max-w-xs px-3 py-2 text-sm bg-muted/30 border border-border/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/30 text-foreground transition-colors"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 block mb-2.5">
                  Mission Role <span className="text-destructive/70">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <RoleCard
                      key={r}
                      label={r}
                      description={ROLE_DESCRIPTIONS[r]}
                      selected={role === r}
                      onClick={() => setRole(r)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 2 — Set Analytic Posture */}
            <section>
              <SectionLabel step="02" title="Set Analytic Posture" />
              <p className="text-xs text-muted-foreground/70 mb-6 max-w-lg">
                Define how GuideRight calibrates response depth, language complexity, and temporal framing to your context.
              </p>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 block mb-2.5">
                  Experience Level <span className="text-destructive/70">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Junior", "Intermediate", "Senior", "Expert"] as ExperienceLevel[]).map(level => {
                    const descriptions: Record<ExperienceLevel, string> = {
                      "Junior": "Guided context and terminology",
                      "Intermediate": "Standard operational language",
                      "Senior": "Direct, peer-level analysis",
                      "Expert": "Raw conclusions, concise evidence",
                    }
                    return (
                      <PostureCard
                        key={level}
                        label={level}
                        description={descriptions[level]}
                        selected={experienceLevel === level}
                        onClick={() => setExperienceLevel(level)}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Mission Context */}
              <div className="mb-6">
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 block mb-2.5">
                  Mission Context <span className="text-destructive/70">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MISSION_CONTEXTS.map(ctx => (
                    <PostureCard
                      key={ctx}
                      label={ctx}
                      description={CONTEXT_DESCRIPTIONS[ctx]}
                      selected={missionContext === ctx}
                      onClick={() => setMissionContext(ctx)}
                    />
                  ))}
                </div>
              </div>

              {/* Response Depth */}
              <div className="mb-6">
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 block mb-2.5">
                  Response Depth
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["Executive Summary", "Balanced", "Deep Analysis"] as ResponseDepth[]).map(depth => (
                    <PostureCard
                      key={depth}
                      label={depth}
                      description={DEPTH_DESCRIPTIONS[depth]}
                      selected={responseDepth === depth}
                      onClick={() => setResponseDepth(depth)}
                    />
                  ))}
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <label className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 block mb-2.5">
                  Default Time Horizon
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HORIZON_OPTIONS.map(opt => (
                    <PostureCard
                      key={opt.label}
                      label={opt.label}
                      description={opt.description}
                      selected={temporalHorizon === opt.value}
                      onClick={() => setTemporalHorizon(opt.value)}
                    />
                  ))}
                </div>
                {resolvedHorizon && temporalHorizon === null && (
                  <p className="text-[11px] text-muted-foreground/50 mt-2.5 font-mono">
                    Role default: <span className="text-muted-foreground/80">{TEMPORAL_HORIZON_LABELS[resolvedHorizon]}</span>
                  </p>
                )}
              </div>
            </section>

            {/* SECTION 3 — Select Priority Lenses */}
            <section>
              <SectionLabel step="03" title="Select Priority Lenses" />
              <p className="text-xs text-muted-foreground/70 mb-6 max-w-lg">
                Select up to 3 analytic dimensions to emphasize. Quick actions, analysis framing, and source weighting adapt to your selection.
              </p>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_LENSES.map(lens => {
                  const isSelected = priorityLenses.includes(lens)
                  const isDefault = !priorityLenses.length && role && PRIORITY_LENS_DEFAULTS[role]?.includes(lens)
                  const isDisabled = !isSelected && priorityLenses.length >= 3
                  return (
                    <button
                      key={lens}
                      onClick={() => !isDisabled && toggleLens(lens)}
                      disabled={isDisabled}
                      className={cn(
                        "px-3 py-2 rounded-md border text-sm font-medium transition-all duration-150",
                        isSelected
                          ? "border-primary/60 bg-gradient-to-r from-primary/20 to-primary/8 text-foreground shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                          : isDisabled
                          ? "border-border/30 bg-transparent text-muted-foreground/30 cursor-not-allowed"
                          : "border-border/60 bg-muted/20 text-foreground/80 hover-elevate cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
                        <span className="text-xs">{lens}</span>
                        {isDefault && !isSelected && (
                          <span className="text-[9px] text-muted-foreground/40 font-normal">(role default)</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {priorityLenses.length === 3 && (
                <p className="text-[11px] text-muted-foreground/50 mt-3 font-mono">
                  Maximum 3 lenses. Deselect one to change.
                </p>
              )}
            </section>

            {/* Submit CTA */}
            <div className="pt-2 pb-12">
              {!canSubmit && (
                <p className="text-[11px] text-muted-foreground/40 mb-3 font-mono">
                  Complete Mission Role, Experience Level, and Mission Context to continue.
                </p>
              )}
              <div className="relative inline-block">
                {canSubmit && (
                  <div className="absolute inset-0 bg-primary/25 rounded-md blur-md" />
                )}
                <Button
                  className="relative w-full sm:w-auto sm:min-w-72 gap-2.5 font-semibold tracking-wide"
                  disabled={!canSubmit}
                  onClick={handleComplete}
                  size="lg"
                >
                  Enter GuideRight Workspace
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* ── Right column: Profile Preview ──────────────────────────── */}
          <div className="hidden lg:block w-80 xl:w-84 shrink-0 sticky top-8">
            <ProfilePreview
              callsign={callsign}
              role={role}
              experienceLevel={experienceLevel}
              missionContext={missionContext}
              responseDepth={responseDepth}
              resolvedHorizon={resolvedHorizon}
              effectiveLenses={effectiveLenses}
              lensesCustomized={priorityLenses.length > 0}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ step, title }: { step: string; title: string }) {
  return (
    <div className="relative mb-5">
      {/* Background oversized step number */}
      <div
        className="absolute -top-3 left-0 font-black font-mono leading-none select-none pointer-events-none"
        style={{ fontSize: "5rem", color: "hsl(var(--foreground) / 0.04)" }}
      >
        {step}
      </div>
      <div className="relative flex items-center gap-3 pt-1">
        <span className="text-[10px] font-bold tracking-[0.25em] text-primary/40 font-mono tabular-nums shrink-0">{step}</span>
        <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-foreground/80 shrink-0">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
      </div>
    </div>
  )
}

function RoleCard({
  label, description, selected, onClick
}: { label: string; description: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-md border text-sm transition-all duration-150",
        selected
          ? "border-primary/50 bg-gradient-to-br from-primary/18 to-primary/5 text-foreground shadow-[0_0_16px_hsl(var(--primary)/0.12)]"
          : "border-border/60 bg-muted/15 text-foreground hover-elevate"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("font-semibold text-sm leading-tight", selected ? "text-primary" : "text-foreground/90")}>
          {label}
        </span>
        <div className={cn(
          "shrink-0 flex items-center justify-center w-4 h-4 rounded-full border transition-all",
          selected
            ? "bg-primary border-primary"
            : "border-border/50 bg-transparent"
        )}>
          {selected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>
      <div className={cn(
        "text-[11px] mt-1 leading-snug",
        selected ? "text-muted-foreground/90" : "text-muted-foreground/50"
      )}>
        {description}
      </div>
    </button>
  )
}

function PostureCard({
  label, description, selected, onClick
}: { label: string; description: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-md border text-sm transition-all duration-150",
        selected
          ? "border-primary/50 bg-gradient-to-br from-primary/18 to-primary/5 text-foreground shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
          : "border-border/60 bg-muted/15 text-foreground hover-elevate"
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className={cn("font-semibold text-xs leading-tight", selected ? "text-primary" : "text-foreground/90")}>
          {label}
        </span>
        <div className={cn(
          "shrink-0 flex items-center justify-center w-3.5 h-3.5 rounded-full border transition-all",
          selected ? "bg-primary border-primary" : "border-border/50 bg-transparent"
        )}>
          {selected && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
          )}
        </div>
      </div>
      <div className={cn(
        "text-[10px] mt-1 leading-snug",
        selected ? "text-muted-foreground/80" : "text-muted-foreground/45"
      )}>
        {description}
      </div>
    </button>
  )
}

function ProfilePreview({
  callsign, role, experienceLevel, missionContext, responseDepth,
  resolvedHorizon, effectiveLenses, lensesCustomized
}: {
  callsign: string
  role: Role | null
  experienceLevel: ExperienceLevel | null
  missionContext: MissionContext | null
  responseDepth: ResponseDepth
  resolvedHorizon: TemporalHorizon | null
  effectiveLenses: PriorityLens[]
  lensesCustomized: boolean
}) {
  const displayCallsign = callsign.trim() || "Analyst"
  const optimizations = role ? ROLE_OPTIMIZATIONS[role] : null
  const isReady = !!(role && experienceLevel && missionContext)

  return (
    <div className="rounded-md border border-border/60 overflow-hidden bg-[hsl(224_71%_3%)]">
      {/* Console-style header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="h-3 w-3 text-primary/50" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
            Workspace Configuration
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full transition-all",
            isReady ? "bg-green-500 shadow-[0_0_6px_hsl(142_71%_45%)]" : "bg-muted-foreground/30"
          )} />
          <span className={cn(
            "text-[9px] font-mono tracking-widest uppercase",
            isReady ? "text-green-400/80" : "text-muted-foreground/40"
          )}>
            {isReady ? "READY" : "INCOMPLETE"}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Identity block */}
        <div className="space-y-0.5">
          <ConsoleRow label="OPERATOR" value={displayCallsign} active />
          <ConsoleRow label="ROLE" value={role ?? null} active={!!role} />
          <ConsoleRow label="EXPERIENCE" value={experienceLevel ?? null} active={!!experienceLevel} />
          <ConsoleRow label="CONTEXT" value={missionContext ?? null} active={!!missionContext} />
        </div>

        <div className="h-px bg-border/40" />

        {/* Posture block */}
        <div className="space-y-0.5">
          <ConsoleRow label="DEPTH" value={responseDepth} />
          <ConsoleRow
            label="TIME WINDOW"
            value={resolvedHorizon ? TEMPORAL_HORIZON_LABELS[resolvedHorizon] : "Role default"}
          />
        </div>

        {/* Lenses */}
        {effectiveLenses.length > 0 && (
          <>
            <div className="h-px bg-border/40" />
            <div>
              <p className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase text-muted-foreground/40 mb-2">
                Priority Lenses {!lensesCustomized && <span className="font-normal opacity-70">· role defaults</span>}
              </p>
              <div className="space-y-1">
                {effectiveLenses.map((lens, i) => (
                  <div key={lens} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-primary/30 w-3 tabular-nums">{i + 1}</span>
                    <div className="h-px w-2 bg-primary/20" />
                    <span className="text-[11px] text-foreground/70 font-medium">{lens}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Optimizations */}
        {optimizations && (
          <>
            <div className="h-px bg-border/40" />
            <div>
              <p className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase text-muted-foreground/40 mb-2">
                Optimized For
              </p>
              <div className="space-y-1.5">
                {optimizations.map(opt => (
                  <div key={opt} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1 w-1 rounded-full bg-primary/30 shrink-0" />
                    <span className="text-[11px] text-muted-foreground/60 leading-snug">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Readiness */}
        {isReady && (
          <>
            <div className="h-px bg-border/40" />
            <div className="flex items-center gap-2 p-2 rounded bg-green-500/5 border border-green-500/15">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-subtle shrink-0" />
              <span className="text-[10px] font-mono text-green-400/70 leading-tight">
                Profile ready — workspace configured for {role}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ConsoleRow({
  label, value, active = false
}: {
  label: string
  value: string | null
  active?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5">
      <span className="text-[9px] font-mono font-bold tracking-[0.14em] text-muted-foreground/35 shrink-0">
        {label}
      </span>
      <span className={cn(
        "text-[11px] font-mono text-right truncate max-w-[160px]",
        value && active ? "text-foreground/90 font-medium" : "text-muted-foreground/35 italic"
      )}>
        {value ?? "—"}
      </span>
    </div>
  )
}

