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

          {/* Center - Platform with Orbital Flow */}
          <div style={{ position: "relative" }}>
            
            {/* Circular Flow Label - Top */}
            <div style={{
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15, 23, 42, 0.95)",
              padding: "6px 20px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.15)",
              zIndex: 10
            }}>
              <span style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600 }}>
                Iterative, Analyst-Grounded Cycle
              </span>
            </div>

            {/* Orbital Ring */}
            <svg style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "460px",
              height: "360px",
              pointerEvents: "none"
            }} viewBox="0 0 460 360">
              <ellipse cx="230" cy="180" rx="220" ry="170" 
                fill="none" 
                stroke="url(#orbitalGradient)" 
                strokeWidth="2"
                strokeDasharray="10 5"
                opacity="0.5"
              />
              <defs>
                <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              {/* Flow arrows */}
              <path d="M 50 180 Q 230 40 410 180" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" />
              <path d="M 410 180 Q 230 320 50 180" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
            </svg>

            {/* Platform Card */}
            <div style={{ 
              background: "#0c1629",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5)",
              position: "relative",
              zIndex: 5,
              margin: "24px 0"
            }}>
              {/* Browser Chrome */}
              <div style={{
                background: "rgba(255,255,255,0.05)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
              }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
                <div style={{
                  marginLeft: "14px",
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "6px",
                  padding: "6px 16px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: 500
                }}>
                  guideright.app
                </div>
              </div>
              
              {/* Clean Simulated UI */}
              <div style={{ 
                height: "200px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 2.2fr 1fr",
                gap: "12px"
              }}>
                {/* Left Panel - Chat */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0", textTransform: "uppercase" }}>
                    Chat
                  </div>
                  <div style={{ 
                    background: "rgba(59,130,246,0.2)", 
                    borderRadius: "6px", 
                    padding: "8px 10px",
                    fontSize: "11px",
                    color: "#e2e8f0",
                    fontWeight: 500
                  }}>
                    Assess risk for AOI...
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.06)", 
                    borderRadius: "6px", 
                    padding: "8px 10px",
                    fontSize: "11px",
                    color: "#cbd5e1",
                    flex: 1
                  }}>
                    PMESII analysis shows...
                  </div>
                </div>
                
                {/* Center - Map */}
                <div style={{
                  background: "rgba(59,130,246,0.1)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Grid lines */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(59,130,246,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.12) 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                  }} />
                  {/* Map icon */}
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.7">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  {/* Markers */}
                  <div style={{ position: "absolute", top: "25%", left: "35%", width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
                  <div style={{ position: "absolute", top: "45%", left: "55%", width: "10px", height: "10px", background: "#22c55e", borderRadius: "50%", border: "2px solid #fff" }} />
                  <div style={{ position: "absolute", top: "60%", left: "40%", width: "10px", height: "10px", background: "#eab308", borderRadius: "50%", border: "2px solid #fff" }} />
                </div>
                
                {/* Right Panel - Analysis */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0", textTransform: "uppercase" }}>
                    Analysis
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: "#22c55e" }} />
                    <span style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500 }}>Political: Stable</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: "#eab308" }} />
                    <span style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500 }}>Military: Moderate</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "3px", background: "#22c55e" }} />
                    <span style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500 }}>Economic: Low Risk</span>
                  </div>
                  <div style={{ 
                    marginTop: "auto",
                    background: "rgba(34,197,94,0.2)",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#4ade80",
                    textAlign: "center"
                  }}>
                    Confidence: 78%
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Title */}
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                GuideRight Platform
              </div>
              <div style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "14px", fontWeight: 500 }}>
                Research-Oriented Situational Awareness
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                {["Analyst-in-the-Loop", "Explainable", "Scenario-Driven"].map(tag => (
                  <span key={tag} style={{ 
                    fontSize: "12px", 
                    fontWeight: 600,
                    color: "#e2e8f0",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "6px 14px",
                    borderRadius: "14px"
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Purpose Statement */}
            <div style={{
              marginTop: "20px",
              padding: "16px 20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "14px", color: "#ffffff", marginBottom: "6px", fontWeight: 600 }}>
                <strong>Purpose:</strong> Support human judgment in complex, uncertain environments.
              </div>
              <div style={{ fontSize: "13px", color: "#cbd5e1", fontStyle: "italic", fontWeight: 500 }}>
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
