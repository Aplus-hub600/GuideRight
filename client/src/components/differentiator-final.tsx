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
          background: "linear-gradient(180deg, #0a1628 0%, #1a2d4a 50%, #0f1f35 100%)",
          padding: "48px 56px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Subtle texture overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
          pointerEvents: "none"
        }} />

        {/* Header */}
        <div style={{ 
          textAlign: "center",
          marginBottom: "32px",
          position: "relative"
        }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "8px"
          }}>
            Development Methodology
          </div>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: 700, 
            color: "#ffffff",
            letterSpacing: "-0.02em",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px"
          }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.5" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Practitioner-Grounded, Interdisciplinary Development
          </h1>
          <div style={{
            fontSize: "16px",
            color: "#cbd5e1",
            marginTop: "8px",
            fontWeight: 500
          }}>
            Research & Transition Capability
          </div>
        </div>

        {/* Main Orbital Layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 260px",
          gap: "28px",
          alignItems: "start",
          position: "relative"
        }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Industry Leadership */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "20px"
            }}>
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 700, 
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px"
              }}>
                Industry Leadership
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  Aplus Capabilities LLC
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  Offset3 LLC
                </div>
              </div>
              <div style={{ 
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex", 
                flexDirection: "column", 
                gap: "6px" 
              }}>
                {["Small Business, Military-Led", "Certified Professional Innovators"].map(item => (
                  <div key={item} style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 500 }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Practitioner Grounding */}
            <div style={{ 
              background: "rgba(59, 130, 246, 0.12)",
              border: "2px solid rgba(59, 130, 246, 0.35)",
              borderRadius: "10px",
              padding: "20px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "14px",
                background: "#3b82f6",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Continuous
              </div>
              
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 700, 
                color: "#60a5fa",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px"
              }}>
                Practitioner Grounding
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Intelligence Analysts",
                  "Special Operations Personnel", 
                  "Scenario-Driven Interviews",
                  "Analyst Feedback Loops"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "14px", 
                    color: "#ffffff",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ 
                      width: "6px", 
                      height: "6px", 
                      borderRadius: "50%", 
                      background: "#60a5fa",
                      flexShrink: 0
                    }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Modal Data Sources */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "18px"
            }}>
              <div style={{ 
                fontSize: "12px", 
                fontWeight: 700, 
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Multi-Modal Data Sources
              </div>
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "8px",
                marginBottom: "14px"
              }}>
                {["GDELT", "ACLED", "News", "Social"].map(src => (
                  <span key={src} style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.08)",
                    padding: "5px 12px",
                    borderRadius: "6px"
                  }}>
                    {src}
                  </span>
                ))}
              </div>
              <div style={{ 
                fontSize: "12px", 
                fontWeight: 700, 
                color: "#f87171",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Industry Data Partners
              </div>
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "8px" 
              }}>
                {["Fraym", "Seerist", "Sprinklr"].map(src => (
                  <span key={src} style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.08)",
                    padding: "5px 12px",
                    borderRadius: "6px"
                  }}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Platform Features */}
          <div style={{ position: "relative" }}>
            
            {/* TA5 Geospatial Analytics Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.1) 100%)",
              border: "2px solid rgba(59,130,246,0.3)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "16px"
            }}>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: 700, 
                color: "#60a5fa",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                TA5 Geospatial Analytics Platform
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: "8px"
              }}>
                {[
                  "Web-Based + Mobile",
                  "Chat & Voice Queries", 
                  "Dynamic Overlays",
                  "Interactive Mapping"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "13px", 
                    color: "#ffffff",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{ 
                      width: "6px", 
                      height: "6px", 
                      borderRadius: "50%", 
                      background: "#60a5fa",
                      flexShrink: 0
                    }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* GuideRight Features Card */}
            <div style={{ 
              background: "#0c1629",
              border: "2px solid rgba(34,197,94,0.3)",
              borderRadius: "10px",
              padding: "18px",
              marginBottom: "16px"
            }}>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: 700, 
                color: "#4ade80",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px"
              }}>
                GuideRight: Existing Features
              </div>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 16px"
              }}>
                {[
                  "PMESII Assessment Query",
                  "AI Streaming Responses",
                  "SCEIGE Six-Factor Analysis",
                  "Multimodal AI (Gemini + OpenAI)",
                  "ODIN Country Analysis",
                  "Multi-Source Fusion",
                  "Data Source Indicators",
                  "Automated Risk Assessment"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "12px", 
                    color: "#e2e8f0",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Visual */}
            <div style={{ 
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "16px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                GuideRight Platform
              </div>
              <div style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "12px", fontWeight: 500 }}>
                Battlespace Awareness Tactical Assistant for Analyst/Operator
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                {["Human-in-the-Loop", "Explainable AI", "Scenario-Driven"].map(tag => (
                  <span key={tag} style={{ 
                    fontSize: "11px", 
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "rgba(59,130,246,0.2)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    padding: "5px 12px",
                    borderRadius: "12px"
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Purpose Statement */}
            <div style={{
              marginTop: "16px",
              padding: "14px 18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "14px", color: "#ffffff", marginBottom: "4px", fontWeight: 600 }}>
                Purpose: Support human judgment in complex, uncertain environments.
              </div>
              <div style={{ fontSize: "13px", color: "#fbbf24", fontStyle: "italic", fontWeight: 600 }}>
                Not autonomous. Not predictive. Not targeting.
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Academic Research */}
            <div style={{ 
              background: "rgba(168, 85, 247, 0.12)",
              border: "2px solid rgba(168, 85, 247, 0.35)",
              borderRadius: "10px",
              padding: "20px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-10px",
                right: "14px",
                background: "#a855f7",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Iterative
              </div>
              
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 700, 
                color: "#c084fc",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px"
              }}>
                Academic Research Partners
              </div>
              
              <div style={{ 
                fontSize: "16px", 
                color: "#ffffff",
                fontWeight: 600,
                lineHeight: "1.6",
                marginBottom: "14px"
              }}>
                University of Nebraska–Lincoln<br />
                The Citadel
              </div>
              
              <div style={{ 
                borderTop: "1px solid rgba(168, 85, 247, 0.2)",
                paddingTop: "12px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#c084fc", marginBottom: "8px" }}>
                  Research Contributions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    "AI/ML evaluation methods",
                    "Reasoning & uncertainty",
                    "Geospatial analysis",
                    "Research validation"
                  ].map(item => (
                    <div key={item} style={{ fontSize: "13px", color: "#e9d5ff", fontWeight: 500 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviewer Takeaway */}
            <div style={{ 
              background: "rgba(34, 197, 94, 0.12)",
              border: "2px solid rgba(34, 197, 94, 0.35)",
              borderRadius: "10px",
              padding: "20px"
            }}>
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 700, 
                color: "#4ade80",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "14px"
              }}>
                Reviewer Takeaway
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Built with real practitioners",
                  "Academic rigor + field realism",
                  "Continuous analyst engagement"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "14px", 
                    color: "#ffffff",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginTop: "1px", flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Differentiators */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "18px"
            }}>
              <div style={{ 
                fontSize: "12px", 
                fontWeight: 700, 
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px"
              }}>
                Key Differentiators
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Analyst-in-the-loop design",
                  "Multi-source confidence fusion",
                  "Operationally grounded"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "13px", 
                    color: "#e2e8f0",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: "14px" }}>→</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: "28px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "center"
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "6px 20px",
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
