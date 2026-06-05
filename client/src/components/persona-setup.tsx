import { useState } from "react"
import { Shield, ChevronRight, User, Crosshair, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ROLES, EXPERIENCE_LEVELS, MISSION_CONTEXTS,
  type Role, type ExperienceLevel, type MissionContext, type UserPersona,
  savePersona
} from "@/lib/persona"
import { InitializationSequence } from "./initialization-sequence"

interface PersonaSetupProps {
  onComplete: (persona: UserPersona) => void
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  "Intelligence Analyst": "Signal detection, source analysis, PMESII",
  "SOF Operator": "Direct action, rapid SA, movement analysis",
  "Commander": "Decision support, COA comparison, risk",
  "Civil Affairs Officer": "Human terrain, infrastructure, engagement",
  "Psychological Operations Officer": "Narratives, influence, sentiment",
  "Planner": "COA development, wargaming, logistics",
  "Security Cooperation Officer": "Partner forces, engagement windows",
  "Diplomatic Security Officer": "Threat to persons, facility security",
  "Executive Decision Maker": "BLUF only, top-line decisions",
  "Port Operations Analyst": "Vessel flow, yard, gate, disruption",
}

const CONTEXT_DESCRIPTIONS: Record<MissionContext, string> = {
  "Garrison": "Steady-state, home station",
  "Training": "Exercise or academic environment",
  "Deployment": "Forward-deployed, operational",
  "Crisis Response": "Immediate crisis, heightened urgency",
  "Planning": "Pre-mission or campaign planning",
  "Assessment": "Evaluation or survey mission",
  "Competition": "Gray zone, below threshold",
  "Conflict": "Active conflict environment",
  "Port Operations": "Terminal / logistics hub operations",
}

export function PersonaSetup({ onComplete }: PersonaSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [callsign, setCallsign] = useState("")
  const [role, setRole] = useState<Role | null>(null)
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [missionContext, setMissionContext] = useState<MissionContext | null>(null)
  const [initializing, setInitializing] = useState<UserPersona | null>(null)

  const handleComplete = () => {
    if (!role || !experienceLevel || !missionContext) return
    const persona: UserPersona = {
      callsign: callsign.trim() || "Analyst",
      role,
      experienceLevel,
      missionContext,
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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-md border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-foreground">GuideRight</h1>
            <p className="text-xs text-muted-foreground">Adaptive Mission Companion — Initial Configuration</p>
          </div>
          <div className="ml-auto flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={cn(
                "h-1 w-6 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )} />
            ))}
          </div>
        </div>

        {/* Step 1: Callsign */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step 1 of 4</span>
              </div>
              <h2 className="text-lg font-semibold">Identify yourself</h2>
              <p className="text-sm text-muted-foreground mt-1">
                GuideRight will address you by callsign and personalize responses over time.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">
                Callsign / Name
              </label>
              <input
                type="text"
                value={callsign}
                onChange={e => setCallsign(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setStep(2)}
                placeholder="e.g. Sheriff, Archer, Delta-6..."
                maxLength={32}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">Optional — leave blank to proceed as "Analyst"</p>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Role */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crosshair className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step 2 of 4</span>
              </div>
              <h2 className="text-lg font-semibold">Select your role</h2>
              <p className="text-sm text-muted-foreground mt-1">
                GuideRight will adapt vocabulary, response format, and quick actions to your community.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md border text-sm transition-colors hover-elevate",
                    role === r
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-muted/30 text-foreground hover:border-border"
                  )}
                >
                  <div className="font-medium">{r}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ROLE_DESCRIPTIONS[r]}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" disabled={!role} onClick={() => setStep(3)}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Experience Level */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step 3 of 4</span>
              </div>
              <h2 className="text-lg font-semibold">Experience level</h2>
              <p className="text-sm text-muted-foreground mt-1">
                GuideRight calibrates explanation depth and language complexity to your experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map(level => {
                const descriptions: Record<ExperienceLevel, string> = {
                  "Junior": "More context, guided analysis",
                  "Intermediate": "Standard operational language",
                  "Senior": "Direct, peer-level analysis",
                  "Expert": "Raw conclusions, no hand-holding",
                }
                return (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={cn(
                      "text-left px-3 py-3 rounded-md border text-sm transition-colors hover-elevate",
                      experienceLevel === level
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/30 text-foreground"
                    )}
                  >
                    <div className="font-medium">{level}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{descriptions[level]}</div>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1" disabled={!experienceLevel} onClick={() => setStep(4)}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Mission Context */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step 4 of 4</span>
              </div>
              <h2 className="text-lg font-semibold">Mission context</h2>
              <p className="text-sm text-muted-foreground mt-1">
                GuideRight adjusts urgency, tone, and prioritization to your operational environment.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {MISSION_CONTEXTS.map(ctx => (
                <button
                  key={ctx}
                  onClick={() => setMissionContext(ctx)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md border text-sm transition-colors hover-elevate",
                    missionContext === ctx
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-muted/30 text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ctx}</span>
                    {missionContext === ctx && (
                      <Badge variant="outline" className="text-xs h-5 border-primary/40 text-primary">Selected</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{CONTEXT_DESCRIPTIONS[ctx]}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Back</Button>
              <Button className="flex-1" disabled={!missionContext} onClick={handleComplete}>
                Initialize GuideRight
              </Button>
            </div>
          </div>
        )}

        {/* Profile summary at bottom of step 4 */}
        {step === 4 && role && experienceLevel && (
          <div className="mt-3 px-3 py-2 bg-muted/30 border border-border rounded-md">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">{callsign || "Analyst"}</Badge>
              <Badge variant="outline" className="text-xs">{role}</Badge>
              <Badge variant="outline" className="text-xs">{experienceLevel}</Badge>
              {missionContext && <Badge variant="outline" className="text-xs">{missionContext}</Badge>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
