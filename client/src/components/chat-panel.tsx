import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MicControl } from "./mic-control"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  contextIds?: string[]
  analysis?: TacticalAnalysis
  odinSource?: string // ODIN scenario used for this response
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
  // Analysis is now stored per message instead of global state
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  const { data: chatHistory } = useQuery<{ messages: any[] }>({
    queryKey: ['/api/chat/history'],
    enabled: true // Enable to restore chat history after refresh
  })

  // Handle chat history data
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
    // Analysis will be stored per message
    setIsStreaming(true)
    
    console.log('Chat query submitted:', query)
    console.log('Query submitted:', query, 'with context:', mediaContextIds || [])
    
    // Call the onQuerySubmit callback for parent components
    onQuerySubmit?.(query, mediaContextIds)
    
    // Close any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      // Create FormData for the streaming request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          contextIds: mediaContextIds || [],
          odinCountry: odinCountry
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response
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
        
        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'user_message':
                  setMessages(prev => [...prev, {
                    ...data.data,
                    timestamp: new Date(data.data.timestamp)
                  }])
                  break
                  
                case 'typing':
                  // Typing indicator handled by isStreaming state
                  break
                  
                case 'assistant_message':
                  setMessages(prev => [...prev, {
                    ...data.data.message,
                    timestamp: new Date(data.data.message.timestamp),
                    analysis: data.data.analysis || null,
                    odinSource: data.data.odinSource // Include ODIN source attribution
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
                  
                  // Add error message to chat
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
      console.error('Chat streaming error:', error)
      setIsStreaming(false)
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the chat service. Please check your connection and try again."
      })
      
      // Add error message to chat
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xl font-semibold text-foreground">GuideRight Tactical Assistant</p>
            <p className="text-sm mt-2 text-muted-foreground">Ask about any area of interest for intelligence analysis</p>
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
            <div className={cn(
              "max-w-[85%] px-4 py-3 rounded-lg",
              message.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-card text-card-foreground border"
            )}>
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {message.role === "assistant" && (message.analysis || message.odinSource) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {message.analysis && (
                      <Badge
                        variant={
                          message.analysis.riskLevel === 'CRITICAL' ? 'destructive' :
                          message.analysis.riskLevel === 'HIGH' ? 'destructive' :
                          message.analysis.riskLevel === 'MEDIUM' ? 'default' :
                          'outline'
                        }
                        className={cn(
                          "text-xs font-semibold",
                          message.analysis.riskLevel === 'CRITICAL' && 'bg-red-600',
                          message.analysis.riskLevel === 'HIGH' && 'bg-orange-600',
                          message.analysis.riskLevel === 'MEDIUM' && 'bg-yellow-600',
                          message.analysis.riskLevel === 'LOW' && 'bg-green-600 text-white'
                        )}
                        data-testid={`badge-risk-${message.analysis.riskLevel.toLowerCase()}`}
                      >
                        {message.analysis.riskLevel} RISK
                      </Badge>
                    )}
                    {message.odinSource && (
                      <Badge 
                        className="text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1.5"
                        data-testid="badge-odin-source"
                      >
                        <Globe className="h-3 w-3" />
                        ODIN: {message.odinSource}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-card border px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder') || "Ask about intelligence, threats, or request analysis..."}
            className="flex-1 resize-none min-h-[52px] max-h-[120px]"
            disabled={isStreaming}
            data-testid="textarea-chat-input"
          />
          <MicControl 
            onTranscription={handleTranscription}
          />
          <Button 
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            data-testid="button-chat-send"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {mediaContextIds && mediaContextIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Context:</span>
            {mediaContextIds.map((id) => (
              <Badge key={id} variant="outline" className="text-xs">
                {id}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}