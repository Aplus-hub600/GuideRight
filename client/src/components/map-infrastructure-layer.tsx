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
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.1s ease;
        ${style.fill ? `background: ${color};` : `background: transparent;`}
        ${style.fill ? "color: white;" : `color: ${color};`}
        border: ${style.border.replace("currentColor", color)};
        opacity: ${style.opacity};
        font-weight: 600;
        font-size: 12px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      `
      el.innerHTML = icon
      el.onmouseenter = () => { el.style.transform = "scale(1.1)" }
      el.onmouseleave = () => { el.style.transform = "scale(1)" }
      
      const confidenceLabel = node.confidence === "verified" ? "Multi-source verified" 
        : node.confidence === "single-source" ? "Single source" 
        : "Inferred / aging data"
      
      const popup = new maplibregl.Popup({ 
        offset: 20,
        closeButton: false,
        maxWidth: "280px"
      }).setHTML(`
        <div style="padding: 10px; font-family: system-ui, sans-serif;">
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
              font-size: 11px;
              font-weight: 600;
            ">${icon}</div>
            <div>
              <strong style="color: #1a1a1a; font-size: 13px;">${node.name}</strong>
              ${node.nameLocal ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${node.nameLocal}</div>` : ""}
            </div>
          </div>
          ${node.subCategory ? `<div style="color: #666; font-size: 11px; margin-bottom: 6px; text-transform: capitalize;">${node.subCategory}</div>` : ""}
          <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 10px; color: #666;">
            <span style="
              padding: 2px 6px;
              border-radius: 4px;
              background: ${style.opacity < 0.7 ? "#fef3c7" : style.fill ? "#dcfce7" : "#e0e7ff"};
              color: ${style.opacity < 0.7 ? "#92400e" : style.fill ? "#166534" : "#3730a3"};
            ">${confidenceLabel}</span>
            ${node.sources ? `<span style="padding: 2px 6px; border-radius: 4px; background: #f3f4f6; color: #374151;">${node.sources} source${node.sources > 1 ? "s" : ""}</span>` : ""}
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

export const MOCK_INFRASTRUCTURE_NODES: InfrastructureNode[] = [
  {
    id: "hosp-1",
    name: "Dhaka Medical College Hospital",
    nameLocal: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    category: "hospital",
    subCategory: "public teaching hospital",
    lat: 23.7260,
    lng: 90.3975,
    confidence: "verified",
    sources: 4,
    details: "Major tertiary care facility with 2,300+ beds. Emergency and trauma center."
  },
  {
    id: "hosp-2",
    name: "National Institute of Cardiovascular Diseases",
    nameLocal: "জাতীয় হৃদরোগ ইনস্টিটিউট",
    category: "hospital",
    subCategory: "specialized cardiac care",
    lat: 23.7385,
    lng: 90.3855,
    confidence: "verified",
    sources: 3,
    details: "Primary cardiac surgery center for the region."
  },
  {
    id: "hosp-3",
    name: "Apollo Hospitals Dhaka",
    nameLocal: "এপোলো হাসপাতাল ঢাকা",
    category: "hospital",
    subCategory: "private multispecialty",
    lat: 23.7959,
    lng: 90.4147,
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
    lat: 23.7182,
    lng: 90.4051,
    confidence: "inferred",
    details: "Historic medical institution. Data aging - last verified 6 months ago."
  },
  {
    id: "trans-1",
    name: "Kamalapur Railway Station",
    nameLocal: "কমলাপুর রেলওয়ে স্টেশন",
    category: "transport",
    subCategory: "rail hub",
    lat: 23.7326,
    lng: 90.4260,
    confidence: "verified",
    sources: 5,
    details: "Main railway terminus. Connects all major rail corridors."
  },
  {
    id: "trans-2",
    name: "Shahjalal International Airport",
    nameLocal: "শাহজালাল আন্তর্জাতিক বিমানবন্দর",
    category: "transport",
    subCategory: "international airport",
    lat: 23.8433,
    lng: 90.3978,
    confidence: "verified",
    sources: 6,
    details: "Primary international gateway. Civil and limited military operations."
  },
  {
    id: "trans-3",
    name: "Sadarghat River Terminal",
    nameLocal: "সদরঘাট নৌ টার্মিনাল",
    category: "transport",
    subCategory: "water transport",
    lat: 23.7080,
    lng: 90.4071,
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
    lat: 23.7500,
    lng: 90.3700,
    confidence: "verified",
    sources: 2,
    details: "360MW combined cycle power plant."
  },
  {
    id: "util-2",
    name: "Saidabad Water Treatment Plant",
    nameLocal: "সায়েদাবাদ পানি শোধনাগার",
    category: "utility",
    subCategory: "water treatment",
    lat: 23.6951,
    lng: 90.4350,
    confidence: "single-source",
    sources: 1,
    details: "Primary water treatment facility serving Dhaka metropolitan area."
  },
  {
    id: "gov-1",
    name: "National Parliament House",
    nameLocal: "জাতীয় সংসদ ভবন",
    category: "government",
    subCategory: "legislative",
    lat: 23.7625,
    lng: 90.3780,
    confidence: "verified",
    sources: 4,
    details: "Jatiya Sangsad Bhaban - seat of the national legislature."
  },
  {
    id: "gov-2",
    name: "Bangladesh Secretariat",
    nameLocal: "বাংলাদেশ সচিবালয়",
    category: "government",
    subCategory: "administrative",
    lat: 23.7300,
    lng: 90.4050,
    confidence: "verified",
    sources: 3,
    details: "Central government administrative complex."
  }
]
