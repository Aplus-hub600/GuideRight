import { useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

function GuideRightLogoAlt({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#1e3a5f" />
      <path d="M24 12L24 36" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 24L36 24" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="8" stroke="#60a5fa" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="3" fill="#60a5fa" />
      <path d="M24 8L27 14H21L24 8Z" fill="#60a5fa" />
    </svg>
  )
}

export function DifferentiatorVisualAlt() {
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
      link.download = "guideright-methodology-light.png"
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
          background: "#ffffff",
          padding: "48px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {/* Header */}
        <div style={{ 
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "40px",
          paddingBottom: "24px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <GuideRightLogoAlt size={48} />
          <div>
            <h1 style={{ 
              fontSize: "22px", 
              fontWeight: 600, 
              color: "#111827",
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: "4px"
            }}>
              Practitioner-Grounded Development
            </h1>
            <div style={{
              fontSize: "13px",
              color: "#6b7280"
            }}>
              Interdisciplinary Approach to Tactical Intelligence
            </div>
          </div>
        </div>

        {/* Flow Diagram */}
        <div style={{ 
          display: "flex",
          alignItems: "stretch",
          gap: "0",
          marginBottom: "32px"
        }}>
          
          {/* Industry Input */}
          <div style={{ 
            flex: "1",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px 0 0 8px",
            padding: "20px",
            borderRight: "none"
          }}>
            <div style={{ 
              fontSize: "10px", 
              fontWeight: 600, 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px"
            }}>
              Industry Partners
            </div>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#1e293b",
              marginBottom: "4px"
            }}>
              Aplus Capabilities LLC
            </div>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#1e293b",
              marginBottom: "12px"
            }}>
              Offset3 LLC
            </div>
            <div style={{ 
              display: "flex",
              flexWrap: "wrap",
              gap: "6px"
            }}>
              {["Small Business", "Military-Led", "Certified Innovators"].map(tag => (
                <span key={tag} style={{
                  fontSize: "9px",
                  color: "#64748b",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  padding: "3px 8px",
                  borderRadius: "4px"
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ 
            width: "40px",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "1px solid #e2e8f0",
            borderBottom: "1px solid #e2e8f0"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          {/* Center Platform */}
          <div style={{ 
            flex: "1.4",
            background: "#1e3a5f",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{ 
              fontSize: "10px", 
              fontWeight: 600, 
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px"
            }}>
              Platform
            </div>
            <div style={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: "#ffffff",
              marginBottom: "12px"
            }}>
              GuideRight
            </div>
            <div style={{ 
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }}>
              {["Analyst-in-the-Loop", "Explainable", "Scenario-Driven"].map(tag => (
                <span key={tag} style={{
                  fontSize: "9px",
                  color: "#cbd5e1",
                  background: "rgba(255,255,255,0.1)",
                  padding: "4px 10px",
                  borderRadius: "12px"
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bidirectional Arrow */}
          <div style={{ 
            width: "40px",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "1px solid #e2e8f0",
            borderBottom: "1px solid #e2e8f0"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18" />
            </svg>
          </div>

          {/* Academic Research */}
          <div style={{ 
            flex: "1",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0 8px 8px 0",
            padding: "20px",
            borderLeft: "none"
          }}>
            <div style={{ 
              fontSize: "10px", 
              fontWeight: 600, 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px"
            }}>
              Academic Research
            </div>
            <div style={{ 
              fontSize: "13px", 
              fontWeight: 500, 
              color: "#1e293b",
              lineHeight: "1.5",
              marginBottom: "12px"
            }}>
              University of Nebraska–Lincoln<br />
              The Citadel
            </div>
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              {["AI/ML & Reasoning", "Geospatial Analysis", "Evaluation Methods"].map(item => (
                <span key={item} style={{
                  fontSize: "10px",
                  color: "#64748b"
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Indicators */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          marginBottom: "32px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#3b82f6"
            }} />
            <span style={{ fontSize: "11px", color: "#475569" }}>
              <strong style={{ color: "#1e293b" }}>Continuous</strong> Practitioner Engagement
            </span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#a855f7"
            }} />
            <span style={{ fontSize: "11px", color: "#475569" }}>
              <strong style={{ color: "#1e293b" }}>Iterative</strong> Research Collaboration
            </span>
          </div>
        </div>

        {/* Outcomes */}
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "20px 24px"
        }}>
          <div style={{ 
            fontSize: "10px", 
            fontWeight: 600, 
            color: "#15803d",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "14px"
          }}>
            Resulting Differentiation
          </div>
          <div style={{ 
            display: "flex",
            gap: "40px",
            flexWrap: "wrap"
          }}>
            {[
              "Aligned with real analyst workflows",
              "Explicit treatment of uncertainty",
              "Research-ready for evaluation"
            ].map(item => (
              <div key={item} style={{ 
                fontSize: "12px", 
                color: "#166534",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#22c55e" />
                  <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ 
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <GuideRightLogoAlt size={24} />
            <span style={{ fontSize: "11px", fontWeight: 500, color: "#374151" }}>
              GuideRight
            </span>
          </div>
          <div style={{ fontSize: "10px", color: "#9ca3af" }}>
            Tactical Intelligence Assistant for USSOCOM
          </div>
        </div>
      </div>
    </div>
  )
}
