import exifr from 'exifr'

export interface GPSData {
  lat: number
  lng: number
  altitude?: number
  accuracy?: number
  timestamp?: Date
}

export interface ExifMetadata {
  gps?: GPSData
  camera?: {
    make?: string
    model?: string
    software?: string
  }
  datetime?: Date
  orientation?: number
  [key: string]: any
}

/**
 * Convert GPS coordinates from DMS (Degrees, Minutes, Seconds) to decimal
 */
function dmsToDecimal(dms: number[], ref: string): number {
  if (!dms || dms.length < 3) return 0
  
  let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600
  
  // If southern hemisphere (latitude) or western hemisphere (longitude), make negative
  if (ref === 'S' || ref === 'W') {
    decimal = -decimal
  }
  
  return decimal
}

/**
 * Extract GPS coordinates and metadata from image file
 */
export async function extractGPSFromFile(file: File): Promise<ExifMetadata | null> {
  try {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image')
    }

    // Extract EXIF data using exifr
    const exifData = await exifr.parse(file, {
      gps: true,
      icc: false,
      iptc: false,
      jfif: false,
      ihdr: false,
      mergeOutput: false,
      sanitize: false,
      reviveValues: false
    })

    if (!exifData) {
      return null
    }

    const metadata: ExifMetadata = {}

    // Extract GPS data if available
    if (exifData.latitude && exifData.longitude) {
      // Handle modern format (decimal degrees)
      metadata.gps = {
        lat: exifData.latitude,
        lng: exifData.longitude,
        altitude: exifData.GPSAltitude || undefined
      }
    } else if (exifData.GPSLatitude && exifData.GPSLongitude) {
      // Handle legacy format (DMS array)
      const lat = Array.isArray(exifData.GPSLatitude) 
        ? dmsToDecimal(exifData.GPSLatitude, exifData.GPSLatitudeRef || 'N')
        : exifData.GPSLatitude
      
      const lng = Array.isArray(exifData.GPSLongitude)
        ? dmsToDecimal(exifData.GPSLongitude, exifData.GPSLongitudeRef || 'E') 
        : exifData.GPSLongitude

      if (lat !== 0 && lng !== 0) {
        metadata.gps = {
          lat,
          lng,
          altitude: exifData.GPSAltitude || undefined
        }
      }
    }

    // Extract camera information
    if (exifData.Make || exifData.Model || exifData.Software) {
      metadata.camera = {
        make: exifData.Make,
        model: exifData.Model,
        software: exifData.Software
      }
    }

    // Extract datetime
    if (exifData.DateTimeOriginal) {
      metadata.datetime = new Date(exifData.DateTimeOriginal)
    } else if (exifData.DateTime) {
      metadata.datetime = new Date(exifData.DateTime)
    }

    // Extract orientation
    if (exifData.Orientation) {
      metadata.orientation = exifData.Orientation
    }

    return metadata

  } catch (error) {
    console.error('Error extracting EXIF data:', error)
    return null
  }
}

/**
 * Extract GPS data from multiple files
 */
export async function extractGPSFromFiles(files: File[]): Promise<Array<{ file: File; metadata: ExifMetadata | null }>> {
  const results = await Promise.all(
    files.map(async (file) => ({
      file,
      metadata: await extractGPSFromFile(file)
    }))
  )
  
  return results
}

/**
 * Check if file has GPS data without full extraction
 */
export async function hasGPSData(file: File): Promise<boolean> {
  try {
    if (!file.type.startsWith('image/')) {
      return false
    }

    const gpsData = await exifr.gps(file)
    return !!(gpsData && gpsData.latitude && gpsData.longitude)
  } catch (error) {
    return false
  }
}