import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, MapPin, Camera, FileImage, X, CheckCircle, AlertCircle } from 'lucide-react'
import { extractGPSFromFile, type ExifMetadata } from '@/utils/exifExtractor'
import { apiRequest, queryClient } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface GeotaggedFile {
  id: string
  file: File
  metadata: ExifMetadata | null
  uploaded: boolean
  uploading: boolean
  error?: string
}

interface GeotaggedUploadProps {
  onFilesGeotagged?: (files: GeotaggedFile[]) => void
  maxFiles?: number
  className?: string
}

export function GeotaggedUpload({ 
  onFilesGeotagged, 
  maxFiles = 10,
  className 
}: GeotaggedUploadProps) {
  const [geotaggedFiles, setGeotaggedFiles] = useState<GeotaggedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const processFiles = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setProcessing(true)
    const newFiles: GeotaggedFile[] = []

    try {
      for (const file of acceptedFiles) {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Extract GPS metadata
        const metadata = await extractGPSFromFile(file)
        
        const geotaggedFile: GeotaggedFile = {
          id: fileId,
          file,
          metadata,
          uploaded: false,
          uploading: false
        }

        newFiles.push(geotaggedFile)
      }

      setGeotaggedFiles(prev => [...prev, ...newFiles])
      onFilesGeotagged?.(newFiles)

      // Show summary toast
      const geotaggedCount = newFiles.filter(f => f.metadata?.gps).length
      const totalCount = newFiles.length
      
      if (geotaggedCount > 0) {
        toast({
          title: 'GPS Data Extracted',
          description: `Found location data in ${geotaggedCount} of ${totalCount} files`,
        })
      } else {
        toast({
          title: 'No GPS Data Found',
          description: 'None of the uploaded files contain location information',
          variant: 'destructive'
        })
      }

    } catch (error) {
      console.error('Error processing files:', error)
      toast({
        title: 'Processing Error',
        description: 'Failed to extract GPS data from files',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }, [onFilesGeotagged, toast])

  const uploadFile = useCallback(async (geotaggedFile: GeotaggedFile) => {
    if (!geotaggedFile.metadata?.gps) {
      toast({
        title: 'No GPS Data',
        description: 'This file does not contain location information',
        variant: 'destructive'
      })
      return
    }

    // Update file status
    setGeotaggedFiles(prev => 
      prev.map(f => 
        f.id === geotaggedFile.id 
          ? { ...f, uploading: true, error: undefined }
          : f
      )
    )

    try {
      // Create geotagged file record
      const geotagData = {
        fileId: geotaggedFile.id,
        filename: geotaggedFile.file.name,
        lat: geotaggedFile.metadata.gps.lat,
        lng: geotaggedFile.metadata.gps.lng,
        altitude: geotaggedFile.metadata.gps.altitude,
        source: 'exif' as const,
        metadata: {
          size: geotaggedFile.file.size,
          type: geotaggedFile.file.type,
          lastModified: geotaggedFile.file.lastModified,
          camera: geotaggedFile.metadata.camera,
          datetime: geotaggedFile.metadata.datetime,
          orientation: geotaggedFile.metadata.orientation
        }
      }

      await apiRequest('POST', '/api/geotagged', geotagData).then(res => res.json())

      // Update file status
      setGeotaggedFiles(prev => 
        prev.map(f => 
          f.id === geotaggedFile.id 
            ? { ...f, uploading: false, uploaded: true }
            : f
        )
      )

      // Invalidate geotagged files cache to refresh the map
      queryClient.invalidateQueries({ queryKey: ['/api/geotagged'] })
      
      toast({
        title: 'File Geotagged',
        description: `${geotaggedFile.file.name} has been saved with location data`,
      })

    } catch (error) {
      console.error('Error uploading geotagged file:', error)
      
      setGeotaggedFiles(prev => 
        prev.map(f => 
          f.id === geotaggedFile.id 
            ? { ...f, uploading: false, error: 'Upload failed' }
            : f
        )
      )

      toast({
        title: 'Upload Failed',
        description: 'Failed to save geotagged file',
        variant: 'destructive'
      })
    }
  }, [toast])

  const removeFile = useCallback((fileId: string) => {
    setGeotaggedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const uploadAllFiles = useCallback(async () => {
    const filesToUpload = geotaggedFiles.filter(f => 
      !f.uploaded && !f.uploading && f.metadata?.gps
    )

    for (const file of filesToUpload) {
      await uploadFile(file)
    }
  }, [geotaggedFiles, uploadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.heic', '.heif']
    },
    maxFiles,
    disabled: processing
  })

  const hasGeotaggedFiles = geotaggedFiles.some(f => f.metadata?.gps)
  const hasUploadableFiles = geotaggedFiles.some(f => 
    !f.uploaded && !f.uploading && f.metadata?.gps
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card 
        {...getRootProps()} 
        className={cn(
          'p-6 border-2 border-dashed cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          processing && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} data-testid="input-geotagged-upload" />
        <div className="text-center space-y-3">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop images here...' : 'Upload Images with GPS Data'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag & drop images or click to browse. GPS coordinates will be extracted automatically.
            </p>
          </div>
          {processing && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground">Processing GPS data...</p>
            </div>
          )}
        </div>
      </Card>

      {/* File List */}
      {geotaggedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Processed Files ({geotaggedFiles.length})
            </h3>
            {hasUploadableFiles && (
              <Button
                onClick={uploadAllFiles}
                size="sm"
                className="gap-2"
                data-testid="button-upload-all-geotagged"
              >
                <MapPin className="h-4 w-4" />
                Upload All Geotagged
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {geotaggedFiles.map((geotaggedFile) => (
              <div
                key={geotaggedFile.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {geotaggedFile.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {(geotaggedFile.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      {geotaggedFile.metadata?.gps ? (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <MapPin className="h-3 w-3" />
                          {geotaggedFile.metadata.gps.lat.toFixed(4)}, {geotaggedFile.metadata.gps.lng.toFixed(4)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No GPS data
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {geotaggedFile.uploaded && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Geotagged
                    </Badge>
                  )}
                  {geotaggedFile.uploading && (
                    <Badge variant="secondary">Uploading...</Badge>
                  )}
                  {geotaggedFile.error && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </Badge>
                  )}
                  {!geotaggedFile.uploaded && !geotaggedFile.uploading && geotaggedFile.metadata?.gps && (
                    <Button
                      onClick={() => uploadFile(geotaggedFile)}
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      data-testid={`button-upload-${geotaggedFile.id}`}
                    >
                      <MapPin className="h-3 w-3" />
                      Geotag
                    </Button>
                  )}
                  <Button
                    onClick={() => removeFile(geotaggedFile.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    data-testid={`button-remove-${geotaggedFile.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      {hasGeotaggedFiles && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>{geotaggedFiles.filter(f => f.metadata?.gps).length}</strong> files contain GPS location data and can be displayed on the tactical map.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}