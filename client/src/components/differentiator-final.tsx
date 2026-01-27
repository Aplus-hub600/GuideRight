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
        windowWidth: 1100,
        windowHeight: 900
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
          height: "820px",
          background: "linear-gradient(180deg, #0a1628 0%, #0d1a2d 100%)",
          padding: "28px 36px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          boxSizing: "border-box",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0, lineHeight: "1.2" }}>
                GuideRight Development Approach
              </h1>
              <div style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 500, lineHeight: "1.3" }}>
                Our Key Differentiator: A Credible, Practitioner-Grounded Methodology
              </div>
            </div>
          </div>
        </div>

        {/* UNIQUE APPROACH - The Main Message */}
        <div style={{ 
          background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(59,130,246,0.1) 50%, rgba(168,85,247,0.08) 100%)",
          border: "2px solid rgba(34,197,94,0.35)",
          borderRadius: "12px",
          padding: "20px 24px 16px",
          marginBottom: "16px",
          position: "relative",
          height: "290px",
          boxSizing: "border-box"
        }}>
          <div style={{ 
            position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #22c55e, #3b82f6)",
            padding: "5px 20px", borderRadius: "20px",
            whiteSpace: "nowrap"
          }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              What Makes Us Different
            </span>
          </div>

          {/* Three Pillars of the Approach */}
          <div style={{ display: "flex", gap: "20px", marginTop: "8px", height: "210px" }}>
            
            {/* Pillar 1: Customer Discovery */}
            <div style={{ width: "320px", textAlign: "center", boxSizing: "border-box" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 8px",
                background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#f87171" strokeWidth="2" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#f87171", marginBottom: "8px", lineHeight: "1.2" }}>Customer Discovery</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px", lineHeight: "1.3" }}>Special Operators</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px", lineHeight: "1.3" }}>Intelligence Analysts</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "6px", lineHeight: "1.3" }}>Adjacent Users</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", lineHeight: "1.3" }}>Real needs from real users</div>
            </div>

            {/* Pillar 2: Research Partners */}
            <div style={{ width: "320px", textAlign: "center", boxSizing: "border-box" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 8px",
                background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 12L20 7.5" stroke="#a855f7" strokeWidth="2" />
                  <path d="M12 12V21" stroke="#a855f7" strokeWidth="2" />
                  <path d="M12 12L4 7.5" stroke="#a855f7" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#a855f7", marginBottom: "8px", lineHeight: "1.2" }}>Research Partners</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px", lineHeight: "1.3" }}>The Citadel</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "6px", lineHeight: "1.3" }}>University of Nebraska-Lincoln</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", lineHeight: "1.3" }}>Academic rigor & AI/ML research</div>
            </div>

            {/* Pillar 3: Industry Team - Combined */}
            <div style={{ width: "320px", textAlign: "center", boxSizing: "border-box" }}>
              <div style={{ 
                width: "56px", height: "56px", margin: "0 auto 8px",
                background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(34,197,94,0.15) 100%)", 
                border: "2px solid rgba(34,197,94,0.4)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#4ade80", marginBottom: "8px", lineHeight: "1.2" }}>Industry Team</div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "4px", lineHeight: "1.3" }}>
                Aplus Capabilities LLC <span style={{ fontSize: "11px", color: "#22c55e" }}>(Lead)</span>
              </div>
              <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600, marginBottom: "6px", lineHeight: "1.3" }}>Offset3 LLC</div>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,0.15)", padding: "3px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>Veteran-Led</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80", background: "rgba(34,197,94,0.15)", padding: "3px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>Certified Innovators</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", lineHeight: "1.3" }}>Lean, agile small business</div>
            </div>
          </div>

          {/* Continuous Iterative Banner */}
          <div style={{ 
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            paddingTop: "12px",
            borderTop: "1px dashed rgba(255,255,255,0.15)",
            height: "40px"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12C4 7.58 7.58 4 12 4C14.39 4 16.53 5.05 18 6.71" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 12C20 16.42 16.42 20 12 20C9.61 20 7.47 18.95 6 17.29" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="18 3, 21 7, 17 7" fill="#a855f7" />
              <polygon points="6 21, 3 17, 7 17" fill="#a855f7" />
            </svg>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#a855f7", whiteSpace: "nowrap" }}>
              Continuous Iterative Development
            </span>
            <span style={{ fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap" }}>
              — Customer feedback drives every cycle
            </span>
          </div>
        </div>

        {/* Bottom: Capabilities + Credibility */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "14px", height: "200px" }}>
          
          {/* Integrated Frameworks */}
          <div style={{ 
            width: "260px",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "8px",
            padding: "12px",
            boxSizing: "border-box"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Doctrinal Frameworks
            </div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {["PMESII-PT", "ASCOPE", "CARVER"].map(fw => (
                <span key={fw} style={{ fontSize: "12px", fontWeight: 700, color: "#fff", background: "rgba(59,130,246,0.25)", padding: "4px 10px", borderRadius: "4px", whiteSpace: "nowrap" }}>{fw}</span>
              ))}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Multi-Modal Data
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {["Text", "Imagery", "Video", "Geospatial", "SIGACT", "Social"].map(src => (
                <span key={src} style={{ fontSize: "11px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", padding: "3px 7px", borderRadius: "4px", whiteSpace: "nowrap" }}>{src}</span>
              ))}
            </div>
          </div>

          {/* Why This Approach is Credible */}
          <div style={{ 
            width: "430px",
            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.04) 100%)",
            border: "2px solid rgba(34,197,94,0.3)",
            borderRadius: "8px",
            padding: "12px",
            boxSizing: "border-box"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              Why This Approach is Credible
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Practitioner-First", desc: "Built with operators & analysts" },
                { label: "Academic Rigor", desc: "Research-backed AI/ML" },
                { label: "Veteran Leadership", desc: "Military experience driving design" },
                { label: "Lean & Agile", desc: "Small business speed" },
                { label: "Certified Innovation", desc: "Proven methods" },
                { label: "Continuous Feedback", desc: "Operator input drives iteration" }
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: "2px", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", lineHeight: "1.2" }}>{item.label}</div>
                    <div style={{ fontSize: "10px", color: "#a7f3d0", lineHeight: "1.3" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div style={{ 
            width: "180px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxSizing: "border-box"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              The Result
            </div>
            {[
              { word: "Efficient", color: "#4ade80" },
              { word: "Accurate", color: "#60a5fa" },
              { word: "Rapid", color: "#fbbf24" }
            ].map(item => (
              <div key={item.word} style={{ fontSize: "18px", fontWeight: 700, color: item.color, marginBottom: "4px", lineHeight: "1.2" }}>
                {item.word}
              </div>
            ))}
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", lineHeight: "1.3" }}>Transition from research to operations</div>
          </div>
        </div>

        {/* Purpose Statement */}
        <div style={{
          padding: "10px 16px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          textAlign: "center",
          marginBottom: "10px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box"
        }}>
          <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600, lineHeight: "1.4" }}>
            Purpose: Deliver transparent, explainable, confidence-qualified intelligence to support rapid decision-making in high-stakes operational environments.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", height: "32px" }}>
          <div style={{
            fontSize: "12px", fontWeight: 700, color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase",
            padding: "5px 16px", border: "2px solid #22c55e", borderRadius: "4px",
            display: "flex", alignItems: "center"
          }}>
            UNCLASSIFIED
          </div>
        </div>
      </div>
    </div>
  )
}
