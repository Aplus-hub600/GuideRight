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
          background: "linear-gradient(180deg, #0a1628 0%, #1a2d4a 50%, #0f1f35 100%)",
          padding: "40px 48px",
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
          marginBottom: "28px",
          position: "relative"
        }}>
          <div style={{
            fontSize: "10px",
            fontWeight: 500,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "6px"
          }}>
            Development Methodology
          </div>
          <h1 style={{ 
            fontSize: "26px", 
            fontWeight: 600, 
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px"
          }}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.5" />
              <circle cx="24" cy="24" r="4" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Practitioner-Grounded, Interdisciplinary Development
          </h1>
          <div style={{
            fontSize: "12px",
            color: "#94a3b8",
            marginTop: "6px"
          }}>
            Research & Transition Capability
          </div>
        </div>

        {/* Main Orbital Layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 220px",
          gap: "24px",
          alignItems: "start",
          position: "relative"
        }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Industry Leadership */}
            <div style={{ 
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "16px"
            }}>
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Industry Leadership
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}>
                  Aplus Capabilities LLC
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}>
                  Offset3 LLC
                </div>
              </div>
              <div style={{ 
                paddingTop: "8px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", 
                flexDirection: "column", 
                gap: "3px" 
              }}>
                {["Small Business, Military-Led", "Certified Professional Innovators"].map(item => (
                  <div key={item} style={{ fontSize: "9px", color: "#94a3b8" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Practitioner Grounding */}
            <div style={{ 
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "8px",
              padding: "16px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-8px",
                right: "12px",
                background: "#3b82f6",
                color: "#fff",
                fontSize: "7px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Continuous
              </div>
              
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#3b82f6",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Practitioner Grounding
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  "Intelligence Analysts",
                  "Special Operations Personnel", 
                  "Scenario-Driven Interviews",
                  "Analyst Feedback Loops"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "10px", 
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span style={{ 
                      width: "3px", 
                      height: "3px", 
                      borderRadius: "50%", 
                      background: "#3b82f6"
                    }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div style={{ 
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "12px"
            }}>
              <div style={{ 
                fontSize: "8px", 
                fontWeight: 600, 
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px"
              }}>
                Adaptable Data Sources
              </div>
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "6px" 
              }}>
                {["ODIN", "ACLED", "GDELT", "OSM"].map(src => (
                  <span key={src} style={{
                    fontSize: "8px",
                    fontWeight: 600,
                    color: "#94a3b8",
                    background: "rgba(255,255,255,0.05)",
                    padding: "3px 7px",
                    borderRadius: "4px"
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
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15, 23, 42, 0.9)",
              padding: "4px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 10
            }}>
              <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 500 }}>
                Iterative, Analyst-Grounded Cycle
              </span>
            </div>

            {/* Orbital Ring */}
            <svg style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "420px",
              height: "320px",
              pointerEvents: "none"
            }} viewBox="0 0 420 320">
              <ellipse cx="210" cy="160" rx="200" ry="150" 
                fill="none" 
                stroke="url(#orbitalGradient)" 
                strokeWidth="1.5"
                strokeDasharray="8 4"
                opacity="0.4"
              />
              <defs>
                <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              {/* Flow arrows */}
              <path d="M 50 160 Q 210 40 370 160" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
              <path d="M 370 160 Q 210 280 50 160" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.3" />
            </svg>

            {/* Platform Card */}
            <div style={{ 
              background: "#0c1629",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5)",
              position: "relative",
              zIndex: 5,
              margin: "20px 0"
            }}>
              {/* Browser Chrome */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderBottom: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
                <div style={{
                  marginLeft: "12px",
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  fontSize: "9px",
                  color: "#64748b"
                }}>
                  guideright.app
                </div>
              </div>
              
              {/* Clean Simulated UI */}
              <div style={{ 
                height: "180px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 2.2fr 1fr",
                gap: "10px"
              }}>
                {/* Left Panel - Chat */}
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ fontSize: "8px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Chat
                  </div>
                  <div style={{ 
                    background: "rgba(59,130,246,0.15)", 
                    borderRadius: "4px", 
                    padding: "6px 8px",
                    fontSize: "7px",
                    color: "#94a3b8"
                  }}>
                    Assess risk for AOI...
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.05)", 
                    borderRadius: "4px", 
                    padding: "6px 8px",
                    fontSize: "7px",
                    color: "#64748b",
                    flex: 1
                  }}>
                    PMESII analysis shows...
                  </div>
                </div>
                
                {/* Center - Map */}
                <div style={{
                  background: "rgba(59,130,246,0.08)",
                  borderRadius: "6px",
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
                    backgroundImage: "linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  }} />
                  {/* Map icon */}
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  {/* Markers */}
                  <div style={{ position: "absolute", top: "25%", left: "35%", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
                  <div style={{ position: "absolute", top: "45%", left: "55%", width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%", border: "2px solid #fff" }} />
                  <div style={{ position: "absolute", top: "60%", left: "40%", width: "8px", height: "8px", background: "#eab308", borderRadius: "50%", border: "2px solid #fff" }} />
                </div>
                
                {/* Right Panel - Analysis */}
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  <div style={{ fontSize: "8px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                    Analysis
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "#22c55e" }} />
                    <span style={{ fontSize: "7px", color: "#94a3b8" }}>Political: Stable</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "#eab308" }} />
                    <span style={{ fontSize: "7px", color: "#94a3b8" }}>Military: Moderate</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "#22c55e" }} />
                    <span style={{ fontSize: "7px", color: "#94a3b8" }}>Economic: Low Risk</span>
                  </div>
                  <div style={{ 
                    marginTop: "auto",
                    background: "rgba(34,197,94,0.15)",
                    borderRadius: "4px",
                    padding: "4px 6px",
                    fontSize: "7px",
                    fontWeight: 600,
                    color: "#22c55e",
                    textAlign: "center"
                  }}>
                    Confidence: 78%
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Title */}
            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "4px" }}>
                GuideRight Platform
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "10px" }}>
                Research-Oriented Situational Awareness
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                {["Analyst-in-the-Loop", "Explainable", "Scenario-Driven"].map(tag => (
                  <span key={tag} style={{ 
                    fontSize: "8px", 
                    fontWeight: 500,
                    color: "#94a3b8",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "4px 10px",
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
              padding: "12px 16px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "6px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "10px", color: "#cbd5e1", marginBottom: "4px" }}>
                <strong>Purpose:</strong> Support human judgment in complex, uncertain environments.
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", fontStyle: "italic" }}>
                Not autonomous. Not predict. Not targeting.
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Academic Research */}
            <div style={{ 
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              borderRadius: "8px",
              padding: "16px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-8px",
                right: "12px",
                background: "#a855f7",
                color: "#fff",
                fontSize: "7px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Iterative
              </div>
              
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#a855f7",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px"
              }}>
                Academic Research Partners
              </div>
              
              <div style={{ 
                fontSize: "11px", 
                color: "#e2e8f0",
                fontWeight: 500,
                lineHeight: "1.6",
                marginBottom: "10px"
              }}>
                University of Nebraska–Lincoln<br />
                The Citadel
              </div>
              
              <div style={{ 
                borderTop: "1px solid rgba(168, 85, 247, 0.15)",
                paddingTop: "8px"
              }}>
                <div style={{ fontSize: "8px", fontWeight: 600, color: "#a78bfa", marginBottom: "6px" }}>
                  Research Contributions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {[
                    "AI/ML evaluation methods",
                    "Reasoning & uncertainty",
                    "Geospatial analysis",
                    "Research validation"
                  ].map(item => (
                    <div key={item} style={{ fontSize: "9px", color: "#c4b5fd" }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviewer Takeaway */}
            <div style={{ 
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: "8px",
              padding: "16px"
            }}>
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#22c55e",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Reviewer Takeaway
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Built with practitioners, not in isolation",
                  "Academically grounded & empirically evaluated",
                  "Designed for research transition"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "9px", 
                    color: "#86efac",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px"
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginTop: "1px", flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Differentiators */}
            <div style={{ 
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "14px"
            }}>
              <div style={{ 
                fontSize: "8px", 
                fontWeight: 600, 
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px"
              }}>
                Key Differentiators
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  "Analyst questions, not data volume",
                  "Explicit uncertainty & confidence",
                  "Scenario-driven innovation"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "9px", 
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    <span style={{ color: "#3b82f6" }}>→</span>
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
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ 
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="18" stroke="#3b82f6" strokeWidth="2" fill="none" />
              <circle cx="24" cy="24" r="3" fill="#3b82f6" />
              <path d="M24 8L24 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}>
              GuideRight
            </span>
          </div>
          <div style={{ fontSize: "9px", color: "#475569", fontWeight: 500 }}>
            UNCLASSIFIED | Research Prototype Visualization
          </div>
        </div>
      </div>
    </div>
  )
}
