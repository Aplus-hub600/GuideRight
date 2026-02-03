import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { 
  Send, Loader2, Globe, Paperclip, Shield, 
  BarChart3, AlertTriangle, FileText, Briefcase, 
  Sparkles, ChevronRight, Zap, Target, Languages,
  Brain, GitBranch, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MicControl } from "./mic-control"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  contextIds?: string[]
  analysis?: TacticalAnalysis
  isStreaming?: boolean
}

interface ReasoningStep {
  step: number
  category: string
  observation: string
  implication: string
}

interface TacticalAnalysis {
  summary: string
  keyFindings: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
  confidence: number
  reasoningTrace?: ReasoningStep[]
  sources?: string[]
}

interface ChatPanelProps {
  onQuerySubmit?: (query: string, mediaContextIds?: string[]) => void
  mediaContextIds?: string[]
  className?: string
}

const QUICK_ACTIONS = [
  { id: "PMESII", label: "PMESII", icon: BarChart3, prompt: "Provide a comprehensive PMESII analysis for the current area of interest", color: "text-blue-400 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" },
  { id: "RISK_BRIEF", label: "Risk Brief", icon: AlertTriangle, prompt: "Generate a tactical risk assessment briefing", color: "text-orange-400 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20" },
  { id: "SITREP", label: "SITREP", icon: FileText, prompt: "Create a situation report for current operations", color: "text-green-400 bg-green-500/10 border-green-500/30 hover:bg-green-500/20" },
  { id: "MISSION", label: "Mission", icon: Briefcase, prompt: "Provide mission support analysis and recommendations", color: "text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" },
]

const RISK_COLORS = {
  LOW: "bg-green-500/20 text-green-300 border-green-500/40",
  MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse",
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse",
}

function detectNonEnglish(text: string): { isNonEnglish: boolean; detectedScript: string } {
  const banglaRegex = /[\u0980-\u09FF]/
  const hindiRegex = /[\u0900-\u097F]/
  const russianRegex = /[\u0400-\u04FF]/
  const chineseRegex = /[\u4E00-\u9FFF]/
  const arabicRange = /[\u0600-\u06FF]/
  
  const urduExclusive = /[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06D2\u06D3]/
  
  if (banglaRegex.test(text)) return { isNonEnglish: true, detectedScript: "Bangla" }
  if (hindiRegex.test(text)) return { isNonEnglish: true, detectedScript: "Hindi" }
  if (russianRegex.test(text)) return { isNonEnglish: true, detectedScript: "Russian" }
  if (chineseRegex.test(text)) return { isNonEnglish: true, detectedScript: "Chinese" }
  
  if (arabicRange.test(text)) {
    if (urduExclusive.test(text)) return { isNonEnglish: true, detectedScript: "Urdu" }
    return { isNonEnglish: true, detectedScript: "Arabic/Perso-Arabic" }
  }
  
  return { isNonEnglish: false, detectedScript: "English" }
}

function QueryInterpretationDisplay({ 
  originalQuery, 
  interpretedQuery,
  detectedScript 
}: { 
  originalQuery: string
  interpretedQuery: string
  detectedScript: string
}) {
  return (
    <div className="mx-4 mb-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <Languages className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
          Query Interpreted
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 dark:text-amber-400 border-amber-500/50">
          {detectedScript}
        </Badge>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground">Original:</span>
          <p className="mt-0.5 text-foreground/80">{originalQuery}</p>
        </div>
        <div>
          <span className="text-primary">Interpreted (EN):</span>
          <p className="mt-0.5 font-medium">{interpretedQuery}</p>
        </div>
      </div>
    </div>
  )
}

