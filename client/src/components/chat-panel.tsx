import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Globe, Paperclip, Shield, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MicControl } from "./mic-control"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  contextIds?: string[]
  analysis?: TacticalAnalysis
  odinSource?: string
}

interface TacticalAnalysis {
  summary: string
  keyFindings: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
  confidence: number
}

interface ChatPanelProps {
  onQuerySubmit?: (query: string, mediaContextIds?: string[]) => void
  mediaContextIds?: string[]
  odinCountry?: string
  className?: string
}

export function ChatPanel({ onQuerySubmit, mediaContextIds, odinCountry, className }: ChatPanelProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isClearedRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const { data: chatHistory } = useQuery<{ messages: any[] }>({
    queryKey: ['/api/chat/history'],
    enabled: false
  })

  useEffect(() => {
    if (chatHistory?.messages && Array.isArray(chatHistory.messages)) {
      const formattedMessages = chatHistory.messages.reverse().map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      setMessages(formattedMessages)
    }
  }, [chatHistory])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isStreaming) return
    
    const query = input.trim()
    setInput("")
    setIsStreaming(true)
    isClearedRef.current = false
    
    onQuerySubmit?.(query, mediaContextIds)
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          contextIds: mediaContextIds || [],
          odinCountry: odinCountry
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (isClearedRef.current) {
                break
              }

              switch (data.type) {
                case 'user_message':
                  setMessages(prev => [...prev, {
                    ...data.data,
                    timestamp: new Date(data.data.timestamp)
                  }])
                  break
                  
                case 'typing':
                  break
                  
                case 'assistant_message':
                  setMessages(prev => [...prev, {
                    ...data.data.message,
                    timestamp: new Date(data.data.message.timestamp),
                    analysis: data.data.analysis || null,
                    odinSource: data.data.odinSource
                  }])
                  break
                  
                case 'complete':
                  setIsStreaming(false)
                  queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] })
                  break
                  
                case 'error':
                  setIsStreaming(false)
                  toast({
                    variant: "destructive",
                    title: data.data.code === 'quota_exceeded' ? "API Quota Exceeded" : "Chat Error",
                    description: data.data.error
                  })
                  
                  const errorMessage: ChatMessage = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: data.data.code === 'quota_exceeded' 
                      ? "I'm currently experiencing API quota limits. Please try again later."
                      : "I encountered an error processing your request. Please try again.",
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, errorMessage])
                  break
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
      
    } catch (error) {
      if (isClearedRef.current || (error as Error).name === 'AbortError') {
        return
      }
      
      console.error('Chat streaming error:', error)
      setIsStreaming(false)
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the chat service. Please check your connection and try again."
      })
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the service. Please check your connection and try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  const handleClearChat = () => {
    isClearedRef.current = true
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setMessages([])
    setInput("")
    setIsStreaming(false)
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-wide">GIA</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="outline" className="text-xs font-mono gap-1.5 px-2">
            <Radio className="h-2.5 w-2.5 text-primary" />
            ONLINE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {odinCountry && (
            <Badge variant="secondary" className="text-xs gap-1.5" data-testid="badge-chat-odin">
              <Globe className="h-3 w-3" />
              {odinCountry}
            </Badge>
          )}
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearChat}
              className="text-xs text-muted-foreground"
              data-testid="button-clear-chat"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-1">GuideRight Intelligence Assistant</h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wide mb-4">
                TACTICAL ANALYSIS • ODIN INTEGRATION • PMESII
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Query intelligence sources, analyze threats, or request situational assessments
              </p>
              {odinCountry && (
                <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-muted rounded-md border">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Active AOI: {odinCountry}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn(
                      "text-xs font-medium",
                      message.role === "user" ? "text-primary" : "text-muted-foreground"
                    )}>
                      {message.role === "user" ? "You" : "GIA"}
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-mono">
                      {format(message.timestamp, "HH:mm:ss")}
                    </span>
                    {message.odinSource && (
                      <Badge variant="outline" className="text-xs h-5 gap-1 px-1.5">
                        <Globe className="h-2.5 w-2.5" />
                        {message.odinSource}
                      </Badge>
                    )}
                  </div>
                  
                  <div className={cn(
                    "rounded-lg px-4 py-3",
                    message.role === "user" 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted/50 border"
                  )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    
                    {message.role === "assistant" && message.analysis && (
                      <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">
                        <Badge
                          variant={getRiskBadgeVariant(message.analysis.riskLevel)}
                          className="text-xs"
                          data-testid={`badge-risk-${message.analysis.riskLevel.toLowerCase()}`}
                        >
                          {message.analysis.riskLevel} RISK
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                          <span className="text-muted-foreground">Confidence:</span>
                          {Math.round(message.analysis.confidence * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isStreaming && (
                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">GIA</span>
                    <span className="text-xs text-muted-foreground/60 font-mono">
                      {format(new Date(), "HH:mm:ss")}
                    </span>
                  </div>
                  <div className="bg-muted/50 border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing intelligence request...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t bg-muted/20">
          {mediaContextIds && mediaContextIds.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Attached:</span>
              <div className="flex flex-wrap gap-1.5">
                {mediaContextIds.map((id) => (
                  <Badge key={id} variant="secondary" className="text-xs h-5 px-1.5">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter intelligence tasking..."
                  className="min-h-[48px] max-h-[120px] resize-none pr-10 text-sm bg-background border-border/50 focus:border-primary/50"
                  disabled={isStreaming}
                  data-testid="textarea-chat-input"
                />
                <div className="absolute right-2 bottom-2">
                  <MicControl 
                    onTranscription={handleTranscription}
                    compact
                  />
                </div>
              </div>
              <Button 
                type="submit"
                size="lg"
                disabled={!input.trim() || isStreaming}
                className="gap-2"
                data-testid="button-chat-send"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Send</span>
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
              Press Ctrl+Enter to send • Voice input available
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
