import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileImage, FileVideo, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface AnalyzedFile {
  id: string
  file: File
  preview?: string
  status: 'analyzing' | 'completed' | 'error'
  fileName?: string
  analysisType?: string
  extractedItems?: {
    id: string
    text: string
    pmesii: string[]
    quality: number
  }[]
  analysis?: any
  errorMessage?: string
}

interface FileDropProps {
  onAnalysisComplete?: (fileId: string, items: any[]) => void
  onFilesChange?: (fileIds: string[]) => void
  maxFiles?: number
  compact?: boolean
  className?: string
}

export function FileDrop({ 
  onAnalysisComplete, 
  onFilesChange, 
  maxFiles = 5,
  compact = false,
  className 
}: FileDropProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([])

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('analysisType', 'intelligence')

      const response = await fetch('/api/analysis/file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: (data, file) => {
      console.log('File upload successful:', data)
      
      // Update the file status to completed with analysis results
      setAnalyzedFiles(prev => {
        const updated = prev.map(f => {
          if (f.file === file) {
            const extractedItems = data.analysis ? [{
              id: `item-${data.fileId}`,
              text: data.analysis.summary || 'Analysis completed',
              pmesii: data.analysis.categories || ['General'],
              quality: data.analysis.confidence || 0.8
            }] : []

            const updatedFile = {
              ...f,
              id: data.fileId,
              status: 'completed' as const,
              fileName: data.fileName,
              analysis: data.analysis,
              extractedItems
            }

            // Notify parent component
            onAnalysisComplete?.(data.fileId, extractedItems)
            
            return updatedFile
          }
          return f
        })
        
        // Update parent with current file IDs from the updated array
        const completedFileIds = updated
          .filter(f => f.status === 'completed' && f.id && !f.id.startsWith('temp-'))
          .map(f => f.id)
        onFilesChange?.(completedFileIds)
        
        return updated
      })

      toast({
        title: "File Analysis Complete",
        description: `Successfully analyzed ${data.fileName || file.name}`,
      })
    },
    onError: (error: Error, file) => {
      console.error('File upload error:', error)
      
      // Update file status to error
      setAnalyzedFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { 
                ...f, 
                status: 'error' as const, 
                errorMessage: error.message 
              }
            : f
        )
      )

      toast({
        variant: "destructive",
        title: "File Analysis Failed",
        description: error.message.includes('quota') 
          ? "AI service quota exceeded. Please try again later."
          : `Failed to analyze ${file.name}: ${error.message}`,
      })
    }
  })

  const updateFileIds = () => {
    const completedFileIds = analyzedFiles
      .filter(f => f.status === 'completed' && f.id && !f.id.startsWith('temp-'))
      .map(f => f.id)
    onFilesChange?.(completedFileIds)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles)
    
    const newFiles = acceptedFiles.slice(0, maxFiles - analyzedFiles.length).map(file => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'analyzing' as const
    }))

    setAnalyzedFiles(prev => [...prev, ...newFiles])
    
    // Upload each file to the backend
    newFiles.forEach(analyzedFile => {
      uploadMutation.mutate(analyzedFile.file)
    })
    
  }, [analyzedFiles, maxFiles, uploadMutation])

  const removeFile = (fileId: string) => {
    setAnalyzedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      
      const updated = prev.filter(f => f.id !== fileId)
      
      // Update parent with current file IDs
      const completedFileIds = updated
        .filter(f => f.status === 'completed' && f.id && !f.id.startsWith('temp-'))
        .map(f => f.id)
      onFilesChange?.(completedFileIds)
      
      return updated
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: maxFiles - analyzedFiles.length,
    disabled: analyzedFiles.length >= maxFiles,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  })

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage
    if (file.type.startsWith('video/')) return FileVideo
    if (file.type.includes('text') || file.type.includes('document') || file.type.includes('pdf')) return FileText
    return Upload
  }

  const getStatusIcon = (status: AnalyzedFile['status']) => {
    switch (status) {
      case 'analyzing':
        return Loader2
      case 'completed':
        return CheckCircle2
      case 'error':
        return AlertCircle
      default:
        return Upload
    }
  }

  const getStatusColor = (status: AnalyzedFile['status']) => {
    switch (status) {
      case 'analyzing':
        return 'text-blue-500'
      case 'completed':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-300",
          isDragActive ? "border-blue-500 bg-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.4)] scale-[1.02]" : "border-blue-500/40 hover:border-blue-500/60 hover:bg-blue-500/5",
          analyzedFiles.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
        data-testid="file-drop-zone"
      >
        <input {...getInputProps()} />
        <div className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "py-3 px-3" : "py-8 px-4"
        )}>
          <Upload className={cn(
            compact ? "h-5 w-5 mb-2" : "h-10 w-10 mb-4",
            isDragActive ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-blue-400"
          )} />
          <p className={cn(
            "font-bold mb-1",
            compact ? "text-xs" : "text-lg mb-2 text-blue-100"
          )}>
            {isDragActive 
              ? t('fileDrop.dragActive') || "Drop files here..."
              : compact 
                ? "Drop files or click"
                : t('fileDrop.instruction') || "Drag & drop files or click to select"
            }
          </p>
          {!compact && (
            <p className="text-base font-semibold text-blue-200/90">
              Supports images, text files, PDFs, and Word documents • Max {maxFiles} files • 50MB each
            </p>
          )}
          {analyzedFiles.length >= maxFiles && (
            <p className="text-sm font-bold text-destructive mt-1">
              Max files reached
            </p>
          )}
        </div>
      </Card>

      {/* Analyzed Files List */}
      {analyzedFiles.length > 0 && (
        <div className={cn("space-y-2", compact && "space-y-1")}>
          <h3 className={cn("font-bold text-blue-100", compact ? "text-xs" : "text-lg")}>
            {compact ? `Files (${analyzedFiles.length}/${maxFiles})` : `${t('fileDrop.uploadedFiles') || "Uploaded Files"} (${analyzedFiles.length}/${maxFiles})`}
          </h3>
          
          {analyzedFiles.map((analyzedFile) => {
            const Icon = getFileIcon(analyzedFile.file)
            const StatusIcon = getStatusIcon(analyzedFile.status)
            
            return (
              <Card key={analyzedFile.id} className={cn(compact ? "p-2" : "p-4", "hover-elevate shadow-md border-blue-500/20")}>
                <div className={cn("flex items-start", compact ? "gap-2" : "gap-4")}>
                  {/* File preview or icon */}
                  <div className="flex-shrink-0">
                    {analyzedFile.preview ? (
                      <img
                        src={analyzedFile.preview}
                        alt={analyzedFile.file.name}
                        className={cn("object-cover rounded-xl border-2 border-blue-500/30", compact ? "w-8 h-8" : "w-14 h-14")}
                      />
                    ) : (
                      <div className={cn("bg-blue-500/10 rounded-xl flex items-center justify-center", compact ? "w-8 h-8" : "w-14 h-14")}>
                        <Icon className={cn("text-blue-400", compact ? "h-4 w-4" : "h-7 w-7")} />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className={cn("flex items-center justify-between", compact ? "mb-1" : "mb-2")}>
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={cn("font-bold truncate", compact ? "text-xs" : "text-base")} title={analyzedFile.file.name}>
                          {compact ? analyzedFile.file.name.split('.')[0].slice(0, 15) + (analyzedFile.file.name.length > 15 ? '...' : '') : analyzedFile.file.name}
                        </p>
                        <StatusIcon className={cn(
                          compact ? "h-3 w-3" : "h-5 w-5",
                          getStatusColor(analyzedFile.status),
                          analyzedFile.status === 'analyzing' && "animate-spin"
                        )} />
                      </div>
                      <Button
                        variant="ghost"
                        size={compact ? "sm" : "sm"}
                        onClick={() => removeFile(analyzedFile.id)}
                        className={compact ? "h-6 w-6 p-0" : ""}
                        data-testid={`button-remove-file-${analyzedFile.id}`}
                      >
                        <X className={compact ? "h-3 w-3" : "h-4 w-4"} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{(analyzedFile.file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <span>•</span>
                        <span className="capitalize">{analyzedFile.status}</span>
                      </div>

                      {/* Analysis Results */}
                      {analyzedFile.status === 'completed' && analyzedFile.extractedItems && (
                        <div className="space-y-2">
                          {analyzedFile.extractedItems.map((item) => (
                            <div key={item.id} className="bg-muted/50 rounded p-2">
                              <p className="text-xs mb-1">{item.text}</p>
                              <div className="flex flex-wrap gap-1">
                                {item.pmesii.map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Error Message */}
                      {analyzedFile.status === 'error' && analyzedFile.errorMessage && (
                        <div className="bg-destructive/10 text-destructive rounded p-2">
                          <p className="text-xs">{analyzedFile.errorMessage}</p>
                        </div>
                      )}

                      {/* Analyzing Status */}
                      {analyzedFile.status === 'analyzing' && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded p-2">
                          <p className="text-xs">Analyzing with AI intelligence systems...</p>
                        </div>
                      )}
                    </div>
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