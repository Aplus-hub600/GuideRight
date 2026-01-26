import { useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DifferentiatorVisual() {
  const containerRef = useRef<HTMLDivElement>(null)

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
          width: "800px",
          background: "#ffffff",
          padding: "40px",
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Title */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "32px",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "20px"
        }}>
          <h1 style={{ 
            fontSize: "15px", 
            fontWeight: 600, 
            color: "#111827",
            letterSpacing: "-0.01em",
            margin: 0
          }}>
            Practitioner-Grounded, Interdisciplinary Development
          </h1>
        </div>

        {/* Main Grid Layout */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1fr",
          gridTemplateRows: "auto auto auto",
          gap: "20px",
          alignItems: "center"
        }}>
          
          {/* Top Row - Industry (spans middle) */}
          <div />
          <div style={{ 
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "16px 20px"
          }}>
            <div style={{ 
              fontSize: "11px", 
              fontWeight: 600, 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "10px"
            }}>
              Aplus Capabilities
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {["Small Business", "Military-Led", "Certified Professional Innovator"].map(item => (
                <div key={item} style={{ 
                  fontSize: "11px", 
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span style={{ 
                    width: "4px", 
                    height: "4px", 
                    borderRadius: "50%", 
                    background: "#9ca3af" 
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div />

          {/* Arrow down from Industry */}
          <div />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width="2" height="24" style={{ overflow: "visible" }}>
              <line x1="1" y1="0" x2="1" y2="20" stroke="#d1d5db" strokeWidth="1.5" />
              <polygon points="1,24 -3,18 5,18" fill="#d1d5db" />
            </svg>
          </div>
          <div />

          {/* Middle Row - Practitioner, Center, Academic */}
          <div style={{ 
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "16px"
          }}>
            <div style={{ 
              fontSize: "11px", 
              fontWeight: 600, 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px"
            }}>
              Practitioner Engagement
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {["Intelligence Analysts", "Special Operations Personnel", "Structured Interviews", "Iterative Scenario Feedback"].map(item => (
                <div key={item} style={{ 
                  fontSize: "10px", 
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px",
                  lineHeight: "1.4"
                }}>
                  <span style={{ 
                    width: "4px", 
                    height: "4px", 
                    borderRadius: "50%", 
                    background: "#9ca3af",
                    marginTop: "4px",
                    flexShrink: 0
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Center Node with arrows */}
          <div style={{ position: "relative" }}>
            {/* Left arrow */}
            <svg style={{ position: "absolute", left: "-22px", top: "50%", transform: "translateY(-50%)" }} width="20" height="12">
              <line x1="0" y1="6" x2="14" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
              <polygon points="18,6 12,2 12,10" fill="#d1d5db" />
            </svg>
            
            {/* Right bidirectional arrow */}
            <svg style={{ position: "absolute", right: "-22px", top: "50%", transform: "translateY(-50%)" }} width="20" height="12">
              <line x1="3" y1="6" x2="17" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
              <polygon points="0,6 6,2 6,10" fill="#d1d5db" />
              <polygon points="20,6 14,2 14,10" fill="#d1d5db" />
            </svg>

            <div style={{ 
              background: "#1e3a5f",
              borderRadius: "8px",
              padding: "20px 24px",
              textAlign: "center"
            }}>
              <div style={{ 
                fontSize: "14px", 
                fontWeight: 600, 
                color: "#ffffff",
                marginBottom: "4px"
              }}>
                GuideRight Platform
              </div>
              <div style={{ 
                fontSize: "10px", 
                color: "#94a3b8",
                marginBottom: "12px"
              }}>
                Research-Oriented Situational Awareness
              </div>
              <div style={{ 
                borderTop: "1px solid #334d6e",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap"
              }}>
                {["Analyst-in-the-Loop", "Explainable", "Scenario-Driven"].map(tag => (
                  <span key={tag} style={{ 
                    fontSize: "9px", 
                    color: "#cbd5e1",
                    background: "#2d4a6f",
                    padding: "3px 8px",
                    borderRadius: "3px"
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ 
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "16px"
          }}>
            <div style={{ 
              fontSize: "11px", 
              fontWeight: 600, 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px"
            }}>
              Academic Research
            </div>
            <div style={{ 
              fontSize: "10px", 
              color: "#374151",
              fontWeight: 500,
              marginBottom: "8px",
              lineHeight: "1.5"
            }}>
              University of Nebraska–Lincoln
              <br />
              The Citadel
            </div>
            <div style={{ 
              borderTop: "1px solid #e5e7eb",
              paddingTop: "8px",
              display: "flex", 
              flexDirection: "column", 
              gap: "4px" 
            }}>
              {["AI/ML & Reasoning", "Geospatial & Risk Analysis", "Evaluation Methodology"].map(item => (
                <div key={item} style={{ 
                  fontSize: "9px", 
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <span style={{ 
                    width: "3px", 
                    height: "3px", 
                    borderRadius: "50%", 
                    background: "#9ca3af" 
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow down to outcome */}
          <div />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width="2" height="24" style={{ overflow: "visible" }}>
              <line x1="1" y1="0" x2="1" y2="20" stroke="#d1d5db" strokeWidth="1.5" />
              <polygon points="1,24 -3,18 5,18" fill="#d1d5db" />
            </svg>
          </div>
          <div />

          {/* Bottom Row - Outcome (spans all) */}
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ 
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "6px",
              padding: "16px 24px"
            }}>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 600, 
                color: "#166534",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "10px"
              }}>
                Resulting Differentiation
              </div>
              <div style={{ 
                display: "flex", 
                gap: "24px",
                flexWrap: "wrap"
              }}>
                {[
                  "Aligned with real analyst workflows",
                  "Explicit treatment of uncertainty",
                  "Research-ready for evaluation and transition"
                ].map(item => (
                  <div key={item} style={{ 
                    fontSize: "11px", 
                    color: "#15803d",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
