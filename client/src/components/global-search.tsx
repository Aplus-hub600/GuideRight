import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  MapPin, 
  FileImage, 
  Brain, 
  Shield, 
  Target,
  Calendar,
  Loader2
} from "lucide-react"
import type { SearchResult } from "@shared/schema"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectResult?: (result: SearchResult) => void
}

const typeIcons = {
  waypoint: Target,
  geotagged: FileImage,
  pmesii: Brain,
  intelligence: Search,
  risk: Shield
}

const typeLabels = {
  waypoint: "Waypoints",
  geotagged: "Geotagged Files",
  pmesii: "PMESII Analysis", 
  intelligence: "Intelligence",
  risk: "Risk Assessments"
}

export function GlobalSearch({ open, onOpenChange, onSelectResult }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data: searchResults, isLoading } = useQuery<{
    success: boolean
    results: SearchResult[]
    grouped: Record<string, SearchResult[]>
    total: number
  }>({
    queryKey: ["/api/search", debouncedSearch],
    enabled: open && debouncedSearch.length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedSearch,
        limit: "20"
      })
      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) throw new Error('Search failed')
      return response.json()
    }
  })

  const handleSelect = useCallback((result: SearchResult) => {
    onSelectResult?.(result)
    onOpenChange(false)
    setSearchTerm("")
  }, [onSelectResult, onOpenChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false)
      setSearchTerm("")
    }
  }, [onOpenChange])

  useEffect(() => {
    if (!open) {
      setSearchTerm("")
    }
  }, [open])

  const groupedResults = searchResults?.grouped || {}
  const hasResults = Object.keys(groupedResults).length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
        data-testid="dialog-global-search"
      >
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across waypoints, files, analysis, and intelligence data
        </DialogDescription>
        <Command className="rounded-lg border-0">
          <div className="border-b px-3">
            <CommandInput
              placeholder="Search waypoints, files, analysis, and more..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="border-0 focus:ring-0"
              data-testid="input-global-search"
            />
          </div>
          
          <CommandList className="max-h-[400px]">
            {isLoading && debouncedSearch.length >= 2 && (
              <div className="flex items-center justify-center p-8" data-testid="loading-search">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Searching...</span>
              </div>
            )}
            
            {!isLoading && debouncedSearch.length >= 2 && !hasResults && (
              <CommandEmpty data-testid="empty-search-results">
                <div className="text-center p-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or check spelling
                  </p>
                </div>
              </CommandEmpty>
            )}
            
            {debouncedSearch.length < 2 && (
              <div className="text-center p-8" data-testid="search-prompt">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Global Search</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Search across waypoints, files, analysis, and intelligence data
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge variant="secondary" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    Waypoints
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <FileImage className="h-3 w-3 mr-1" />
                    Files
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    Analysis
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Assessments
                  </Badge>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              {Object.entries(groupedResults).map(([type, results], index) => {
                const Icon = typeIcons[type as keyof typeof typeIcons] || Search
                const label = typeLabels[type as keyof typeof typeLabels] || type.charAt(0).toUpperCase() + type.slice(1)
                
                return (
                  <div key={type}>
                    {index > 0 && <Separator />}
                    <CommandGroup 
                      heading={
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                          <Icon className="h-3 w-3" />
                          {label}
                        </div>
                      }
                    >
                      {results.map((result: SearchResult) => (
                        <CommandItem
                          key={result.id}
                          value={`${result.type}-${result.id}-${result.title}`}
                          onSelect={() => handleSelect(result)}
                          className="p-3 cursor-pointer"
                          data-testid={`search-result-${result.type}-${result.id}`}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-medium truncate">{result.title}</h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {result.location && (
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(result.score * 100)}%
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {result.snippet}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(result.timestamp).toLocaleDateString()}
                                </div>
                                {result.tags && result.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {result.tags.slice(0, 2).map((tag, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs px-1 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </div>
                )
              })}
            </ScrollArea>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}