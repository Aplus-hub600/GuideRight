import { useState } from "react"
import { Shield, ChevronRight, CheckCircle2, Layers } from "lucide-react"
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
  { label: "Mission Adaptive", value: null, description: "GuideRight selects window based on your role and query" },
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

  const handleRecommendedProfile = () => {
    setRole(RECOMMENDED.role)
    setExperienceLevel(RECOMMENDED.experienceLevel)
    setMissionContext(RECOMMENDED.missionContext)
    setResponseDepth(RECOMMENDED.responseDepth)
    setTemporalHorizon(RECOMMENDED.temporalHorizon)
    setPriorityLenses(RECOMMENDED.priorityLenses)
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
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/8 border border-primary/15 rounded-md">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground">GuideRight</h1>
              <p className="text-[11px] text-muted-foreground tracking-wide">Mission Configuration System</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecommendedProfile}
            className="text-xs gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Use Recommended Profile
          </Button>
        </div>

        <div className="flex gap-8 items-start">

          {/* ── Left column: Form ── */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* SECTION 1 ─ Define Mission Profile */}
            <section>
              <SectionLabel step="01" title="Define Mission Profile" />
              <p className="text-xs text-muted-foreground mb-5">
                GuideRight adapts vocabulary, response format, and quick actions to your role and identity.
              </p>

              {/* Callsign */}
              <div className="mb-5">
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
                  Callsign / Name <span className="font-normal opacity-60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                  placeholder="e.g. Sheriff, Archer, Delta-6"
                  maxLength={32}
                  autoFocus
                  className="w-full max-w-sm px-3 py-2 text-sm bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
                  Mission Role <span className="text-destructive">*</span>
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

            {/* SECTION 2 ─ Set Analytic Posture */}
            <section>
              <SectionLabel step="02" title="Set Analytic Posture" />
              <p className="text-xs text-muted-foreground mb-5">
                Define how GuideRight calibrates depth, language, and temporal framing for your context.
              </p>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
                  Experience Level <span className="text-destructive">*</span>
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
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
                  Mission Context <span className="text-destructive">*</span>
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
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
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

              {/* Default Time Horizon */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
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
                  <p className="text-[11px] text-muted-foreground/60 mt-2">
                    Based on your role, GuideRight will default to the <span className="font-medium text-muted-foreground">{TEMPORAL_HORIZON_LABELS[resolvedHorizon]}</span>.
                  </p>
                )}
              </div>
            </section>

            {/* SECTION 3 ─ Select Priority Lenses */}
            <section>
              <SectionLabel step="03" title="Select Priority Lenses" />
              <p className="text-xs text-muted-foreground mb-5">
                Select up to 3 analytic dimensions to emphasize. If none are selected, GuideRight uses your role defaults.
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
                        "px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : isDefault
                          ? "border-border bg-muted/20 text-foreground opacity-70"
                          : isDisabled
                          ? "border-border bg-transparent text-muted-foreground/40 cursor-not-allowed"
                          : "border-border bg-muted/20 text-foreground hover-elevate cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
                        <span className="text-xs">{lens}</span>
                        {isDefault && !isSelected && (
                          <span className="text-[9px] text-muted-foreground/50 font-normal">(role default)</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              {priorityLenses.length === 3 && (
                <p className="text-[11px] text-muted-foreground/60 mt-3">Maximum 3 lenses selected.</p>
              )}
            </section>

            {/* Submit */}
            <div className="pt-2 pb-10 space-y-3">
              {!canSubmit && (
                <p className="text-xs text-muted-foreground/60">
                  Complete Mission Role, Experience Level, and Mission Context to continue.
                </p>
              )}
              <Button
                className="w-full sm:w-auto sm:min-w-64 gap-2 font-medium"
                disabled={!canSubmit}
                onClick={handleComplete}
              >
                Enter GuideRight Workspace
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Right column: Profile Preview ── */}
          <div className="hidden lg:block w-80 xl:w-88 shrink-0 sticky top-8">
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

// ── Sub-components ────────────────────────────────────────────

function SectionLabel({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground/50 font-mono">{step}</span>
      <div className="h-px flex-1 bg-border" />
      <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-foreground">{title}</h2>
      <div className="h-px w-4 bg-border" />
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
        "w-full text-left px-3 py-2.5 rounded-md border text-sm transition-colors",
        selected
          ? "border-primary bg-primary/8 text-foreground"
          : "border-border bg-muted/20 text-foreground hover-elevate"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{label}</span>
        {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
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
        "w-full text-left px-3 py-2.5 rounded-md border text-sm transition-colors",
        selected
          ? "border-primary bg-primary/8 text-foreground"
          : "border-border bg-muted/20 text-foreground hover-elevate"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium text-xs">{label}</span>
        {selected && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{description}</div>
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

  return (
    <div className="border border-border rounded-md bg-muted/10">
      {/* Preview header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
            Workspace Configuration
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Identity */}
        <div>
          <PreviewRow label="Operator" value={displayCallsign} />
          <PreviewRow
            label="Role"
            value={role ?? <Placeholder />}
            highlight={!!role}
          />
          <PreviewRow
            label="Experience"
            value={experienceLevel ?? <Placeholder />}
            highlight={!!experienceLevel}
          />
          <PreviewRow
            label="Context"
            value={missionContext ?? <Placeholder />}
            highlight={!!missionContext}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Posture */}
        <div>
          <PreviewRow label="Response Depth" value={responseDepth} />
          <PreviewRow
            label="Time Window"
            value={resolvedHorizon
              ? TEMPORAL_HORIZON_LABELS[resolvedHorizon]
              : "Role default"}
          />
        </div>

        {/* Lenses */}
        {effectiveLenses.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                Priority Lenses {!lensesCustomized && <span className="font-normal opacity-60">(role defaults)</span>}
              </p>
              <div className="space-y-1">
                {effectiveLenses.map((lens, i) => (
                  <div key={lens} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground/40 w-4">{i + 1}</span>
                    <span className="text-[11px] text-foreground">{lens}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Optimizations */}
        {optimizations && (
          <>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                GuideRight will optimize for
              </p>
              <div className="space-y-1.5">
                {optimizations.map(opt => (
                  <div key={opt} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                    <span className="text-[11px] text-muted-foreground leading-snug">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Readiness indicator */}
        {role && experienceLevel && missionContext && (
          <>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-muted-foreground/70">
                Profile ready — workspace configured for {role}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PreviewRow({
  label, value, highlight = false
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-[10px] text-muted-foreground/60 shrink-0">{label}</span>
      <span className={cn(
        "text-[11px] text-right truncate max-w-[160px]",
        highlight ? "text-foreground font-medium" : "text-muted-foreground"
      )}>
        {value}
      </span>
    </div>
  )
}

function Placeholder() {
  return <span className="text-muted-foreground/30 italic text-[10px]">not selected</span>
}
