import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MicControl } from "./mic-control"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
  confidence?: {
    belief: number
    disbelief: number
    uncertainty: number
  }
  riskScore?: number
  timestamp: Date
}

interface ChatPanelProps {
  onQuerySubmit?: (query: string, mediaContextIds?: string[]) => void
  mediaContextIds?: string[]
  className?: string
}

export function ChatPanel({ onQuerySubmit, mediaContextIds, className }: ChatPanelProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const query = input.trim()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    console.log('Chat query submitted:', query)
    
    try {
      // Mock response for prototype
      setTimeout(() => {
        const mockResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant", 
          content: `Based on the intelligence assessment for your area of interest, I've analyzed data from multiple sources. The current risk assessment indicates moderate security concerns with elevated infrastructure vulnerabilities.

Key findings:
• Political stability remains uncertain due to recent policy changes
• Military presence has increased by 15% in the last 48 hours  
• Economic indicators show supply chain disruptions affecting 3 major routes
• Social tensions are elevated following yesterday's demonstration
• Communication networks are operating at 85% capacity
• Infrastructure security has been compromised at 2 checkpoints

Recommended actions: Avoid main arterial routes between 1400-1800 hours. Use alternate communication channels for sensitive operations.`,
          sources: ["Fraym", "Seerist", "News", "Weather"],
          confidence: {
            belief: 0.78,
            disbelief: 0.12,
            uncertainty: 0.10
          },
          riskScore: 67,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, mockResponse])
        setIsLoading(false)
      }, 2000)
      
      onQuerySubmit?.(query, mediaContextIds)
      
    } catch (error) {
      console.error('Error submitting query:', error)
      setIsLoading(false)
    }
  }

  const handleTranscription = (text: string) => {
    setInput(prev => prev + " " + text)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const renderConfidenceBar = (confidence: NonNullable<ChatMessage['confidence']>) => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{t('confidence.label')}:</span>
      <div className="flex gap-1">
        <div className="flex items-center gap-1">
          <div className="w-8 h-2 bg-secondary rounded">
            <div 
              className="h-full bg-green-500 rounded" 
              style={{ width: `${confidence.belief * 100}%` }}
            />
          </div>
          <span>{Math.round(confidence.belief * 100)}%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-medium">GuideRight Tactical Assistant</p>
            <p className="text-sm mt-2">Ask about any area of interest for intelligence analysis</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <Card className={cn(
              "max-w-[80%] p-4",
              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <div className="space-y-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.sources && (
                  <div className="flex flex-wrap gap-1">
                    {message.sources.map((source, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {t(`sources.${source.toLowerCase()}`)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {message.confidence && renderConfidenceBar(message.confidence)}
                
                {message.riskScore !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    {t('risk.score')}: <span className="font-mono">{message.riskScore}/100</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-muted p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing intelligence data...
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-background/50 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="resize-none min-h-[44px] pr-12"
                rows={2}
                disabled={isLoading}
                data-testid="textarea-chat-input"
              />
              <div className="absolute right-2 top-2">
                <MicControl onTranscription={handleTranscription} />
              </div>
            </div>
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="self-end"
              data-testid="button-send-chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {mediaContextIds && mediaContextIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Context:</span>
              {mediaContextIds.map((id) => (
                <Badge key={id} variant="outline" className="text-xs">
                  Media-{id.slice(0, 6)}
                </Badge>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Press Ctrl+Enter to send
          </p>
        </form>
      </div>
    </div>
  )
}