function generateInterpretation(text: string, script: string): string {
  const interpretations: Record<string, Record<string, string>> = {
    "Bangla": {
      "ঢাকায় হাসপাতাল কোথায়": "Where are hospitals located in Dhaka?",
      "নিরাপত্তা পরিস্থিতি কি": "What is the security situation?",
      "পরিবহন রুট দেখান": "Show transport routes",
      "ঝুঁকি মূল্যায়ন করুন": "Conduct risk assessment"
    },
    "Arabic": {
      "أين المستشفيات": "Where are the hospitals?",
      "تقييم المخاطر": "Risk assessment",
      "الوضع الأمني": "Security situation"
    },
    "Russian": {
      "анализ угроз": "Threat analysis",
      "оценка рисков": "Risk assessment"
    }
  }
  
  const scriptInterps = interpretations[script] || {}
  for (const [key, value] of Object.entries(scriptInterps)) {
    if (text.includes(key)) return value
  }
  
  const queryPatterns = [
    { pattern: /hospital|হাসপাতাল|مستشف/i, interpretation: "Query about healthcare facilities in the area" },
    { pattern: /risk|ঝুঁকি|خطر/i, interpretation: "Request for risk assessment" },
    { pattern: /security|নিরাপত্তা|أمن/i, interpretation: "Query about security situation" },
    { pattern: /transport|পরিবহন|نقل/i, interpretation: "Query about transportation infrastructure" }
  ]
  
  for (const { pattern, interpretation } of queryPatterns) {
    if (pattern.test(text)) return interpretation
  }
  
  return `Intelligence query (${script} input detected)`
}

function TypewriterText({ text, messageId }: { text: string; messageId: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const hasAnimatedRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (hasAnimatedRef.current === messageId) {
      setDisplayedText(text)
      return
    }
    
    hasAnimatedRef.current = messageId
    setIsTyping(true)
    setDisplayedText("")
    let currentIndex = 0
    
    const timer = setInterval(() => {
      currentIndex++
      setDisplayedText(text.slice(0, currentIndex))
      
      if (currentIndex >= text.length) {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, 8)
    
    return () => {
      clearInterval(timer)
    }
  }, [text, messageId])
  
  return (
    <span>
      {displayedText}
      {isTyping && displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
        />
      )}
    </span>
  )
}

