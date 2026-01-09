import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"

export type InfraConfidence = "verified" | "single-source" | "inferred"
export type InfraCategory = "hospital" | "transport" | "utility" | "government" | "education"

export interface InfrastructureNode {
  id: string
  name: string
  nameLocal?: string
  category: InfraCategory
  subCategory?: string
  lat: number
  lng: number
  confidence: InfraConfidence
  lastVerified?: string
  sources?: number
  details?: string
}

const DHAKA_LAT = 23.8103
const DHAKA_LNG = 90.4125

export const INFRASTRUCTURE_NODES: InfrastructureNode[] = [
  {
    id: "hosp-1",
    name: "Dhaka Medical College Hospital",
    nameLocal: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    category: "hospital",
    subCategory: "public teaching hospital",
    lat: DHAKA_LAT - 0.004,
    lng: DHAKA_LNG - 0.013,
    confidence: "verified",
    sources: 4,
    details: "Major tertiary care facility with 2,300+ beds. Emergency and trauma center."
  },
  {
    id: "hosp-2",
    name: "National Heart Foundation",
    nameLocal: "জাতীয় হৃদরোগ ইনস্টিটিউট",
    category: "hospital",
    subCategory: "specialized cardiac care",
    lat: DHAKA_LAT + 0.008,
    lng: DHAKA_LNG - 0.025,
    confidence: "verified",
    sources: 3,
    details: "Primary cardiac surgery center for Bangladesh."
  },
  {
    id: "hosp-3",
    name: "United Hospital",
    nameLocal: "ইউনাইটেড হাসপাতাল",
    category: "hospital",
    subCategory: "private multispecialty",
    lat: DHAKA_LAT + 0.065,
    lng: DHAKA_LNG + 0.005,
    confidence: "single-source",
    sources: 1,
    details: "Private healthcare facility with international standards."
  },
  {
    id: "hosp-4",
    name: "Sir Salimullah Medical College",
    nameLocal: "স্যার সলিমুল্লাহ মেডিকেল কলেজ",
    category: "hospital",
    subCategory: "public teaching hospital",
    lat: DHAKA_LAT - 0.012,
    lng: DHAKA_LNG - 0.005,
    confidence: "inferred",
    details: "Historic medical institution. Data aging - last verified 6 months ago."
  },
  {
    id: "trans-1",
    name: "Kamalapur Railway Station",
    nameLocal: "কমলাপুর রেলওয়ে স্টেশন",
    category: "transport",
    subCategory: "rail hub",
    lat: DHAKA_LAT + 0.003,
    lng: DHAKA_LNG + 0.016,
    confidence: "verified",
    sources: 5,
    details: "Main railway terminus. Connects all major rail corridors."
  },
  {
    id: "trans-2",
    name: "Hazrat Shahjalal International Airport",
    nameLocal: "হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর",
    category: "transport",
    subCategory: "international airport",
    lat: DHAKA_LAT + 0.113,
    lng: DHAKA_LNG - 0.012,
    confidence: "verified",
    sources: 6,
    details: "Primary international gateway. Civil and limited military operations."
  },
  {
    id: "trans-3",
    name: "Sadarghat Terminal",
    nameLocal: "সদরঘাট টার্মিনাল",
    category: "transport",
    subCategory: "water transport",
    lat: DHAKA_LAT - 0.022,
    lng: DHAKA_LNG - 0.003,
    confidence: "single-source",
    sources: 1,
    details: "Major river port for passenger and cargo ferries."
  },
  {
    id: "util-1",
    name: "Haripur Power Plant",
    nameLocal: "হরিপুর বিদ্যুৎ কেন্দ্র",
    category: "utility",
    subCategory: "power generation",
    lat: DHAKA_LAT + 0.020,
    lng: DHAKA_LNG - 0.040,
    confidence: "verified",
    sources: 2,
    details: "360MW combined cycle power plant."
  },
  {
    id: "util-2",
    name: "Saidabad Water Treatment Plant",
    nameLocal: "সায়দাবাদ পানি শোধনাগার",
    category: "utility",
    subCategory: "water treatment",
    lat: DHAKA_LAT - 0.035,
    lng: DHAKA_LNG + 0.025,
    confidence: "single-source",
    sources: 1,
    details: "Primary water treatment facility serving Dhaka metropolitan area."
  },
  {
    id: "gov-1",
    name: "Jatiya Sangsad Bhaban",
    nameLocal: "জাতীয় সংসদ ভবন",
    category: "government",
    subCategory: "legislative",
    lat: DHAKA_LAT + 0.032,
    lng: DHAKA_LNG - 0.032,
    confidence: "verified",
    sources: 4,
    details: "Seat of the national legislature. Louis Kahn designed."
  },
  {
    id: "gov-2",
    name: "Bangladesh Secretariat",
    nameLocal: "বাংলাদেশ সচিবালয়",
    category: "government",
    subCategory: "administrative",
    lat: DHAKA_LAT,
    lng: DHAKA_LNG - 0.005,
    confidence: "verified",
    sources: 3,
    details: "Central government administrative complex."
  }
]

