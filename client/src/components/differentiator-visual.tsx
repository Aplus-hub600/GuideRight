import { useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

function GuideRightLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#3b82f6" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="16" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill="#3b82f6" />
      <path d="M24 6 L24 12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 36 L24 42" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 24 L12 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 24 L42 24" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 2 L26.5 8 L24 6.5 L21.5 8 Z" fill="#3b82f6" />
    </svg>
  )
}

export function DifferentiatorVisual() {
  const containerRef = useRef<HTMLDivElement>(null)

  const exportAsPng = useCallback(async () => {
    if (!containerRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#0f172a",
        scale: 3,
        useCORS: true,
      })
      
      const link = document.createElement("a")
      link.download = "guideright-methodology.png"
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
        Download PNG
      </Button>
      
      <div
        ref={containerRef}
        style={{ 
          width: "900px",
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          padding: "40px 48px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Header with Logo */}
        <div style={{ 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "32px"
        }}>
          <GuideRightLogo size={40} />
          <div>
            <div style={{
              fontSize: "9px",
              fontWeight: 500,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "2px"
            }}>
              Development Methodology
            </div>
            <h1 style={{ 
              fontSize: "20px", 
              fontWeight: 600, 
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
              margin: 0
            }}>
              Practitioner-Grounded, Interdisciplinary Development
            </h1>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr 1fr",
          gap: "20px",
          alignItems: "start"
        }}>
          
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Industry */}
            <div style={{ 
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "6px",
              padding: "14px"
            }}>
              <div style={{ 
                fontSize: "8px", 
                fontWeight: 600, 
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px"
              }}>
                Industry Partners
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0" }}>
                  Aplus Capabilities LLC
                </div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "#e2e8f0" }}>
                  Offset3 LLC
                </div>
              </div>
              <div style={{ 
                marginTop: "10px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex", 
                flexDirection: "column", 
                gap: "3px" 
              }}>
                {["Small Business", "Military-Led", "Certified Innovators"].map(item => (
                  <div key={item} style={{ fontSize: "9px", color: "#64748b" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Practitioner Engagement */}
            <div style={{ 
              background: "rgba(59, 130, 246, 0.06)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              borderRadius: "6px",
              padding: "14px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-7px",
                right: "10px",
                background: "#3b82f6",
                color: "#fff",
                fontSize: "7px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Continuous
              </div>
              
              <div style={{ 
                fontSize: "8px", 
                fontWeight: 600, 
                color: "#3b82f6",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Practitioner Engagement
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {["Intelligence Analysts", "SOF Personnel", "Structured Interviews", "Scenario Feedback"].map(item => (
                  <div key={item} style={{ 
                    fontSize: "9px", 
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span style={{ 
                      width: "3px", 
                      height: "3px", 
                      borderRadius: "50%", 
                      background: "#3b82f6",
                      opacity: 0.6
                    }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Loop arrow */}
              <svg style={{ position: "absolute", bottom: "8px", right: "8px", opacity: 0.3 }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 .79-.15 1.56-.44 2.25l1.52 1.52C19.69 14.55 20 13.31 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-.79.15-1.56.44-2.25L4.92 8.23C4.31 9.45 4 10.69 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="#3b82f6"/>
              </svg>
            </div>
          </div>

          {/* Center - Platform */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ 
              background: "#0c1629",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)"
            }}>
              {/* Browser Chrome */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                borderBottom: "1px solid rgba(255,255,255,0.04)"
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#eab308" }} />
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                <div style={{
                  marginLeft: "10px",
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "3px",
                  padding: "3px 8px",
                  fontSize: "8px",
                  color: "#475569"
                }}>
                  guideright.app
                </div>
              </div>
              
              {/* Platform Preview */}
              <div style={{ 
                height: "200px",
                background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}>
                {/* Simulated UI */}
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr",
                  gap: "8px",
                  width: "90%",
                  height: "85%",
                  opacity: 0.7
                }}>
                  <div style={{ 
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "4px",
                    padding: "8px"
                  }}>
                    <div style={{ height: "6px", width: "60%", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginBottom: "6px" }} />
                    <div style={{ height: "4px", width: "80%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "4px" }} />
                    <div style={{ height: "4px", width: "70%", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
                  </div>
                  <div style={{ 
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "4px",
                    padding: "8px"
                  }}>
                    <div style={{ height: "6px", width: "50%", background: "rgba(34,197,94,0.3)", borderRadius: "2px", marginBottom: "6px" }} />
                    <div style={{ height: "4px", width: "90%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "4px" }} />
                    <div style={{ height: "4px", width: "75%", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Name */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginBottom: "8px" }}>
                GuideRight Platform
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                {["Analyst-in-the-Loop", "Explainable", "Scenario-Driven"].map(tag => (
                  <span key={tag} style={{ 
                    fontSize: "8px", 
                    fontWeight: 500,
                    color: "#64748b",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: "3px 8px",
                    borderRadius: "10px"
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Academic Research */}
            <div style={{ 
              background: "rgba(168, 85, 247, 0.06)",
              border: "1px solid rgba(168, 85, 247, 0.15)",
              borderRadius: "6px",
              padding: "14px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-7px",
                right: "10px",
                background: "#a855f7",
                color: "#fff",
                fontSize: "7px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Iterative
              </div>
              
              <div style={{ 
                fontSize: "8px", 
                fontWeight: 600, 
                color: "#a855f7",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px"
              }}>
                Academic Research
              </div>
              
              <div style={{ 
                fontSize: "10px", 
                color: "#e2e8f0",
                fontWeight: 500,
                lineHeight: "1.5",
                marginBottom: "8px"
              }}>
                University of Nebraska–Lincoln<br />
                The Citadel
              </div>
              
              <div style={{ 
                borderTop: "1px solid rgba(168, 85, 247, 0.1)",
                paddingTop: "8px",
                display: "flex", 
                flexDirection: "column", 
                gap: "3px" 
              }}>
                {["AI/ML & Reasoning", "Geospatial Analysis", "Evaluation Methods"].map(item => (
                  <div key={item} style={{ fontSize: "9px", color: "#a78bfa" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Differentiation */}
            <div style={{ 
              background: "rgba(34, 197, 94, 0.06)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              borderRadius: "6px",
              padding: "14px"
            }}>
              <div style={{ 
                fontSize: "8px", 
                fontWeight: 600, 
                color: "#22c55e",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px"
              }}>
                Differentiation
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Aligned with analyst workflows",
                  "Explicit uncertainty treatment",
                  "Research-ready evaluation"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "9px", 
                    color: "#86efac",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px"
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ marginTop: "1px", flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
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
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ 
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <GuideRightLogo size={20} />
            <span style={{ fontSize: "10px", fontWeight: 500, color: "#475569" }}>
              GuideRight
            </span>
          </div>
          <div style={{ fontSize: "9px", color: "#334155" }}>
            Tactical Intelligence Assistant
          </div>
        </div>
      </div>
    </div>
  )
}
