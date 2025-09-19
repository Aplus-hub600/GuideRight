import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileImage, FileVideo, X, CheckCircle2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface AnalyzedFile {
  id: string
  file: File
  preview?: string
  status: 'analyzing' | 'completed' | 'error'
  extractedItems?: {
    id: string
    text: string
    pmesii: string[]
    quality: number
  }[]
}

interface FileDropProps {
  onAnalysisComplete?: (fileId: string, items: any[]) => void
  onFilesChange?: (fileIds: string[]) => void
  maxFiles?: number
  className?: string
}

export function FileDrop({ 
  onAnalysisComplete, 
  onFilesChange, 
  maxFiles = 5,
  className 
}: FileDropProps) {
  const { t } = useTranslation()
  const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles)
    
    const newFiles = acceptedFiles.slice(0, maxFiles - analyzedFiles.length).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'analyzing' as const
    }))

    setAnalyzedFiles(prev => [...prev, ...newFiles])
    
    // Mock analysis for each file
    newFiles.forEach(async (analyzedFile) => {
      try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
        
        // Mock extraction results
        const mockItems = [
          {
            id: `item-${analyzedFile.id}-1`,
            text: `Visual analysis indicates increased vehicle movement in sector ${Math.floor(Math.random() * 10) + 1}. Estimated 15-20 personnel visible in image metadata.`,
            pmesii: ['Military', 'Infrastructure'],
            quality: 0.75 + Math.random() * 0.2
          },
          {
            id: `item-${analyzedFile.id}-2`, 
            text: `Geolocation data suggests proximity to key infrastructure. Environmental conditions appear favorable for operations.`,
            pmesii: ['Infrastructure'],
            quality: 0.65 + Math.random() * 0.25
          }
        ]

        setAnalyzedFiles(prev => 
          prev.map(f => 
            f.id === analyzedFile.id 
              ? { ...f, status: 'completed' as const, extractedItems: mockItems }
              : f
          )
        )

        onAnalysisComplete?.(analyzedFile.id, mockItems)
        
      } catch (error) {
        console.error('File analysis error:', error)
        setAnalyzedFiles(prev => 
          prev.map(f => 
            f.id === analyzedFile.id 
              ? { ...f, status: 'error' as const }
              : f
          )
        )
      }
    })

    // Update parent with current file IDs
    const allFileIds = [...analyzedFiles, ...newFiles].map(f => f.id)
    onFilesChange?.(allFileIds)
    
  }, [analyzedFiles, maxFiles, onAnalysisComplete, onFilesChange])

  const removeFile = (fileId: string) => {
    setAnalyzedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      onFilesChange?.(updated.map(f => f.id))
      return updated
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.webm']
    },
    maxFiles: maxFiles - analyzedFiles.length,
    disabled: analyzedFiles.length >= maxFiles
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage
    if (file.type.startsWith('video/')) return FileVideo
    return Upload
  }

  const getStatusIcon = (status: AnalyzedFile['status']) => {
    switch (status) {
      case 'analyzing': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error': return <X className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status: AnalyzedFile['status']) => {
    switch (status) {
      case 'analyzing': return 'Analyzing...'
      case 'completed': return 'Analysis Complete'
      case 'error': return 'Analysis Failed'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {analyzedFiles.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            "hover-elevate"
          )}
          data-testid="dropzone-media"
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive 
              ? "Drop files here..." 
              : t('upload.drop') || "Drop image or video files here"
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {maxFiles - analyzedFiles.length} files remaining
          </p>
        </div>
      )}

      {analyzedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Media ({analyzedFiles.length})</h4>
          
          {analyzedFiles.map((analyzedFile) => {
            const FileIcon = getFileIcon(analyzedFile.file)
            
            return (
              <Card key={analyzedFile.id} className="p-3">
                <div className="flex items-start gap-3">
                  {analyzedFile.preview ? (
                    <img 
                      src={analyzedFile.preview} 
                      alt={analyzedFile.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {analyzedFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(analyzedFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(analyzedFile.status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusText(analyzedFile.status)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(analyzedFile.id)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-remove-file-${analyzedFile.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {analyzedFile.extractedItems && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Extracted Intelligence:
                        </p>
                        {analyzedFile.extractedItems.map((item) => (
                          <div key={item.id} className="text-xs p-2 bg-muted rounded">
                            <div className="flex items-center gap-2 mb-1">
                              {item.pmesii.map(category => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              <span className="text-muted-foreground font-mono">
                                {Math.round(item.quality * 100)}%
                              </span>
                            </div>
                            <p>{item.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}