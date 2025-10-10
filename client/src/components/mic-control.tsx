import { useState, useRef } from "react"
import { Mic, MicOff, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

// Add type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface MicControlProps {
  onTranscription: (text: string) => void
  className?: string
}

export function MicControl({ onTranscription, className }: MicControlProps) {
  const { t } = useTranslation()
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  const startRecording = async () => {
    console.log('Speech recording started')
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false)
      console.log('Speech recognition not supported')
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsRecording(true)
        console.log('Speech recognition started')
      }
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        console.log('Speech transcribed:', transcript)
        onTranscription(transcript)
      }
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
        console.log('Speech recognition ended')
      }
      
      recognitionRef.current = recognition
      recognition.start()
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setIsSupported(false)
    }
  }

  const stopRecording = () => {
    console.log('Speech recording stopped')
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn("opacity-50", className)}
        data-testid="button-mic-unsupported"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      variant={isRecording ? "destructive" : "default"}
      size="icon"
      className={cn(
        "transition-all duration-200 w-14 h-14 rounded-full",
        isRecording 
          ? "animate-pulse bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
          : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]",
        className
      )}
      data-testid={isRecording ? "button-mic-stop" : "button-mic-start"}
    >
      {isRecording ? (
        <Square className="h-5 w-5 text-white" />
      ) : (
        <Mic className="h-5 w-5 text-white" />
      )}
      <span className="sr-only">
        {isRecording ? t('chat.mic.stop') : t('chat.mic.start')}
      </span>
    </Button>
  )
}