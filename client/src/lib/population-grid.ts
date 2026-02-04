/**
 * Population Density Grid Generator
 * Creates a 40x40 grid of population density points for the Dhaka AOI
 * Uses a deterministic city-center gradient with controlled noise for realistic appearance
 */

// Dhaka AOI bounds (approximately 30km x 30km area)
const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 }
const AOI_RADIUS_KM = 15 // 15km radius = 30km diameter
const GRID_SIZE = 40 // 40x40 = 1600 points

// Approximate conversion: 1 degree ≈ 111km at equator
const KM_TO_DEG = 1 / 111

// Grid configuration - exported for grid cell rendering
export const GRID_CONFIG = {
  center: DHAKA_CENTER,
  radiusKm: AOI_RADIUS_KM,
  gridSize: GRID_SIZE,
  stepSize: (AOI_RADIUS_KM * 2 * KM_TO_DEG) / GRID_SIZE // ~0.0075 degrees per cell (~750m)
}

export interface PopulationGridPoint {
  lat: number
  lng: number
  density: number // 0-1 normalized value
  rawDensity: number // Actual density per km² (estimated)
  urbanLevel: 'high' | 'medium' | 'low'
}

export interface PopulationGridData {
  points: PopulationGridPoint[]
  gridSize: number
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  timestamp: string
  source: string
  metadata: {
    totalPoints: number
    avgDensity: number
    maxDensity: number
    minDensity: number
  }
}

/**
 * Seeded random number generator for deterministic noise
 * Uses a simple LCG (Linear Congruential Generator)
 */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/**
 * Generates a distance-based density with city center being highest
 * Adds controlled noise for realistic variation
 */
function calculateDensity(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  random: () => number
): number {
  // Calculate distance from center in km
  const dLat = (lat - centerLat) * 111
  const dLng = (lng - centerLng) * 111 * Math.cos(centerLat * Math.PI / 180)
  const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng)
  
  // Base density: exponential decay from center
  // Dhaka center: ~45,000/km², suburbs: ~5,000-15,000/km², outskirts: ~1,000-3,000/km²
  const maxDensity = 45000
  const minDensity = 500
  const decayRate = 0.15 // Controls how fast density drops
  
  let baseDensity = maxDensity * Math.exp(-distanceKm * decayRate)
  
  // Add secondary urban centers (realistic city structure)
  const secondaryCenters = [
    { lat: 23.8750, lng: 90.3980, factor: 0.7 }, // Uttara
    { lat: 23.7509, lng: 90.3938, factor: 0.8 }, // Mirpur
    { lat: 23.7890, lng: 90.4070, factor: 0.6 }, // Mohammadpur
    { lat: 23.7330, lng: 90.4127, factor: 0.75 }, // Dhanmondi
    { lat: 23.7550, lng: 90.4285, factor: 0.65 }, // Tejgaon
  ]
  
  for (const center of secondaryCenters) {
    const dLat2 = (lat - center.lat) * 111
    const dLng2 = (lng - center.lng) * 111 * Math.cos(lat * Math.PI / 180)
    const dist2 = Math.sqrt(dLat2 * dLat2 + dLng2 * dLng2)
    baseDensity += maxDensity * center.factor * Math.exp(-dist2 * 0.4)
  }
  
  // Add controlled noise (±20% variation)
  const noise = 1 + (random() - 0.5) * 0.4
  baseDensity *= noise
  
  // Add some "hotspot" clusters
  if (random() > 0.92) {
    baseDensity *= 1 + random() * 0.3 // Random 30% boost for hotspots
  }
  
  // Clamp to realistic range
  return Math.max(minDensity, Math.min(maxDensity * 1.2, baseDensity))
}

/**
 * Classifies density into activity levels (whitepaper-aligned qualitative labels)
 * Uses descriptive terms that avoid implying false precision
 */
