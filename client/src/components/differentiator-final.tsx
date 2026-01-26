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
          width: "1200px",
          background: "linear-gradient(180deg, #0a1628 0%, #0f1d32 100%)",
          padding: "36px 48px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ 
          textAlign: "center",
          marginBottom: "24px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "8px"
          }}>
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div>
              <h1 style={{ 
                fontSize: "28px", 
                fontWeight: 700, 
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: 0
              }}>
                GuideRight Development Methodology
              </h1>
              <div style={{
                fontSize: "15px",
                color: "#94a3b8",
                fontWeight: 500
              }}>
                Efficient, Accurate, Rapid Transition from Research to Operations
              </div>
            </div>
          </div>
        </div>

        {/* Main Flow Diagram */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr 240px",
          gap: "20px",
          alignItems: "stretch",
          position: "relative",
          marginBottom: "20px"
        }}>

          {/* Left Column - Team */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Industry Leadership */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "16px"
            }}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 700, 
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px"
              }}>
                Industry Leadership
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                Aplus Capabilities LLC
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>
                Offset3 LLC
              </div>
              <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 500 }}>
                Military-Led Small Business
              </div>
              <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 500 }}>
                Certified Professional Innovators
              </div>
            </div>

            {/* Practitioner Input */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.08) 100%)",
              border: "2px solid rgba(59,130,246,0.4)",
              borderRadius: "10px",
              padding: "16px",
              position: "relative",
              flex: 1
            }}>
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "12px",
                background: "#3b82f6",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "10px",
                textTransform: "uppercase"
              }}>
                Continuous
              </div>
              
              <div style={{ 
                fontSize: "12px", 
                fontWeight: 700, 
                color: "#60a5fa",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Practitioner Grounding
              </div>
              
              {[
                "Intelligence Analysts",
                "Special Ops Personnel", 
                "Scenario Interviews",
                "Feedback Loops"
              ].map(item => (
                <div key={item} style={{ 
                  fontSize: "13px", 
                  color: "#ffffff",
                  fontWeight: 500,
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#60a5fa" }} />
                  {item}
                </div>
              ))}
            </div>

            {/* Data Sources */}
            <div style={{ 
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "14px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: "8px" }}>
                Multi-Modal Data
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {["GDELT", "ACLED", "News", "Social"].map(src => (
                  <span key={src} style={{
                    fontSize: "11px", fontWeight: 600, color: "#ffffff",
                    background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "5px"
                  }}>{src}</span>
                ))}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: "8px" }}>
                Industry Partners
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {["Fraym", "Seerist", "Sprinklr"].map(src => (
                  <span key={src} style={{
                    fontSize: "11px", fontWeight: 600, color: "#ffffff",
                    background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "5px"
                  }}>{src}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Process Flow */}
          <div style={{ position: "relative" }}>
            
            {/* Flow SVG Background */}
            <svg style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none"
            }} viewBox="0 0 600 480" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                </linearGradient>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                </marker>
                <marker id="arrowheadGreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
                </marker>
              </defs>
              
              {/* Left to center flow */}
              <path d="M -20 120 Q 80 120 150 80" fill="none" stroke="url(#flowGrad1)" strokeWidth="3" strokeDasharray="8 4" markerEnd="url(#arrowhead)" />
              <path d="M -20 240 Q 120 240 200 200" fill="none" stroke="url(#flowGrad1)" strokeWidth="3" strokeDasharray="8 4" markerEnd="url(#arrowhead)" />
              
              {/* Center to right flow */}
              <path d="M 400 200 Q 480 160 620 120" fill="none" stroke="url(#flowGrad1)" strokeWidth="3" strokeDasharray="8 4" markerEnd="url(#arrowheadGreen)" />
              <path d="M 400 280 Q 500 280 620 240" fill="none" stroke="url(#flowGrad1)" strokeWidth="3" strokeDasharray="8 4" markerEnd="url(#arrowheadGreen)" />
              
              {/* Feedback loop - bottom */}
              <path d="M 500 400 Q 300 460 100 400" fill="none" stroke="url(#flowGrad2)" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.7" />
              <text x="300" y="450" fill="#a855f7" fontSize="11" fontWeight="600" textAnchor="middle">ITERATIVE FEEDBACK</text>
            </svg>

            {/* Research Stage */}
            <div style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(59,130,246,0.08) 100%)",
              border: "2px solid rgba(168,85,247,0.35)",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "12px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-10px",
                left: "16px",
                background: "#a855f7",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "8px",
                textTransform: "uppercase"
              }}>Research</div>
              
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 700, 
                color: "#c084fc",
                marginBottom: "8px",
                marginTop: "4px"
              }}>
                Academic Research Partners
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
                <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>
                  University of Nebraska–Lincoln
                </div>
                <div style={{ fontSize: "12px", color: "#e9d5ff" }}>AI/ML Evaluation Methods</div>
                <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>
                  The Citadel
                </div>
                <div style={{ fontSize: "12px", color: "#e9d5ff" }}>Reasoning & Uncertainty</div>
              </div>
              
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "12px",
                background: "#a855f7",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "8px",
                textTransform: "uppercase"
              }}>Iterative</div>
            </div>

            {/* Applied Research / Platform */}
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(34,197,94,0.08) 100%)",
              border: "2px solid rgba(59,130,246,0.4)",
              borderRadius: "12px",
              padding: "16px 18px",
              marginBottom: "12px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-10px",
                left: "16px",
                background: "linear-gradient(90deg, #3b82f6, #22c55e)",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: "8px",
                textTransform: "uppercase"
              }}>Applied Research → Development</div>
              
              <div style={{ 
                fontSize: "18px", 
                fontWeight: 700, 
                color: "#ffffff",
                marginBottom: "4px",
                marginTop: "6px"
              }}>
                GuideRight Platform
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: "#94a3b8",
                marginBottom: "12px"
              }}>
                Battlespace Awareness Tactical Assistant
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                {[
                  "PMESII Assessment Query",
                  "AI Streaming Responses",
                  "SCEIGE Six-Factor Analysis",
                  "Multimodal AI (Gemini + OpenAI)",
                  "ODIN Country Analysis",
                  "Multi-Source Fusion",
                  "Dynamic Map Overlays",
                  "Automated Risk Assessment"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "12px", 
                    color: "#e2e8f0",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable Products */}
            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)",
              border: "2px solid rgba(34,197,94,0.4)",
              borderRadius: "10px",
              padding: "14px 16px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-10px",
                left: "16px",
                background: "#22c55e",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "8px",
                textTransform: "uppercase"
              }}>Deliverable Products</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginTop: "8px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", marginBottom: "6px" }}>
                    TA5 Geospatial Analytics
                  </div>
                  {["Web + Mobile Platform", "Chat & Voice Queries", "Interactive Mapping"].map(item => (
                    <div key={item} style={{ fontSize: "11px", color: "#e2e8f0", marginBottom: "3px" }}>• {item}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", marginBottom: "6px" }}>
                    TA6 SITEMPs & Reports
                  </div>
                  {["CUB-Ready Products", "Annotated Maps", "Actor Profiles"].map(item => (
                    <div key={item} style={{ fontSize: "11px", color: "#e2e8f0", marginBottom: "3px" }}>• {item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Outcomes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Transition Speed */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%)",
              border: "2px solid rgba(34,197,94,0.4)",
              borderRadius: "10px",
              padding: "16px"
            }}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 700, 
                color: "#4ade80",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px"
              }}>
                Transition Advantage
              </div>
              
              {[
                { label: "Efficient", desc: "Integrated team, no handoffs" },
                { label: "Accurate", desc: "Practitioner-validated" },
                { label: "Rapid", desc: "Continuous iteration cycle" }
              ].map(item => (
                <div key={item.label} style={{ marginBottom: "10px" }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: 700, 
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#a7f3d0", marginLeft: "24px" }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Reviewer Takeaway */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "16px",
              flex: 1
            }}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 700, 
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px"
              }}>
                Reviewer Takeaway
              </div>
              
              {[
                "Built with real practitioners",
                "Academic rigor + field realism",
                "Continuous analyst engagement",
                "Proven transition pathway"
              ].map(item => (
                <div key={item} style={{ 
                  fontSize: "13px", 
                  color: "#ffffff",
                  fontWeight: 500,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span style={{ color: "#60a5fa", fontWeight: 700 }}>→</span>
                  {item}
                </div>
              ))}
            </div>

            {/* Key Differentiators */}
            <div style={{ 
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "10px",
              padding: "14px"
            }}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 700, 
                color: "#60a5fa",
                textTransform: "uppercase",
                marginBottom: "8px"
              }}>
                Key Differentiators
              </div>
              {[
                "Human-in-the-loop design",
                "Multi-source confidence fusion",
                "Operationally grounded"
              ].map(item => (
                <div key={item} style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: 500, marginBottom: "4px" }}>
                  • {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Purpose Statement */}
        <div style={{
          padding: "14px 24px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "16px"
        }}>
          <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>
            Purpose: Support human judgment in complex, uncertain environments.
          </div>
          <div style={{ fontSize: "13px", color: "#fbbf24", fontWeight: 600, fontStyle: "italic", marginTop: "4px" }}>
            Not autonomous. Not predictive. Not targeting.
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: "flex",
          justifyContent: "center"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "5px 16px",
            border: "2px solid #22c55e",
            borderRadius: "4px"
          }}>
            UNCLASSIFIED
          </div>
        </div>
      </div>
    </div>
  )
}
