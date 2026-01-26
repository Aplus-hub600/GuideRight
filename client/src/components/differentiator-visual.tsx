import { useRef, useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DifferentiatorVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

  useEffect(() => {
    const captureScreenshot = async () => {
      try {
        const html2canvas = (await import("html2canvas")).default
        const mainApp = document.querySelector('[class*="h-screen w-screen"]') as HTMLElement
        if (mainApp) {
          const canvas = await html2canvas(mainApp, {
            backgroundColor: "#0f172a",
            scale: 0.5,
            useCORS: true,
            logging: false,
          })
          setScreenshotUrl(canvas.toDataURL("image/png"))
        }
      } catch (e) {
        console.log("Screenshot capture not available")
      }
    }
    captureScreenshot()
  }, [])

  const exportAsPng = useCallback(async () => {
    if (!containerRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
      })
      
      const link = document.createElement("a")
      link.download = "guideright-differentiator.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button onClick={exportAsPng} variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export as PNG
      </Button>
      
      <div
        ref={containerRef}
        style={{ 
          width: "960px",
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          padding: "48px",
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          borderRadius: "12px"
        }}
      >
        {/* Header */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "36px"
        }}>
          <div style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "8px"
          }}>
            Development Methodology
          </div>
          <h1 style={{ 
            fontSize: "22px", 
            fontWeight: 600, 
            color: "#f8fafc",
            letterSpacing: "-0.02em",
            margin: 0
          }}>
            Practitioner-Grounded, Interdisciplinary Development
          </h1>
        </div>

        {/* Main Layout */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "200px 1fr 200px",
          gap: "24px",
          alignItems: "stretch"
        }}>
          
          {/* Left Column - Continuous Engagement Loop */}
          <div style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
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
                letterSpacing: "0.1em",
                marginBottom: "10px"
              }}>
                Industry Leadership
              </div>
              <div style={{ 
                fontSize: "13px", 
                fontWeight: 600, 
                color: "#e2e8f0",
                marginBottom: "8px"
              }}>
                Aplus Capabilities
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {["Small Business", "Military-Led", "Certified Innovator"].map(item => (
                  <div key={item} style={{ 
                    fontSize: "10px", 
                    color: "#94a3b8"
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Practitioner Engagement - Continuous */}
            <div style={{ 
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "8px",
              padding: "16px",
              position: "relative",
              flex: 1
            }}>
              {/* Continuous loop indicator */}
              <div style={{
                position: "absolute",
                top: "-8px",
                right: "12px",
                background: "#3b82f6",
                color: "#fff",
                fontSize: "8px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Continuous
              </div>
              
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#3b82f6",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px"
              }}>
                Practitioner Engagement
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Intelligence Analysts", icon: "🎯" },
                  { label: "SOF Personnel", icon: "⚡" },
                  { label: "Structured Interviews", icon: "📋" },
                  { label: "Scenario Feedback", icon: "🔄" }
                ].map(item => (
                  <div key={item.label} style={{ 
                    fontSize: "10px", 
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.03)",
                    padding: "6px 8px",
                    borderRadius: "4px"
                  }}>
                    <span style={{ fontSize: "11px" }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Circular arrow indicating continuous loop */}
              <svg style={{ 
                position: "absolute", 
                bottom: "8px", 
                right: "8px",
                opacity: 0.4
              }} width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 .79-.15 1.56-.44 2.25l1.52 1.52C19.69 14.55 20 13.31 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-.79.15-1.56.44-2.25L4.92 8.23C4.31 9.45 4 10.69 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="#3b82f6"/>
              </svg>
            </div>
          </div>

          {/* Center - Platform Screenshot */}
          <div style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {/* Platform Frame */}
            <div style={{ 
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              position: "relative"
            }}>
              {/* Browser Chrome */}
              <div style={{
                background: "rgba(255,255,255,0.05)",
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
                  padding: "4px 10px",
                  fontSize: "9px",
                  color: "#64748b"
                }}>
                  guideright.app
                </div>
              </div>
              
              {/* Screenshot or Placeholder */}
              <div style={{ 
                height: "280px",
                background: screenshotUrl 
                  ? `url(${screenshotUrl}) center/cover`
                  : "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}>
                {!screenshotUrl && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      margin: "0 auto 12px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>
                      GuideRight Platform
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                      Tactical Intelligence Assistant
                    </div>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60px",
                  background: "linear-gradient(transparent, rgba(15,23,42,0.9))"
                }} />
              </div>
            </div>

            {/* Platform Tags */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "8px",
              flexWrap: "wrap"
            }}>
              {["Analyst-in-the-Loop", "Explainable AI", "Scenario-Driven"].map(tag => (
                <span key={tag} style={{ 
                  fontSize: "9px", 
                  fontWeight: 500,
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "4px 10px",
                  borderRadius: "12px"
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column - Research & Outcomes */}
          <div style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {/* Academic Research */}
            <div style={{ 
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              borderRadius: "8px",
              padding: "16px",
              position: "relative"
            }}>
              {/* Bidirectional indicator */}
              <div style={{
                position: "absolute",
                top: "-8px",
                right: "12px",
                background: "#a855f7",
                color: "#fff",
                fontSize: "8px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Iterative
              </div>
              
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#a855f7",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "10px"
              }}>
                Academic Research
              </div>
              
              <div style={{ 
                fontSize: "11px", 
                color: "#e2e8f0",
                fontWeight: 500,
                marginBottom: "10px",
                lineHeight: "1.5"
              }}>
                University of Nebraska–Lincoln
                <br />
                The Citadel
              </div>
              
              <div style={{ 
                borderTop: "1px solid rgba(168, 85, 247, 0.2)",
                paddingTop: "10px",
                display: "flex", 
                flexDirection: "column", 
                gap: "4px" 
              }}>
                {["AI/ML & Reasoning", "Geospatial Analysis", "Evaluation Methods"].map(item => (
                  <div key={item} style={{ 
                    fontSize: "9px", 
                    color: "#c4b5fd"
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes */}
            <div style={{ 
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: "8px",
              padding: "16px",
              flex: 1
            }}>
              <div style={{ 
                fontSize: "9px", 
                fontWeight: 600, 
                color: "#22c55e",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "12px"
              }}>
                Differentiation
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Aligned with analyst workflows",
                  "Explicit uncertainty treatment",
                  "Research-ready evaluation"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "10px", 
                    color: "#bbf7d0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px"
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ marginTop: "1px", flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flow Arrows - SVG Overlay */}
        <svg style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0
        }}>
        </svg>

        {/* Footer */}
        <div style={{
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ 
            fontSize: "10px", 
            color: "#475569",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{
              width: "20px",
              height: "20px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </span>
            GuideRight
          </div>
          <div style={{ 
            fontSize: "9px", 
            color: "#475569"
          }}>
            USSOCOM Tactical Intelligence
          </div>
        </div>
      </div>
    </div>
  )
}
