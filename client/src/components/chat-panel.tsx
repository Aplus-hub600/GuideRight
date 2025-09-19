import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MicControl } from "./mic-control"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  contextIds?: string[]
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<TacticalAnalysis | null>(null)

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

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ query, contextIds }: { query: string, contextIds?: string[] }) => {
      const response = await apiRequest('POST', '/api/chat', {
        query,
        contextIds: contextIds || []
      })
      return response.json()
    },
    onSuccess: (data) => {
      if (data?.success && data?.analysis) {
        // Parse assistant response from the analysis
        let content = data.analysis.summary
        
        if (data.analysis.keyFindings?.length > 0) {
          content += `\n\nKey findings:\n${data.analysis.keyFindings.map((finding: string) => `• ${finding}`).join('\n')}`
        }
        
        if (data.analysis.recommendations?.length > 0) {
          content += `\n\nRecommendations:\n${data.analysis.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}`
        }
        
        content += `\n\nRisk Level: ${data.analysis.riskLevel}\nConfidence: ${Math.round(data.analysis.confidence * 100)}%`

        const assistantMessage: ChatMessage = {
          id: data.message?.id || Date.now().toString(),
          role: "assistant",
          content,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setCurrentAnalysis(data.analysis)
      }
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] })
    },
    onError: (error: Error) => {
      console.error('Chat API error:', error)
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error.message || "Failed to process your query. Please try again."
      })
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again or check your connection.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  })

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || chatMutation.isPending) return
    
    const query = input.trim()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setCurrentAnalysis(null)
    
    console.log('Chat query submitted:', query)
    console.log('Query submitted:', query, 'with context:', mediaContextIds || [])
    
    // Call the onQuerySubmit callback for parent components
    onQuerySubmit?.(query, mediaContextIds)
    
    // Submit to backend API
    chatMutation.mutate({ 
      query, 
      contextIds: mediaContextIds 
    })
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

  const isAssistantTyping = chatMutation.isPending

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
                
                {message.role === "assistant" && currentAnalysis && (
                  <div className="mt-3">
                    <Badge 
                      variant={currentAnalysis.riskLevel === 'CRITICAL' ? 'destructive' :
                              currentAnalysis.riskLevel === 'HIGH' ? 'destructive' :
                              currentAnalysis.riskLevel === 'MEDIUM' ? 'secondary' : 'default'}
                      data-testid={`badge-risk-${currentAnalysis.riskLevel.toLowerCase()}`}
                    >
                      {currentAnalysis.riskLevel} Risk
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
        
        {isAssistantTyping && (
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
              disabled={isAssistantTyping}
              data-testid="textarea-chat-input"
            />
            <MicControl 
              onTranscription={handleTranscription}
              disabled={isAssistantTyping}
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isAssistantTyping}
            data-testid="button-chat-send"
          >
            {isAssistantTyping ? (
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