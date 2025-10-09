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

  // Load chat history - disabled for demo (starts empty until queried)
  const { data: chatHistory } = useQuery<{ messages: any[] }>({
    queryKey: ['/api/chat/history'],
    enabled: false // Disabled for clean demo start
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">GuideRight Tactical Assistant</p>
            <p className="text-base mt-3 font-medium text-slate-300">Ask about any area of interest for intelligence analysis</p>
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
              "max-w-[80%] p-5 rounded-2xl border-2 transition-all duration-300",
              message.role === "user" 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-400/50 shadow-[0_0_25px_rgba(59,130,246,0.4)]" 
                : "bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl text-slate-50 border-slate-600/50 shadow-[0_0_20px_rgba(100,116,139,0.3)]"
            )}>
              <div className="space-y-3">
                <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {message.role === "assistant" && message.analysis && (
                  <div className="mt-4">
                    <span className={cn(
                      "text-sm px-3 py-1.5 rounded-lg font-bold shadow-lg",
                      message.analysis.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white shadow-red-500/50' :
                      message.analysis.riskLevel === 'HIGH' ? 'bg-orange-500 text-white shadow-orange-500/50' :
                      message.analysis.riskLevel === 'MEDIUM' ? 'bg-yellow-500 text-white shadow-yellow-500/50' :
                      'bg-green-500 text-white shadow-green-500/50'
                    )}
                      data-testid={`badge-risk-${message.analysis.riskLevel.toLowerCase()}`}
                    >
                      {message.analysis.riskLevel} RISK
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.3)] border-2 border-blue-500/40">
              <div className="flex items-center gap-3 text-base font-semibold text-blue-300">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                Analyzing intelligence data...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t-2 border-slate-700/50 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-xl p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder') || "Ask about intelligence, threats, or request analysis..."}
              className="flex-1 bg-slate-800/60 border-2 border-slate-600/60 rounded-2xl px-5 py-3.5 text-base font-medium text-slate-50 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] resize-none min-h-[52px] max-h-[120px] transition-all"
              disabled={isStreaming}
              data-testid="textarea-chat-input"
            />
            <MicControl 
              onTranscription={handleTranscription}
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            data-testid="button-chat-send"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
        
        {mediaContextIds && mediaContextIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-slate-400">Context:</span>
            {mediaContextIds.map((id) => (
              <span key={id} className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {id}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}