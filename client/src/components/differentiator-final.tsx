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
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "4px" }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
                GuideRight Development Methodology
              </h1>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
                Key Differentiator: Iterative, Practitioner-Grounded Development Cycle
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CYCLE VISUALIZATION */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(59,130,246,0.08) 50%, rgba(34,197,94,0.06) 100%)",
          border: "2px solid rgba(168,85,247,0.25)",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "16px",
          position: "relative"
        }}>
          {/* Cycle Header */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: "linear-gradient(90deg, #a855f7, #3b82f6, #22c55e)",
              padding: "6px 20px", borderRadius: "20px"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12C4 7.58172 7.58172 4 12 4C14.3894 4 16.5341 5.04752 18 6.70835" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M20 12C20 16.4183 16.4183 20 12 20C9.61062 20 7.46592 18.9525 6 17.2917" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="18 3, 21 7, 17 7" fill="#fff" />
                <polygon points="6 21, 3 17, 7 17" fill="#fff" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Continuous Iterative Development Cycle
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12C4 7.58172 7.58172 4 12 4C14.3894 4 16.5341 5.04752 18 6.70835" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M20 12C20 16.4183 16.4183 20 12 20C9.61062 20 7.46592 18.9525 6 17.2917" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="18 3, 21 7, 17 7" fill="#fff" />
                <polygon points="6 21, 3 17, 7 17" fill="#fff" />
              </svg>
            </div>
          </div>

          {/* 6-Stage Cycle Flow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
            {/* Stage 1 */}
            <div style={{ 
              background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#a855f7", marginBottom: "4px" }}>STAGE 1</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Data Ingestion</div>
              <div style={{ fontSize: "9px", color: "#e9d5ff" }}>TA1: Multi-modal pipeline</div>
            </div>
            
            <svg width="24" height="16" viewBox="0 0 24 16"><polygon points="0 4, 16 4, 16 0, 24 8, 16 16, 16 12, 0 12" fill="#a855f7" /></svg>
            
            {/* Stage 2 */}
            <div style={{ 
              background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#a855f7", marginBottom: "4px" }}>STAGE 2</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>SIGACT Analysis</div>
              <div style={{ fontSize: "9px", color: "#e9d5ff" }}>TA2: Event extraction</div>
            </div>
            
            <svg width="24" height="16" viewBox="0 0 24 16"><polygon points="0 4, 16 4, 16 0, 24 8, 16 16, 16 12, 0 12" fill="#3b82f6" /></svg>
            
            {/* Stage 3 */}
            <div style={{ 
              background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#60a5fa", marginBottom: "4px" }}>STAGE 3</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>REALM Processing</div>
              <div style={{ fontSize: "9px", color: "#bfdbfe" }}>TA3: AI reasoning</div>
            </div>
            
            <svg width="24" height="16" viewBox="0 0 24 16"><polygon points="0 4, 16 4, 16 0, 24 8, 16 16, 16 12, 0 12" fill="#3b82f6" /></svg>
            
            {/* Stage 4 */}
            <div style={{ 
              background: "rgba(59,130,246,0.15)", border: "2px solid rgba(59,130,246,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#60a5fa", marginBottom: "4px" }}>STAGE 4</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Simulation</div>
              <div style={{ fontSize: "9px", color: "#bfdbfe" }}>TA4: Branch analysis</div>
            </div>
          </div>

          {/* Second Row of Cycle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
            {/* Stage 5 */}
            <div style={{ 
              background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", marginBottom: "4px" }}>STAGE 5</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Platform Delivery</div>
              <div style={{ fontSize: "9px", color: "#bbf7d0" }}>TA5: Web + Mobile</div>
            </div>
            
            <svg width="24" height="16" viewBox="0 0 24 16"><polygon points="0 4, 16 4, 16 0, 24 8, 16 16, 16 12, 0 12" fill="#22c55e" /></svg>
            
            {/* Stage 6 */}
            <div style={{ 
              background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#4ade80", marginBottom: "4px" }}>STAGE 6</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Reports & SITEMPs</div>
              <div style={{ fontSize: "9px", color: "#bbf7d0" }}>TA6: CUB products</div>
            </div>
            
            <svg width="24" height="16" viewBox="0 0 24 16"><polygon points="0 4, 16 4, 16 0, 24 8, 16 16, 16 12, 0 12" fill="#f59e0b" /></svg>
            
            {/* Field Deployment */}
            <div style={{ 
              background: "rgba(245,158,11,0.15)", border: "2px solid rgba(245,158,11,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#fbbf24", marginBottom: "4px" }}>DEPLOY</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Field Operations</div>
              <div style={{ fontSize: "9px", color: "#fef3c7" }}>Practitioner use</div>
            </div>
            
            <svg width="24" height="16" viewBox="0 0 24 16"><polygon points="0 4, 16 4, 16 0, 24 8, 16 16, 16 12, 0 12" fill="#ef4444" /></svg>
            
            {/* Feedback */}
            <div style={{ 
              background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)",
              borderRadius: "8px", padding: "10px 14px", width: "150px", textAlign: "center"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#f87171", marginBottom: "4px" }}>FEEDBACK</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Field Corrections</div>
              <div style={{ fontSize: "9px", color: "#fecaca" }}>24-hour updates</div>
            </div>
          </div>

          {/* Feedback Loop Arrow Back */}
          <div style={{ 
            display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
            background: "rgba(239,68,68,0.1)", border: "2px dashed rgba(239,68,68,0.4)",
            borderRadius: "30px", padding: "8px 24px", margin: "0 auto", width: "fit-content"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12C20 7.58172 16.4183 4 12 4C9.61062 4 7.46592 5.04752 6 6.70835" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M4 12C4 16.4183 7.58172 20 12 20C14.3894 20 16.5341 18.9525 18 17.2917" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="6 3, 3 7, 7 7" fill="#f87171" />
              <polygon points="18 21, 21 17, 17 17" fill="#f87171" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Feedback Loops Back to Stage 1
            </span>
            <span style={{ fontSize: "11px", color: "#fecaca" }}>Continuous model refinement</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 12C20 7.58172 16.4183 4 12 4C9.61062 4 7.46592 5.04752 6 6.70835" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M4 12C4 16.4183 7.58172 20 12 20C14.3894 20 16.5341 18.9525 18 17.2917" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="6 3, 3 7, 7 7" fill="#f87171" />
              <polygon points="18 21, 21 17, 17 17" fill="#f87171" />
            </svg>
          </div>
        </div>

        {/* Bottom Section: Team + Capabilities + Advantage */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          
          {/* Team */}
          <div style={{ 
            flex: 1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Industry Partners
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginBottom: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
              Aplus Capabilities LLC
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "2px 5px", borderRadius: "4px" }}>LEAD</span>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Offset3 LLC</div>
            <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "10px" }}>Veteran-Led | Certified Professional Innovators</div>
            
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
              Research Partners
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginBottom: "2px" }}>The Citadel</div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff" }}>University of Nebraska-Lincoln</div>
          </div>

          {/* Core Capabilities */}
          <div style={{ 
            flex: 1,
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "8px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Integrated Frameworks
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
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

          {/* Why This Methodology Works */}
          <div style={{ 
            flex: 1,
            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.04) 100%)",
            border: "2px solid rgba(34,197,94,0.3)",
            borderRadius: "8px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Why This Methodology Works
            </div>
            {[
              { label: "Efficient", desc: "Integrated team, no handoffs" },
              { label: "Accurate", desc: "Practitioner-validated outputs" },
              { label: "Rapid", desc: "24-hour model update cycle" }
            ].map(item => (
              <div key={item.label} style={{ marginBottom: "6px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item.label}
                </div>
                <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "17px" }}>{item.desc}</div>
              </div>
            ))}
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
