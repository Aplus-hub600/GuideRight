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
        logging: false,
        width: 1100,
        height: 820,
        windowWidth: 1100,
        windowHeight: 820
      })
      
      const link = document.createElement("a")
      link.download = "guideright-methodology-final.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Export failed:", error)
    }
  }, [])

  const pillarStyle = {
    display: "inline-block",
    width: "320px",
    textAlign: "center" as const,
    verticalAlign: "top",
    padding: "0 10px",
    boxSizing: "border-box" as const
  }

  const badgeStyle = {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#fff",
    background: "rgba(59,130,246,0.25)",
    padding: "4px 10px",
    borderRadius: "4px",
    marginRight: "6px",
    marginBottom: "4px"
  }

  const dataTagStyle = {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#fff",
    background: "rgba(255,255,255,0.08)",
    padding: "3px 7px",
    borderRadius: "4px",
    marginRight: "5px",
    marginBottom: "4px"
  }

  const checkItemStyle = {
    marginBottom: "8px"
  }

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
          height: "820px",
          background: "linear-gradient(180deg, #0a1628 0%, #0d1a2d 100%)",
          padding: "28px 36px",
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "inline-block", verticalAlign: "middle", marginRight: "14px" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: "inline-block", verticalAlign: "middle", textAlign: "left" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              GuideRight Development Approach
            </div>
            <div style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 500, lineHeight: "1.3" }}>
              Our Key Differentiator: A Credible, Practitioner-Grounded Methodology
            </div>
          </div>
        </div>

        {/* UNIQUE APPROACH Box */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(59,130,246,0.1) 50%, rgba(168,85,247,0.08) 100%)",
          border: "2px solid rgba(34,197,94,0.35)",
          borderRadius: "12px",
          padding: "24px 20px 16px",
          marginBottom: "16px",
          position: "relative"
        }}>
          {/* Badge */}
          <div style={{ 
            position: "absolute", top: "-12px", left: "50%", marginLeft: "-95px", width: "190px",
            background: "linear-gradient(90deg, #22c55e, #3b82f6)",
            padding: "5px 0", borderRadius: "20px", textAlign: "center"
          }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              What Makes Us Different
            </span>
          </div>

          {/* Three Pillars */}
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            
            {/* Pillar 1 */}
            <div style={pillarStyle}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 8px",
                background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)",
                borderRadius: "50%", lineHeight: "52px", textAlign: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
                  <circle cx="12" cy="8" r="4" stroke="#f87171" strokeWidth="2" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#f87171", marginBottom: "8px" }}>Customer Discovery</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}>Special Operators</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}>Intelligence Analysts</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "6px" }}>Adjacent Users</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Real needs from real users</div>
            </div>

            {/* Pillar 2 */}
            <div style={pillarStyle}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 8px",
                background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.4)",
                borderRadius: "50%", lineHeight: "52px", textAlign: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
                  <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 12L20 7.5" stroke="#a855f7" strokeWidth="2" />
                  <path d="M12 12V21" stroke="#a855f7" strokeWidth="2" />
                  <path d="M12 12L4 7.5" stroke="#a855f7" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#a855f7", marginBottom: "8px" }}>Research Partners</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}>The Citadel</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "6px" }}>University of Nebraska-Lincoln</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Academic rigor & AI/ML research</div>
            </div>

            {/* Pillar 3 */}
            <div style={pillarStyle}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 8px",
                background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(34,197,94,0.15) 100%)", 
                border: "2px solid rgba(34,197,94,0.4)",
                borderRadius: "50%", lineHeight: "52px", textAlign: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle" }}>
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#4ade80", marginBottom: "8px" }}>Industry Team</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px" }}>
                Aplus Capabilities LLC <span style={{ fontSize: "11px", color: "#22c55e" }}>(Lead)</span>
              </div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "6px" }}>Offset3 LLC</div>
              <div style={{ textAlign: "center", marginBottom: "6px" }}>
                <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,0.15)", padding: "3px 8px", borderRadius: "4px", marginRight: "6px" }}>Veteran-Led</span>
                <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,0.15)", padding: "3px 8px", borderRadius: "4px" }}>Certified Innovators</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Lean, agile small business</div>
            </div>
          </div>

          {/* Continuous Iterative Banner */}
          <div style={{ 
            textAlign: "center",
            marginTop: "14px", paddingTop: "12px",
            borderTop: "1px dashed rgba(255,255,255,0.15)"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "10px" }}>
              <path d="M4 12C4 7.58 7.58 4 12 4C14.39 4 16.53 5.05 18 6.71" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 12C20 16.42 16.42 20 12 20C9.61 20 7.47 18.95 6 17.29" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="18 3, 21 7, 17 7" fill="#a855f7" />
              <polygon points="6 21, 3 17, 7 17" fill="#a855f7" />
            </svg>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#a855f7", verticalAlign: "middle" }}>
              Continuous Iterative Development
            </span>
            <span style={{ fontSize: "13px", color: "#94a3b8", verticalAlign: "middle", marginLeft: "8px" }}>
              — Customer feedback drives every cycle
            </span>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ marginBottom: "14px" }}>
          
          {/* Frameworks Box */}
          <div style={{ 
            display: "inline-block",
            width: "260px",
            verticalAlign: "top",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "8px",
            padding: "12px",
            marginRight: "14px"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Doctrinal Frameworks
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span style={badgeStyle}>PMESII-PT</span>
              <span style={badgeStyle}>ASCOPE</span>
              <span style={badgeStyle}>CARVER</span>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Multi-Modal Data
            </div>
            <div>
              <span style={dataTagStyle}>Text</span>
              <span style={dataTagStyle}>Imagery</span>
              <span style={dataTagStyle}>Video</span>
              <span style={dataTagStyle}>Geospatial</span>
              <span style={dataTagStyle}>SIGACT</span>
              <span style={dataTagStyle}>Social</span>
            </div>
          </div>

          {/* Credibility Box */}
          <div style={{ 
            display: "inline-block",
            width: "430px",
            verticalAlign: "top",
            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.04) 100%)",
            border: "2px solid rgba(34,197,94,0.3)",
            borderRadius: "8px",
            padding: "12px",
            marginRight: "14px"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Why This Approach is Credible
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ float: "left", width: "50%" }}>
                <div style={checkItemStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", verticalAlign: "middle" }}>Practitioner-First</span>
                  <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "20px" }}>Built with operators & analysts</div>
                </div>
                <div style={checkItemStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", verticalAlign: "middle" }}>Veteran Leadership</span>
                  <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "20px" }}>Military experience driving design</div>
                </div>
                <div style={checkItemStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", verticalAlign: "middle" }}>Certified Innovation</span>
                  <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "20px" }}>Proven methods</div>
                </div>
              </div>
              <div style={{ float: "left", width: "50%" }}>
                <div style={checkItemStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", verticalAlign: "middle" }}>Academic Rigor</span>
                  <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "20px" }}>Research-backed AI/ML</div>
                </div>
                <div style={checkItemStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", verticalAlign: "middle" }}>Lean & Agile</span>
                  <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "20px" }}>Small business speed</div>
                </div>
                <div style={checkItemStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: "6px" }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", verticalAlign: "middle" }}>Continuous Feedback</span>
                  <div style={{ fontSize: "10px", color: "#a7f3d0", marginLeft: "20px" }}>Operator input drives iteration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div style={{ 
            display: "inline-block",
            width: "180px",
            verticalAlign: "top",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "12px"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              The Result
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#4ade80", marginBottom: "4px" }}>Efficient</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#60a5fa", marginBottom: "4px" }}>Accurate</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#fbbf24", marginBottom: "4px" }}>Rapid</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>Transition from research to operations</div>
          </div>
        </div>

        {/* Purpose Statement */}
        <div style={{
          padding: "10px 16px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600, lineHeight: "1.4" }}>
            Purpose: Deliver transparent, explainable, confidence-qualified intelligence to support rapid decision-making in high-stakes operational environments.
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <span style={{
            display: "inline-block",
            fontSize: "12px", fontWeight: 700, color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase",
            padding: "5px 16px", border: "2px solid #22c55e", borderRadius: "4px"
          }}>
            UNCLASSIFIED
          </span>
        </div>
      </div>
    </div>
  )
}