interface MapInfrastructureLayerProps {
  map: maplibregl.Map | null
  isMapReady: boolean
  nodes: InfrastructureNode[]
  onNodeClick?: (node: InfrastructureNode) => void
  visible: boolean
}

const categoryColors: Record<InfraCategory, string> = {
  hospital: "#ef4444",
  transport: "#3b82f6",
  utility: "#f59e0b",
  government: "#8b5cf6",
  education: "#10b981"
}

const categoryIcons: Record<InfraCategory, string> = {
  hospital: "H",
  transport: "T",
  utility: "U",
  government: "G",
  education: "E"
}

function getConfidenceStyle(confidence: InfraConfidence): { opacity: number; border: string; fill: boolean } {
  switch (confidence) {
    case "verified":
      return { opacity: 1, border: "3px solid white", fill: true }
    case "single-source":
      return { opacity: 0.9, border: "3px solid currentColor", fill: false }
    case "inferred":
      return { opacity: 0.5, border: "2px dashed currentColor", fill: true }
    default:
      return { opacity: 1, border: "3px solid white", fill: true }
  }
}

export function useMapInfrastructureLayer({
  map,
  isMapReady,
  nodes,
  onNodeClick,
  visible
}: MapInfrastructureLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])
  
  useEffect(() => {
    if (!map || !isMapReady) return
    
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    
    if (!visible) return
    
    nodes.forEach((node) => {
      const color = categoryColors[node.category]
      const icon = categoryIcons[node.category]
      const style = getConfidenceStyle(node.confidence)
      
      const el = document.createElement("div")
      el.className = "infrastructure-marker"
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${style.fill ? color : "transparent"};
        color: ${style.fill ? "white" : color};
        border: ${style.border};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        opacity: ${style.opacity};
        transition: transform 0.2s;
      `
      el.innerHTML = icon
      
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.1)"
      })
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)"
      })
      
      const confidenceLabel = node.confidence === "verified" 
        ? "Verified" 
        : node.confidence === "single-source" 
          ? "Single Source" 
          : "Inferred"
      
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 12px; font-family: system-ui; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${color};
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 11px;
            ">${icon}</div>
            <div>
              <strong style="color: #1a1a1a; font-size: 13px;">${node.name}</strong>
              ${node.nameLocal ? `<div style="font-size: 11px; color: #666;">${node.nameLocal}</div>` : ""}
            </div>
          </div>
          <div style="font-size: 11px; color: #888; text-transform: capitalize; margin-bottom: 8px;">
            ${node.category}${node.subCategory ? ` • ${node.subCategory}` : ""}
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span style="
              font-size: 10px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
              background: ${style.opacity < 0.7 ? "#fef3c7" : style.fill ? "#dcfce7" : "#e0e7ff"};
              color: ${style.opacity < 0.7 ? "#92400e" : style.fill ? "#166534" : "#3730a3"};
            ">${confidenceLabel}</span>
            ${node.sources ? `<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #f3f4f6; color: #374151;">${node.sources} source${node.sources > 1 ? "s" : ""}</span>` : ""}
          </div>
          ${node.details ? `<div style="margin-top: 8px; font-size: 11px; color: #666; line-height: 1.4;">${node.details}</div>` : ""}
        </div>
      `)
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([node.lng, node.lat])
        .setPopup(popup)
        .addTo(map)
      
      el.addEventListener("click", () => {
        onNodeClick?.(node)
      })
      
      markersRef.current.push(marker)
    })
    
    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [map, isMapReady, nodes, visible, onNodeClick])
}
