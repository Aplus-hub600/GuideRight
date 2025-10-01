import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
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
  className?: string
}

export function ChatPanel({ onQuerySubmit, mediaContextIds, className }: ChatPanelProps) {
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

  // Load chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat/history'],
    enabled: true,
    onSuccess: (data) => {
      if (data?.messages && Array.isArray(data.messages)) {
        const formattedMessages = data.messages.reverse().map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(formattedMessages)
      }
    }
  })

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
          contextIds: mediaContextIds || []
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
                    analysis: data.data.analysis || null
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
                
                {message.role === "assistant" && message.analysis && (
                  <div className="mt-3">
                    <Badge 
                      variant={message.analysis.riskLevel === 'CRITICAL' ? 'destructive' :
                              message.analysis.riskLevel === 'HIGH' ? 'destructive' :
                              message.analysis.riskLevel === 'MEDIUM' ? 'secondary' : 'default'}
                      data-testid={`badge-risk-${message.analysis.riskLevel.toLowerCase()}`}
                    >
                      {message.analysis.riskLevel} Risk
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
        
        {isStreaming && (
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

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder') || "Ask about intelligence, threats, or request analysis..."}
              className="min-h-[40px] max-h-[120px] resize-none"
              disabled={isStreaming}
              data-testid="textarea-chat-input"
            />
            <MicControl 
              onTranscription={handleTranscription}
              disabled={isStreaming}
            />
          </div>
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
          <div className="flex flex-wrap gap-1 mt-2">
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