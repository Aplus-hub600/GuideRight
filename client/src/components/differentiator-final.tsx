import { useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DifferentiatorFinal() {
  const containerRef = useRef<HTMLDivElement>(null)

  const exportAsPng = useCallback(async () => {
    if (!containerRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#0a1628",
        scale: 3,
        useCORS: true,
      })
      
      const link = document.createElement("a")
      link.download = "guideright-methodology-final.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <Button onClick={exportAsPng} size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Download Final PNG
      </Button>
      
      <div
        ref={containerRef}
        style={{ 
          width: "1100px",
          background: "linear-gradient(180deg, #0a1628 0%, #0d1a2d 100%)",
          padding: "32px 40px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
                GuideRight Development Approach
              </h1>
              <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                Our Key Differentiator: A Credible, Practitioner-Grounded Methodology
              </div>
            </div>
          </div>
        </div>

        {/* UNIQUE APPROACH - The Main Message */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(59,130,246,0.1) 50%, rgba(168,85,247,0.08) 100%)",
          border: "2px solid rgba(34,197,94,0.35)",
          borderRadius: "12px",
          padding: "20px 28px",
          marginBottom: "20px",
          position: "relative"
        }}>
          <div style={{ 
            position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #22c55e, #3b82f6)",
            padding: "5px 20px", borderRadius: "20px"
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              What Makes Us Different
            </span>
          </div>

          {/* Four Pillars of the Approach */}
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            
            {/* Pillar 1: Customer Discovery */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 10px",
                background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#f87171" strokeWidth="2" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f87171", marginBottom: "6px" }}>Customer Discovery</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>Special Operators</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>Intelligence Analysts</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>Real needs from real users</div>
            </div>

            {/* Pillar 2: Research Partners */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 10px",
                background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 12L20 7.5" stroke="#a855f7" strokeWidth="2" />
                  <path d="M12 12V21" stroke="#a855f7" strokeWidth="2" />
                  <path d="M12 12L4 7.5" stroke="#a855f7" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#a855f7", marginBottom: "6px" }}>Research Partners</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>The Citadel</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>University of Nebraska-Lincoln</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>Academic rigor & innovation</div>
            </div>

            {/* Pillar 3: Certified Innovators */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 10px",
                background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#60a5fa", marginBottom: "6px" }}>Certified Innovators</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>Aplus Capabilities LLC</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>Offset3 LLC</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>Professional innovation expertise</div>
            </div>

            {/* Pillar 4: Lean Small Business */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 10px",
                background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80", marginBottom: "6px" }}>Lean Small Business</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>Veteran-Led Teams</div>
              <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: 600, marginBottom: "3px" }}>Agile Development</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>Fast, efficient delivery</div>
            </div>
          </div>
        </div>

        {/* Iterative Cycle Flow */}
        <div style={{ 
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "16px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12C4 7.58172 7.58172 4 12 4C14.3894 4 16.5341 5.04752 18 6.70835" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M20 12C20 16.4183 16.4183 20 12 20C9.61062 20 7.46592 18.9525 6 17.2917" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="18 3, 21 7, 17 7" fill="#a855f7" />
                <polygon points="6 21, 3 17, 7 17" fill="#a855f7" />
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Continuous Iterative Development Cycle
              </span>
            </div>
          </div>

          {/* Cycle Stages */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {[
              { stage: "TA1", name: "Data Ingestion", color: "#a855f7" },
              { stage: "TA2", name: "SIGACT Analysis", color: "#a855f7" },
              { stage: "TA3", name: "REALM Processing", color: "#3b82f6" },
              { stage: "TA4", name: "Simulation", color: "#3b82f6" },
              { stage: "TA5", name: "Platform", color: "#22c55e" },
              { stage: "TA6", name: "Reports", color: "#22c55e" },
              { stage: "", name: "Field Deploy", color: "#f59e0b" },
              { stage: "", name: "Feedback", color: "#ef4444" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ 
                  background: `${item.color}20`, border: `2px solid ${item.color}60`,
                  borderRadius: "6px", padding: "6px 10px", textAlign: "center", minWidth: "90px"
                }}>
                  {item.stage && <div style={{ fontSize: "8px", fontWeight: 700, color: item.color }}>{item.stage}</div>}
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#ffffff" }}>{item.name}</div>
                </div>
                {i < 7 && (
                  <svg width="16" height="12" viewBox="0 0 16 12">
                    <polygon points="0 3, 10 3, 10 0, 16 6, 10 12, 10 9, 0 9" fill={item.color} opacity="0.7" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Loop back indicator */}
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(239,68,68,0.1)", border: "1px dashed rgba(239,68,68,0.4)",
              borderRadius: "20px", padding: "5px 16px"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 12C20 7.58 16.42 4 12 4C9.61 4 7.47 5.05 6 6.71" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 12C4 16.42 7.58 20 12 20C14.39 20 16.53 18.95 18 17.29" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                <polygon points="6 3, 3 7, 7 7" fill="#f87171" />
              </svg>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#f87171" }}>24-Hour Feedback Loop Back to Development</span>
            </div>
          </div>
        </div>

        {/* Bottom: Capabilities + Credibility */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          
          {/* Integrated Frameworks */}
          <div style={{ 
            flex: 1,
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "8px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Doctrinal Frameworks
            </div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              {["PMESII-PT", "ASCOPE", "CARVER"].map(fw => (
                <span key={fw} style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: "rgba(59,130,246,0.25)", padding: "4px 10px", borderRadius: "4px" }}>{fw}</span>
              ))}
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
              Multi-Modal Data
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {["Text", "Imagery", "Video", "Geospatial", "SIGACT", "Social"].map(src => (
                <span key={src} style={{ fontSize: "9px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", padding: "3px 6px", borderRadius: "4px" }}>{src}</span>
              ))}
            </div>
          </div>

          {/* Why This Approach is Credible */}
          <div style={{ 
            flex: 1.5,
            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.04) 100%)",
            border: "2px solid rgba(34,197,94,0.3)",
            borderRadius: "8px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Why This Approach is Credible
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Practitioner-First", desc: "Built with operators & analysts from day one" },
                { label: "Academic Rigor", desc: "Research-backed AI/ML development" },
                { label: "Veteran Leadership", desc: "Military experience driving requirements" },
                { label: "Lean & Agile", desc: "Small business speed, no bureaucracy" },
                { label: "Certified Innovation", desc: "Professional innovators, proven methods" },
                { label: "Continuous Feedback", desc: "24-hour model updates from field input" }
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: "2px", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>{item.label}</div>
                    <div style={{ fontSize: "9px", color: "#a7f3d0" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div style={{ 
            width: "200px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              The Result
            </div>
            {[
              { word: "Efficient", color: "#4ade80" },
              { word: "Accurate", color: "#60a5fa" },
              { word: "Rapid", color: "#fbbf24" }
            ].map(item => (
              <div key={item.word} style={{ fontSize: "16px", fontWeight: 700, color: item.color, marginBottom: "4px" }}>
                {item.word}
              </div>
            ))}
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Transition from research to operations</div>
          </div>
        </div>

        {/* Purpose Statement */}
        <div style={{
          padding: "10px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          textAlign: "center",
          marginBottom: "12px"
        }}>
          <div style={{ fontSize: "12px", color: "#ffffff", fontWeight: 600 }}>
            Purpose: Support human judgment in complex, uncertain operational environments.
          </div>
          <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 600, fontStyle: "italic", marginTop: "3px" }}>
            Not autonomous. Not predictive. Not targeting.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            fontSize: "10px", fontWeight: 700, color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase",
            padding: "4px 14px", border: "2px solid #22c55e", borderRadius: "4px"
          }}>
            UNCLASSIFIED
          </div>
        </div>
      </div>
    </div>
  )
}