function ConfidenceGauge({ value, animate = true }: { value: number; animate?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }
    
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const interval = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    
    return () => clearInterval(interval)
  }, [value, animate])
  
  const getConfidenceColor = (val: number) => {
    if (val >= 0.7) return "text-primary"
    if (val >= 0.4) return "text-secondary-foreground"
    return "text-destructive"
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-muted stroke-current"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className={cn("stroke-current", getConfidenceColor(displayValue))}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${displayValue * 100}, 100` }}
            transition={{ duration: animate ? 1 : 0, ease: "easeOut" }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xs font-bold", getConfidenceColor(displayValue))}>
            {Math.round(displayValue * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}

function PulsingIndicator({ active = true }: { active?: boolean }) {
  if (!active) return null
  
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
    </span>
  )
}

function IntelCard({ message }: { message: ChatMessage }) {
  const [expanded, setExpanded] = useState(false)
  
  if (!message.analysis) {
    return (
      <div className="text-[15px] whitespace-pre-wrap leading-relaxed text-foreground">
        {message.role === "assistant" ? (
          <TypewriterText text={message.content} messageId={message.id} />
        ) : (
          message.content
        )}
      </div>
    )
  }
  
  const { analysis } = message
  
  return (
    <div className="space-y-3">
      <div className="text-[15px] whitespace-pre-wrap leading-relaxed text-foreground">
        <TypewriterText text={message.content} messageId={message.id} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "border rounded-lg overflow-hidden bg-background/50 transition-all duration-300",
          analysis.riskLevel === 'CRITICAL' && "border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          analysis.riskLevel === 'HIGH' && "border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.12)]"
        )}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover-elevate"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-1.5 rounded-md",
              analysis.riskLevel === 'CRITICAL' ? "bg-red-500/20" :
              analysis.riskLevel === 'HIGH' ? "bg-orange-500/20" :
              analysis.riskLevel === 'MEDIUM' ? "bg-yellow-500/20" : "bg-green-500/20"
            )}>
              <Target className={cn(
                "h-4 w-4",
                analysis.riskLevel === 'CRITICAL' ? "text-red-400" :
                analysis.riskLevel === 'HIGH' ? "text-orange-400" :
                analysis.riskLevel === 'MEDIUM' ? "text-yellow-400" : "text-green-400"
              )} />
            </div>
            <span className="text-sm font-medium">Intelligence Assessment</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "border font-semibold",
                RISK_COLORS[analysis.riskLevel]
              )}
            >
              {analysis.riskLevel} RISK
            </Badge>
            <ConfidenceGauge value={analysis.confidence} animate={!expanded} />
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-200",
              expanded && "rotate-90"
            )} />
          </div>
        </div>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0 space-y-3 border-t">
                {analysis.keyFindings.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Key Findings
                    </span>
                    <ul className="space-y-1">
                      {analysis.keyFindings.map((finding, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm flex items-start gap-2"
                        >
                          <Zap className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                          {finding}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recommendations
                    </span>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" />
                          {rec}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.reasoningTrace && analysis.reasoningTrace.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-dashed">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reasoning Trace (Chain-of-Thought)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {analysis.reasoningTrace.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.15 }}
                          className="pl-3 border-l-2 border-primary/30 space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                              Step {step.step}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {step.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground">
                            <span className="font-medium">Observed:</span> {step.observation}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">Implication:</span> {step.implication}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.sources && analysis.sources.length > 0 && (
                  <div className="space-y-1 mt-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Sources
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.sources.map((source, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 h-4 font-mono text-muted-foreground"
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

interface InterpretedQuery {
  original: string
  interpreted: string
  script: string
}

export function ChatPanel({ onQuerySubmit, mediaContextIds, className }: ChatPanelProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastInterpretedQuery, setLastInterpretedQuery] = useState<InterpretedQuery | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isClearedRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault()
    
    const queryText = customPrompt || input.trim()
    if (!queryText || isStreaming) return
    
    if (!customPrompt) setInput("")
    setIsStreaming(true)
    isClearedRef.current = false
    
    const languageCheck = detectNonEnglish(queryText)
    if (languageCheck.isNonEnglish) {
      const interpretedQuery = generateInterpretation(queryText, languageCheck.detectedScript)
      setLastInterpretedQuery({
        original: queryText,
        interpreted: interpretedQuery,
        script: languageCheck.detectedScript
      })
    } else {
      setLastInterpretedQuery(null)
    }
    
    onQuerySubmit?.(queryText, mediaContextIds)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      // Automatically include recent conversation history for follow-up context
      const recentMessageIds = messages
        .slice(-10) // Last 10 messages for context
        .map(m => m.id)
        .filter((id): id is string => id !== undefined)
      
      // Combine media context with conversation history
      const allContextIds = [...(mediaContextIds || []), ...recentMessageIds]
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          contextIds: allContextIds
        }),
        signal: abortController.signal
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response body reader available')

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
              if (isClearedRef.current) break

              switch (data.type) {
                case 'user_message':
                  setMessages(prev => [...prev, {
                    ...data.data,
                    timestamp: new Date(data.data.timestamp)
                  }])
                  break
                  
                case 'assistant_message':
                  setMessages(prev => [...prev, {
                    ...data.data.message,
                    timestamp: new Date(data.data.message.timestamp),
                    analysis: data.data.analysis || null,
                    isStreaming: true
                  }])
                  break
                  
                case 'complete':
                  setIsStreaming(false)
                  setMessages(prev => prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, isStreaming: false } : m
                  ))
                  queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] })
                  break
                  
                case 'error':
                  setIsStreaming(false)
                  toast({
                    variant: "destructive",
                    title: data.data.code === 'quota_exceeded' ? "API Quota Exceeded" : "Chat Error",
                    description: data.data.error
                  })
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: data.data.code === 'quota_exceeded' 
                      ? "I'm currently experiencing API quota limits. Please try again later."
                      : "I encountered an error processing your request. Please try again.",
                    timestamp: new Date()
                  }])
                  break
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
      
    } catch (error) {
      if (isClearedRef.current || (error as Error).name === 'AbortError') return
      
      console.error('Chat streaming error:', error)
      setIsStreaming(false)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the chat service."
      })
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the service. Please try again.",
        timestamp: new Date()
      }])
    }
  }

  const handleQuickAction = (prompt: string) => {
    handleSubmit(undefined, prompt)
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
    setMessages([])
    setInput("")
    setIsStreaming(false)
  }

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden border-2 border-primary/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-4 py-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-muted/30 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary-rgb,59,130,246),0.08),transparent_50%)]" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-[0_0_12px_rgba(var(--primary-rgb,59,130,246),0.2)]">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">GIA</span>
              <Badge className="text-[10px] font-mono h-5 gap-1.5 px-2 bg-green-500/15 text-green-400 border-green-500/30">
                <PulsingIndicator />
                <span>ONLINE</span>
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">GuideRight Intelligence Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {isStreaming && (
            <Badge className="text-[10px] font-mono h-5 gap-1.5 px-2 bg-amber-500/15 text-amber-400 border-amber-500/30">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              PROCESSING
            </Badge>
          )}
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearChat}
              className="text-xs text-muted-foreground hover:text-destructive"
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
            <div className="flex flex-col items-center justify-center h-full p-6 relative">
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(var(--primary-rgb,59,130,246),0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb,59,130,246),0.3)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center max-w-md relative z-10"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center mb-5 mx-auto border border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb,59,130,246),0.2)] relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-2xl border border-dashed border-primary/20"
                  />
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  GuideRight Intelligence Assistant
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge className="text-[10px] font-mono px-2 bg-blue-500/10 text-blue-400 border-blue-500/30">TACTICAL</Badge>
                  <Badge className="text-[10px] font-mono px-2 bg-purple-500/10 text-purple-400 border-purple-500/30">PMESII</Badge>
                  <Badge className="text-[10px] font-mono px-2 bg-green-500/10 text-green-400 border-green-500/30">BANGLADESH</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Query intelligence sources, analyze threats, or request situational assessments
                </p>
                
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Quick Actions</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.prompt)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200",
                            action.color
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {lastInterpretedQuery && (
                <QueryInterpretationDisplay
                  originalQuery={lastInterpretedQuery.original}
                  interpretedQuery={lastInterpretedQuery.interpreted}
                  detectedScript={lastInterpretedQuery.script}
                />
              )}
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        message.role === "user" 
                          ? "bg-cyan-500/15 text-cyan-400" 
                          : "bg-primary/15 text-primary"
                      )}>
                        {message.role === "user" ? (
                          <Target className="h-3 w-3" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        {message.role === "user" ? "Operator" : "GIA"}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 font-mono">
                        {format(message.timestamp, "HH:mm:ss")}
                      </span>
                      {message.isStreaming && (
                        <Badge className="text-[10px] h-5 gap-1 px-1.5 bg-amber-500/15 text-amber-400 border-amber-500/30">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          Processing
                        </Badge>
                      )}
                    </div>
                    
                    <div className={cn(
                      "rounded-lg px-4 py-3 transition-all border-l-[3px]",
                      message.role === "user" 
                        ? "bg-cyan-500/5 border border-cyan-500/20 border-l-cyan-500" 
                        : "bg-muted/30 border border-border/50 border-l-primary"
                    )}>
                      <IntelCard message={message} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                      <Shield className="h-3 w-3" />
                      GIA
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {format(new Date(), "HH:mm:ss")}
                    </span>
                  </div>
                  <div className="bg-muted/30 border border-border/50 border-l-[3px] border-l-primary rounded-lg px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                          className="w-2.5 h-2.5 rounded-full bg-primary"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                          className="w-2.5 h-2.5 rounded-full bg-primary"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                          className="w-2.5 h-2.5 rounded-full bg-primary"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        Analyzing intelligence request...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-primary/10 bg-gradient-to-r from-primary/5 via-muted/20 to-transparent">
          {mediaContextIds && mediaContextIds.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/20">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Attached:</span>
              <div className="flex flex-wrap gap-1.5">
                {mediaContextIds.map((id) => (
                  <Badge key={id} className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/30">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative group">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter intelligence tasking or ask a question..."
                  className="min-h-[52px] max-h-[120px] resize-none pr-12 text-sm bg-background/80 border-border/50 focus:border-primary/50 focus:bg-background focus:shadow-[0_0_0_2px_rgba(var(--primary-rgb,59,130,246),0.1)] transition-all duration-200"
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
                className={cn(
                  "gap-2 shadow-lg transition-all duration-200",
                  input.trim() && !isStreaming && "shadow-[0_0_15px_rgba(var(--primary-rgb,59,130,246),0.3)]"
                )}
                data-testid="button-chat-send"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </Button>
            </form>
            <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">Ctrl</kbd>
                +
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">Enter</kbd>
                to send
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>Voice input available</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
