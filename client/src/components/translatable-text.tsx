import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Languages, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TranslatableTextProps {
  originalText: string
  originalLanguage: string
  translatedText?: string
  timestamp?: string
  source?: string
  className?: string
  compact?: boolean
}

const languageNames: Record<string, string> = {
  en: "English",
  bn: "Bangla",
  ar: "Arabic",
  ur: "Urdu",
  ru: "Russian",
  fr: "French",
  es: "Spanish",
  zh: "Chinese",
  fa: "Farsi",
  ps: "Pashto",
  hi: "Hindi"
}

const languageCodes: Record<string, string> = {
  en: "EN",
  bn: "BN",
  ar: "AR",
  ur: "UR",
  ru: "RU",
  fr: "FR",
  es: "ES",
  zh: "ZH",
  fa: "FA",
  ps: "PS",
  hi: "HI"
}

export function TranslatableText({
  originalText,
  originalLanguage,
  translatedText,
  timestamp,
  source,
  className,
  compact = false
}: TranslatableTextProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const langCode = languageCodes[originalLanguage] || originalLanguage.toUpperCase()
  const langName = languageNames[originalLanguage] || originalLanguage
  const isEnglish = originalLanguage === "en"
  const hasTranslation = !!translatedText && !isEnglish

  const toggleTranslation = useCallback(() => {
    setShowTranslation(prev => !prev)
  }, [])

  if (compact) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-start gap-2">
          <Badge 
            variant="outline" 
            className="shrink-0 text-[10px] px-1.5 py-0 font-mono bg-muted/50"
          >
            {langCode}
          </Badge>
          <p className="text-sm leading-relaxed flex-1">
            {showTranslation && hasTranslation ? translatedText : originalText}
          </p>
        </div>
        {hasTranslation && (
          <div className="flex items-center gap-2 pl-8">
            {showTranslation && (
              <span className="text-[10px] text-amber-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Machine Translation
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTranslation}
              className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Languages className="h-3 w-3 mr-1" />
              {showTranslation ? "Show Original" : "Translate"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border bg-card/50", className)}>
      <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="text-xs font-mono"
          >
            {langCode}
          </Badge>
          <span className="text-xs text-muted-foreground">{langName}</span>
          {source && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{source}</span>
            </>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        )}
      </div>

      <div className="p-3 space-y-3">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
            Original ({langCode})
          </div>
          <p className={cn(
            "text-sm leading-relaxed",
            originalLanguage === "ar" || originalLanguage === "ur" || originalLanguage === "fa" || originalLanguage === "ps"
              ? "text-right font-arabic"
              : ""
          )}>
            {originalText}
          </p>
        </div>

        {hasTranslation && (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTranslation}
                className="h-7 text-xs gap-1"
              >
                <Languages className="h-3 w-3" />
                {showTranslation ? "Hide Translation" : "Translate → English"}
                {showTranslation ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>

            {showTranslation && (
              <div className="border-l-2 border-amber-500/50 pl-3 bg-amber-500/5 rounded-r py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    Translated (EN)
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-600 dark:text-amber-400 border-amber-500/50">
                    <AlertCircle className="h-2.5 w-2.5 mr-1" />
                    Machine Translation
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {translatedText}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function LanguageTag({ 
  language, 
  className 
}: { 
  language: string
  className?: string 
}) {
  const code = languageCodes[language] || language.toUpperCase()
  return (
    <Badge 
      variant="outline" 
      className={cn("text-[10px] px-1.5 py-0 font-mono bg-muted/50", className)}
    >
      {code}
    </Badge>
  )
}
