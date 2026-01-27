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
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="24" cy="24" r="5" fill="#3b82f6" />
              <path d="M24 6L24 14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M24 34L24 42" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 24L14 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M34 24L42 24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
              GuideRight Development Methodology
            </h1>
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>
            Efficient, Accurate, Rapid Transition from Research to Operations
          </div>
        </div>

        {/* Main 3-Column Flow */}
        <div style={{ display: "flex", alignItems: "stretch", gap: "0", marginBottom: "16px" }}>
          
          {/* LEFT COLUMN - Team & Data */}
          <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Industry Leadership */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "14px"
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                Industry Leadership
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "3px" }}>Aplus Capabilities LLC</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>Offset3 LLC</div>
              <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 500 }}>Military-Led Small Business</div>
              <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: 500 }}>Certified Professional Innovators</div>
            </div>

            {/* Practitioner Grounding */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.06) 100%)",
              border: "2px solid rgba(59,130,246,0.35)",
              borderRadius: "8px",
              padding: "14px",
              position: "relative",
              flex: 1
            }}>
              <div style={{
                position: "absolute", top: "-9px", right: "10px",
                background: "#3b82f6", color: "#fff", fontSize: "9px", fontWeight: 700,
                padding: "3px 8px", borderRadius: "8px", textTransform: "uppercase"
              }}>Continuous</div>
              
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Practitioner Grounding
              </div>
              {["Intelligence Analysts", "Special Ops Personnel", "Scenario Interviews", "Feedback Loops"].map(item => (
                <div key={item} style={{ fontSize: "12px", color: "#ffffff", fontWeight: 500, marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#60a5fa" }} />
                  {item}
                </div>
              ))}
            </div>

            {/* Data Sources */}
            <div style={{ 
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px",
              padding: "12px"
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: "6px" }}>Multi-Modal Data</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                {["GDELT", "ACLED", "News", "Social"].map(src => (
                  <span key={src} style={{ fontSize: "10px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: "4px" }}>{src}</span>
                ))}
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: "6px" }}>Industry Partners</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["Fraym", "Seerist", "Sprinklr"].map(src => (
                  <span key={src} style={{ fontSize: "10px", fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: "4px" }}>{src}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ARROW: Left to Center */}
          <div style={{ width: "50px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <svg width="40" height="120" viewBox="0 0 40 120">
              <defs>
                <marker id="arrow1" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#60a5fa" />
                </marker>
              </defs>
              <path d="M 5 30 Q 20 30, 30 25" fill="none" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow1)" />
              <path d="M 5 60 L 30 60" fill="none" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow1)" />
              <path d="M 5 90 Q 20 90, 30 95" fill="none" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#arrow1)" />
            </svg>
          </div>

          {/* CENTER COLUMN - Process Stages */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* Research Stage */}
            <div style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(59,130,246,0.06) 100%)",
              border: "2px solid rgba(168,85,247,0.3)",
              borderRadius: "8px",
              padding: "12px 14px",
              position: "relative"
            }}>
              <div style={{ position: "absolute", top: "-9px", left: "12px", background: "#a855f7", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "8px", textTransform: "uppercase" }}>Research</div>
              <div style={{ position: "absolute", top: "-9px", right: "12px", background: "#a855f7", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "8px", textTransform: "uppercase" }}>Iterative</div>
              
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#c084fc", marginBottom: "8px", marginTop: "4px" }}>Academic Research Partners</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600 }}>University of Nebraska–Lincoln</div>
                <div style={{ fontSize: "11px", color: "#e9d5ff" }}>AI/ML Evaluation Methods</div>
                <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600 }}>The Citadel</div>
                <div style={{ fontSize: "11px", color: "#e9d5ff" }}>Reasoning & Uncertainty</div>
              </div>
            </div>

            {/* Applied Research / Platform */}
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(34,197,94,0.06) 100%)",
              border: "2px solid rgba(59,130,246,0.35)",
              borderRadius: "8px",
              padding: "14px 16px",
              position: "relative"
            }}>
              <div style={{ position: "absolute", top: "-9px", left: "12px", background: "linear-gradient(90deg, #3b82f6, #22c55e)", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 12px", borderRadius: "8px", textTransform: "uppercase" }}>Applied Research → Development</div>
              
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", marginBottom: "3px", marginTop: "6px" }}>GuideRight Platform</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px" }}>Battlespace Awareness Tactical Assistant</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 14px" }}>
                {[
                  "PMESII Assessment Query",
                  "AI Streaming Responses",
                  "SCEIGE Six-Factor Analysis",
                  "Multimodal AI (Gemini + OpenAI)",
                  "ODIN Country Analysis",
                  "Multi-Source Fusion",
                  "Dynamic Map Overlays",
                  "Automated Risk Assessment"
                ].map(item => (
                  <div key={item} style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500, display: "flex", alignItems: "center", gap: "5px" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable Products */}
            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.04) 100%)",
              border: "2px solid rgba(34,197,94,0.35)",
              borderRadius: "8px",
              padding: "12px 14px",
              position: "relative"
            }}>
              <div style={{ position: "absolute", top: "-9px", left: "12px", background: "#22c55e", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "8px", textTransform: "uppercase" }}>Deliverable Products</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", marginTop: "6px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", marginBottom: "4px" }}>TA5 Geospatial Analytics</div>
                  {["Web + Mobile Platform", "Chat & Voice Queries", "Interactive Mapping"].map(item => (
                    <div key={item} style={{ fontSize: "10px", color: "#e2e8f0", marginBottom: "2px" }}>• {item}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", marginBottom: "4px" }}>TA6 SITEMPs & Reports</div>
                  {["CUB-Ready Products", "Annotated Maps", "Actor Profiles"].map(item => (
                    <div key={item} style={{ fontSize: "10px", color: "#e2e8f0", marginBottom: "2px" }}>• {item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ARROW: Center to Right */}
          <div style={{ width: "50px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <svg width="40" height="120" viewBox="0 0 40 120">
              <defs>
                <marker id="arrow2" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#4ade80" />
                </marker>
              </defs>
              <path d="M 5 30 Q 20 30, 30 25" fill="none" stroke="#4ade80" strokeWidth="2.5" markerEnd="url(#arrow2)" />
              <path d="M 5 60 L 30 60" fill="none" stroke="#4ade80" strokeWidth="2.5" markerEnd="url(#arrow2)" />
              <path d="M 5 90 Q 20 90, 30 95" fill="none" stroke="#4ade80" strokeWidth="2.5" markerEnd="url(#arrow2)" />
            </svg>
          </div>

          {/* RIGHT COLUMN - Outcomes */}
          <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Transition Advantage */}
            <div style={{ 
              background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)",
              border: "2px solid rgba(34,197,94,0.35)",
              borderRadius: "8px",
              padding: "14px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Transition Advantage
              </div>
              {[
                { label: "Efficient", desc: "Integrated team, no handoffs" },
                { label: "Accurate", desc: "Practitioner-validated" },
                { label: "Rapid", desc: "Continuous iteration cycle" }
              ].map(item => (
                <div key={item.label} style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#22c55e" />
                      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#a7f3d0", marginLeft: "20px" }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Reviewer Takeaway */}
            <div style={{ 
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "14px",
              flex: 1
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                Reviewer Takeaway
              </div>
              {["Built with real practitioners", "Academic rigor + field realism", "Continuous analyst engagement", "Proven transition pathway"].map(item => (
                <div key={item} style={{ fontSize: "12px", color: "#ffffff", fontWeight: 500, marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#60a5fa", fontWeight: 700 }}>→</span>
                  {item}
                </div>
              ))}
            </div>

            {/* Key Differentiators */}
            <div style={{ 
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "8px",
              padding: "12px"
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", marginBottom: "6px" }}>Key Differentiators</div>
              {["Human-in-the-loop design", "Multi-source confidence fusion", "Operationally grounded"].map(item => (
                <div key={item} style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500, marginBottom: "3px" }}>• {item}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ITERATIVE FEEDBACK LOOP - Clear and Prominent */}
        <div style={{
          margin: "0 40px 20px 40px",
          padding: "12px 24px",
          background: "linear-gradient(90deg, rgba(59,130,246,0.08) 0%, rgba(168,85,247,0.12) 50%, rgba(34,197,94,0.08) 100%)",
          border: "2px solid rgba(168,85,247,0.3)",
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 7.58172 7.58172 4 12 4C14.3894 4 16.5341 5.04752 18 6.70835" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 12C20 16.4183 16.4183 20 12 20C9.61062 20 7.46592 18.9525 6 17.2917" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="18 3, 21 7, 17 7" fill="#a855f7" />
            <polygon points="6 21, 3 17, 7 17" fill="#a855f7" />
          </svg>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em" }}>Outcomes</span>
            <svg width="60" height="12" viewBox="0 0 60 12">
              <defs>
                <linearGradient id="loopGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <marker id="loopArrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                  <polygon points="0 0, 6 2.5, 0 5" fill="#60a5fa" />
                </marker>
              </defs>
              <path d="M 55 6 C 40 6, 20 6, 5 6" fill="none" stroke="url(#loopGrad)" strokeWidth="2.5" markerEnd="url(#loopArrow)" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Input</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            ITERATIVE FEEDBACK LOOP
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12C4 7.58172 7.58172 4 12 4C14.3894 4 16.5341 5.04752 18 6.70835" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 12C20 16.4183 16.4183 20 12 20C9.61062 20 7.46592 18.9525 6 17.2917" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="18 3, 21 7, 17 7" fill="#a855f7" />
            <polygon points="6 21, 3 17, 7 17" fill="#a855f7" />
          </svg>
        </div>

        {/* Purpose Statement */}
        <div style={{
          padding: "12px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          textAlign: "center",
          marginBottom: "14px"
        }}>
          <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 600 }}>
            Purpose: Support human judgment in complex, uncertain environments.
          </div>
          <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 600, fontStyle: "italic", marginTop: "3px" }}>
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
