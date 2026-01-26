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
        scale: 2,
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
        className="bg-white p-8 rounded-lg"
        style={{ width: "900px", minHeight: "700px" }}
      >
        <svg
          viewBox="0 0 900 700"
          width="900"
          height="700"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {/* Background */}
          <rect width="900" height="700" fill="#ffffff" />

          {/* Center Node - GuideRight Platform */}
          <g transform="translate(450, 350)">
            <rect
              x="-140"
              y="-70"
              width="280"
              height="140"
              rx="8"
              fill="#1e3a5f"
              stroke="#0f2744"
              strokeWidth="2"
            />
            <text
              x="0"
              y="-30"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="18"
              fontWeight="600"
            >
              GuideRight Platform
            </text>
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
            >
              Research-Oriented Situational Awareness
            </text>
            <line x1="-100" y1="15" x2="100" y2="15" stroke="#334d6e" strokeWidth="1" />
            <text x="0" y="38" textAnchor="middle" fill="#cbd5e1" fontSize="10">
              Analyst-in-the-Loop
            </text>
            <text x="0" y="52" textAnchor="middle" fill="#cbd5e1" fontSize="10">
              Explainable · Scenario-Driven
            </text>
          </g>

          {/* Left Section - Practitioner Input */}
          <g transform="translate(100, 350)">
            <rect
              x="-80"
              y="-100"
              width="160"
              height="200"
              rx="6"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="-70"
              textAnchor="middle"
              fill="#1e3a5f"
              fontSize="13"
              fontWeight="600"
            >
              Practitioner
            </text>
            <text
              x="0"
              y="-55"
              textAnchor="middle"
              fill="#1e3a5f"
              fontSize="13"
              fontWeight="600"
            >
              Engagement
            </text>
            <line x1="-60" y1="-40" x2="60" y2="-40" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="-55" cy="-18" r="3" fill="#64748b" />
            <text x="-45" y="-14" fill="#475569" fontSize="10">Intelligence Analysts</text>
            <circle cx="-55" cy="2" r="3" fill="#64748b" />
            <text x="-45" y="6" fill="#475569" fontSize="10">Special Operations</text>
            <text x="-45" y="16" fill="#475569" fontSize="10">Personnel</text>
            <circle cx="-55" cy="36" r="3" fill="#64748b" />
            <text x="-45" y="40" fill="#475569" fontSize="10">Structured Interviews</text>
            <circle cx="-55" cy="56" r="3" fill="#64748b" />
            <text x="-45" y="60" fill="#475569" fontSize="10">Iterative Scenario</text>
            <text x="-45" y="70" fill="#475569" fontSize="10">Feedback</text>
          </g>

          {/* Left Arrow */}
          <g transform="translate(230, 350)">
            <line x1="0" y1="0" x2="70" y2="0" stroke="#64748b" strokeWidth="2" />
            <polygon points="75,0 65,-6 65,6" fill="#64748b" />
          </g>

          {/* Top Section - Industry Leadership */}
          <g transform="translate(450, 100)">
            <rect
              x="-100"
              y="-70"
              width="200"
              height="140"
              rx="6"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="-40"
              textAnchor="middle"
              fill="#1e3a5f"
              fontSize="13"
              fontWeight="600"
            >
              Aplus Capabilities
            </text>
            <line x1="-80" y1="-25" x2="80" y2="-25" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="-70" cy="-5" r="3" fill="#64748b" />
            <text x="-60" y="-1" fill="#475569" fontSize="10">Small Business</text>
            <circle cx="-70" cy="15" r="3" fill="#64748b" />
            <text x="-60" y="19" fill="#475569" fontSize="10">Military-Led</text>
            <circle cx="-70" cy="35" r="3" fill="#64748b" />
            <text x="-60" y="39" fill="#475569" fontSize="10">Certified Professional</text>
            <text x="-60" y="49" fill="#475569" fontSize="10">Innovator</text>
          </g>

          {/* Top Arrow */}
          <g transform="translate(450, 210)">
            <line x1="0" y1="0" x2="0" y2="60" stroke="#64748b" strokeWidth="2" />
            <polygon points="0,70 -6,60 6,60" fill="#64748b" />
          </g>

          {/* Right Section - Academic Research */}
          <g transform="translate(800, 350)">
            <rect
              x="-80"
              y="-110"
              width="160"
              height="220"
              rx="6"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="-80"
              textAnchor="middle"
              fill="#1e3a5f"
              fontSize="13"
              fontWeight="600"
            >
              Academic Research
            </text>
            <text
              x="0"
              y="-65"
              textAnchor="middle"
              fill="#1e3a5f"
              fontSize="13"
              fontWeight="600"
            >
              Collaboration
            </text>
            <line x1="-60" y1="-50" x2="60" y2="-50" stroke="#e2e8f0" strokeWidth="1" />
            <text x="0" y="-30" textAnchor="middle" fill="#334d6e" fontSize="10" fontWeight="500">
              University of Nebraska–Lincoln
            </text>
            <text x="0" y="-15" textAnchor="middle" fill="#334d6e" fontSize="10" fontWeight="500">
              The Citadel
            </text>
            <line x1="-50" y1="0" x2="50" y2="0" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="-55" cy="22" r="3" fill="#64748b" />
            <text x="-45" y="26" fill="#475569" fontSize="10">AI/ML & Reasoning</text>
            <circle cx="-55" cy="42" r="3" fill="#64748b" />
            <text x="-45" y="46" fill="#475569" fontSize="10">Geospatial & Risk</text>
            <text x="-45" y="56" fill="#475569" fontSize="10">Analysis</text>
            <circle cx="-55" cy="76" r="3" fill="#64748b" />
            <text x="-45" y="80" fill="#475569" fontSize="10">Evaluation</text>
            <text x="-45" y="90" fill="#475569" fontSize="10">Methodology</text>
          </g>

          {/* Right Bidirectional Arrow */}
          <g transform="translate(595, 350)">
            <line x1="0" y1="0" x2="110" y2="0" stroke="#64748b" strokeWidth="2" />
            <polygon points="-5,0 5,-6 5,6" fill="#64748b" />
            <polygon points="115,0 105,-6 105,6" fill="#64748b" />
          </g>

          {/* Bottom Section - Outcome */}
          <g transform="translate(450, 600)">
            <rect
              x="-180"
              y="-55"
              width="360"
              height="110"
              rx="6"
              fill="#f0fdf4"
              stroke="#86efac"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="-25"
              textAnchor="middle"
              fill="#166534"
              fontSize="14"
              fontWeight="600"
            >
              Resulting Differentiation
            </text>
            <line x1="-150" y1="-10" x2="150" y2="-10" stroke="#86efac" strokeWidth="1" />
            <circle cx="-145" cy="12" r="3" fill="#22c55e" />
            <text x="-135" y="16" fill="#15803d" fontSize="11">Aligned with real analyst workflows</text>
            <circle cx="-145" cy="32" r="3" fill="#22c55e" />
            <text x="-135" y="36" fill="#15803d" fontSize="11">Explicit treatment of uncertainty</text>
            <circle cx="-145" cy="52" r="3" fill="#22c55e" />
            <text x="-135" y="56" fill="#15803d" fontSize="11">Research-ready for evaluation and transition</text>
          </g>

          {/* Bottom Arrow */}
          <g transform="translate(450, 430)">
            <line x1="0" y1="0" x2="0" y2="100" stroke="#64748b" strokeWidth="2" />
            <polygon points="0,110 -6,100 6,100" fill="#64748b" />
          </g>

          {/* Title */}
          <text
            x="450"
            y="35"
            textAnchor="middle"
            fill="#0f172a"
            fontSize="16"
            fontWeight="600"
          >
            Practitioner-Grounded, Interdisciplinary Development
          </text>
        </svg>
      </div>
    </div>
  )
}