function classifyUrbanLevel(density: number): 'high' | 'medium' | 'low' {
  // Keep interface compatible but use more conservative thresholds
  if (density >= 25000) return 'high'
  if (density >= 10000) return 'medium'
  return 'low'
}

/**
 * Generates the full population density grid for Dhaka AOI
 * Returns deterministic data (same output for same inputs)
 */
export function generatePopulationGrid(
  center: { lat: number; lng: number } = DHAKA_CENTER,
  radiusKm: number = AOI_RADIUS_KM,
  gridSize: number = GRID_SIZE
): PopulationGridData {
  const random = seededRandom(42) // Fixed seed for deterministic results
  const points: PopulationGridPoint[] = []
  
  // Calculate bounds
  const latSpan = radiusKm * KM_TO_DEG
  const lngSpan = radiusKm * KM_TO_DEG / Math.cos(center.lat * Math.PI / 180)
  
  const bounds = {
    north: center.lat + latSpan,
    south: center.lat - latSpan,
    east: center.lng + lngSpan,
    west: center.lng - lngSpan
  }
  
  // Generate grid points
  const latStep = (bounds.north - bounds.south) / (gridSize - 1)
  const lngStep = (bounds.east - bounds.west) / (gridSize - 1)
  
  let totalDensity = 0
  let maxDensity = 0
  let minDensity = Infinity
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = bounds.south + i * latStep
      const lng = bounds.west + j * lngStep
      
      const rawDensity = calculateDensity(lat, lng, center.lat, center.lng, random)
      const density = rawDensity / 45000 // Normalize to 0-1
      
      points.push({
        lat,
        lng,
        density: Math.min(1, density),
        rawDensity,
        urbanLevel: classifyUrbanLevel(rawDensity)
      })
      
      totalDensity += rawDensity
      maxDensity = Math.max(maxDensity, rawDensity)
      minDensity = Math.min(minDensity, rawDensity)
    }
  }
  
  return {
    points,
    gridSize,
    bounds,
    timestamp: new Date().toISOString(),
    source: "WorldPop/VIIRS (Demo Baseline)",
    metadata: {
      totalPoints: points.length,
      avgDensity: Math.round(totalDensity / points.length),
      maxDensity: Math.round(maxDensity),
      minDensity: Math.round(minDensity)
    }
  }
}

/**
 * Samples population density at a specific location
 * Uses bilinear interpolation for smooth values
 */
export function sampleDensityAtLocation(
  lat: number,
  lng: number,
  grid: PopulationGridData
): { density: number; rawDensity: number; urbanLevel: 'high' | 'medium' | 'low'; label: string } | null {
  const { bounds, gridSize, points } = grid
  
  // Check if within bounds
  if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) {
    return null
  }
  
  // Calculate grid indices
  const latStep = (bounds.north - bounds.south) / (gridSize - 1)
  const lngStep = (bounds.east - bounds.west) / (gridSize - 1)
  
  const i = (lat - bounds.south) / latStep
  const j = (lng - bounds.west) / lngStep
  
  // Get surrounding grid points for interpolation
  const i0 = Math.floor(i)
  const j0 = Math.floor(j)
  const i1 = Math.min(i0 + 1, gridSize - 1)
  const j1 = Math.min(j0 + 1, gridSize - 1)
  
  // Interpolation weights
  const ti = i - i0
  const tj = j - j0
  
  // Get corner values
  const getPoint = (row: number, col: number) => points[row * gridSize + col]
  const p00 = getPoint(i0, j0)
  const p01 = getPoint(i0, j1)
  const p10 = getPoint(i1, j0)
  const p11 = getPoint(i1, j1)
  
  // Bilinear interpolation
  const density = 
    p00.density * (1 - ti) * (1 - tj) +
    p01.density * (1 - ti) * tj +
    p10.density * ti * (1 - tj) +
    p11.density * ti * tj
  
  const rawDensity = 
    p00.rawDensity * (1 - ti) * (1 - tj) +
    p01.rawDensity * (1 - ti) * tj +
    p10.rawDensity * ti * (1 - tj) +
    p11.rawDensity * ti * tj
  
  const urbanLevel = classifyUrbanLevel(rawDensity)
  
  // Generate qualitative label (whitepaper: avoid false precision)
  // Uses intensity-band language instead of precise classifications
  let label: string
  if (density >= 0.70) {
    label = 'Concentrated'
  } else if (density >= 0.45) {
    label = 'Elevated'
  } else if (density >= 0.25) {
    label = 'Moderate'
  } else if (density >= 0.10) {
    label = 'Dispersed'
  } else {
    label = 'Sparse'
  }
  
  return {
    density: Math.round(density * 100) / 100,
    rawDensity: Math.round(rawDensity),
    urbanLevel,
    label
  }
}

// Pre-generate and cache the grid data
let cachedGrid: PopulationGridData | null = null

export function getPopulationGrid(): PopulationGridData {
  if (!cachedGrid) {
    cachedGrid = generatePopulationGrid()
  }
  return cachedGrid
}

/**
 * Route Exposure Analysis
 * Calculates exposure level along a route based on activity density
 * Returns qualitative assessment per whitepaper philosophy
 */
export interface RouteExposureAnalysis {
  exposureLevel: 'lower' | 'moderate' | 'elevated' | 'higher'
  avgDensity: number
  maxDensity: number
  samples: number
  description: string
  recommendation: string
}

export function analyzeRouteExposure(
  coordinates: [number, number][], // [lng, lat] format
  grid: PopulationGridData
): RouteExposureAnalysis {
  if (coordinates.length < 2) {
    return {
      exposureLevel: 'lower',
      avgDensity: 0,
      maxDensity: 0,
      samples: 0,
      description: 'Insufficient route data',
      recommendation: 'Unable to assess'
    }
  }
  
  // Sample density at multiple points along the route
  const densities: number[] = []
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[i + 1]
    
    // Sample start, middle, and end of each segment
    for (let t = 0; t <= 1; t += 0.25) {
      const lat = lat1 + (lat2 - lat1) * t
      const lng = lng1 + (lng2 - lng1) * t
      
      const sample = sampleDensityAtLocation(lat, lng, grid)
      if (sample) {
        densities.push(sample.density)
      }
    }
  }
  
  if (densities.length === 0) {
    return {
      exposureLevel: 'lower',
      avgDensity: 0,
      maxDensity: 0,
      samples: 0,
      description: 'Route outside coverage area',
      recommendation: 'No activity data available'
    }
  }
  
  const avgDensity = densities.reduce((a, b) => a + b, 0) / densities.length
  const maxDensity = Math.max(...densities)
  
  // Determine exposure level using qualitative bands
  let exposureLevel: 'lower' | 'moderate' | 'elevated' | 'higher'
  let description: string
  let recommendation: string
  
  if (avgDensity >= 0.55 || maxDensity >= 0.70) {
    exposureLevel = 'higher'
    description = 'Route passes through concentrated activity areas'
    recommendation = 'Consider alternate corridor if available'
  } else if (avgDensity >= 0.35 || maxDensity >= 0.50) {
    exposureLevel = 'elevated'
    description = 'Route has elevated activity exposure'
    recommendation = 'Maintain situational awareness'
  } else if (avgDensity >= 0.18 || maxDensity >= 0.30) {
    exposureLevel = 'moderate'
    description = 'Route shows moderate activity levels'
    recommendation = 'Standard movement posture'
  } else {
    exposureLevel = 'lower'
    description = 'Route through lower activity areas'
    recommendation = 'Favorable movement corridor'
  }
  
  return {
    exposureLevel,
    avgDensity: Math.round(avgDensity * 100) / 100,
    maxDensity: Math.round(maxDensity * 100) / 100,
    samples: densities.length,
    description,
    recommendation
  }
}
