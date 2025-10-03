import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { 
  Search, 
  MapPin, 
  FileImage, 
  Brain, 
  Shield, 
  Target,
  Calendar,
  Loader2,
  Filter,
  X,
  Clock
} from "lucide-react"
import { format, subDays, subWeeks, subMonths } from "date-fns"
import type { SearchResult } from "@shared/schema"

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectResult?: (result: SearchResult) => void
}

interface SearchFilters {
  location?: string
  timeRange?: string
  dateFrom?: Date
  dateTo?: Date
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

const locationOptions = [
  { value: "dhaka", label: "Dhaka, Bangladesh" },
  { value: "chittagong", label: "Chittagong, Bangladesh" },
  { value: "sylhet", label: "Sylhet, Bangladesh" },
  { value: "khulna", label: "Khulna, Bangladesh" },
  { value: "rajshahi", label: "Rajshahi, Bangladesh" },
  { value: "bangladesh", label: "All Bangladesh" },
]

const timeRangeOptions = [
  { value: "1h", label: "Last Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 3 Months" },
  { value: "custom", label: "Custom Range" },
]

export function GlobalSearch({ open, onOpenChange, onSelectResult }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [customDateOpen, setCustomDateOpen] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data: searchResults, isLoading } = useQuery<{
    success: boolean
    results: SearchResult[]
    grouped: Record<string, SearchResult[]>
    total: number
  }>({
    queryKey: ["/api/search", debouncedSearch, filters],
    enabled: open && debouncedSearch.length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedSearch,
        limit: "20"
      })
      
      // Add location filter
      if (filters.location) {
        params.append("location", filters.location)
      }
      
      // Add time range filter
      if (filters.timeRange) {
        if (filters.timeRange === "custom" && filters.dateFrom && filters.dateTo) {
          params.append("dateFrom", filters.dateFrom.toISOString())
          params.append("dateTo", filters.dateTo.toISOString())
        } else {
          params.append("timeRange", filters.timeRange)
        }
      }
      
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
      setFilters({})
      setShowFilters(false)
    }
  }, [onOpenChange])

  useEffect(() => {
    if (!open) {
      setSearchTerm("")
      setFilters({})
      setShowFilters(false)
    }
  }, [open])

  const handleLocationChange = (location: string) => {
    setFilters(prev => ({ ...prev, location: location === "all" ? undefined : location }))
  }

  const handleTimeRangeChange = (timeRange: string) => {
    if (timeRange === "custom") {
      setCustomDateOpen(true)
      setFilters(prev => ({ ...prev, timeRange }))
    } else if (timeRange === "all") {
      setFilters(prev => ({ ...prev, timeRange: undefined, dateFrom: undefined, dateTo: undefined }))
    } else {
      setFilters(prev => ({ ...prev, timeRange, dateFrom: undefined, dateTo: undefined }))
    }
  }

  const handleCustomDateSelect = (dateFrom: Date | undefined, dateTo: Date | undefined) => {
    setFilters(prev => ({ ...prev, dateFrom, dateTo }))
    setCustomDateOpen(false)
  }

  const clearFilters = () => {
    setFilters({})
    setShowFilters(false)
  }

  const hasActiveFilters = !!(filters.location || filters.timeRange)

  const groupedResults = searchResults?.grouped || {}
  const hasResults = Object.keys(groupedResults).length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl p-0 gap-0 overflow-hidden bg-white/90 backdrop-blur-md border-gray-200"
        onKeyDown={handleKeyDown}
        data-testid="dialog-global-search"
      >
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across waypoints, files, analysis, and intelligence data
        </DialogDescription>
        <Command className="rounded-lg border-0">
          <div className="border-b">
            <div className="flex items-center px-3">
              <CommandInput
                placeholder="Search waypoints, files, analysis, and more..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="border-0 focus:ring-0 flex-1"
                data-testid="input-global-search"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-2 ${hasActiveFilters ? 'text-primary' : ''}`}
                data-testid="button-search-filters"
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && <div className="w-2 h-2 bg-primary rounded-full ml-1" />}
              </Button>
            </div>
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="px-3 py-2 bg-muted/30 border-t">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <Select value={filters.location || "all"} onValueChange={handleLocationChange}>
                      <SelectTrigger className="w-40 h-7 text-xs">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any location</SelectItem>
                        {locationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <Select value={filters.timeRange || "all"} onValueChange={handleTimeRangeChange}>
                      <SelectTrigger className="w-36 h-7 text-xs">
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any time</SelectItem>
                        {timeRangeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 px-2 text-xs"
                      data-testid="button-clear-filters"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.location && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="h-2 w-2 mr-1" />
                        {locationOptions.find(l => l.value === filters.location)?.label}
                      </Badge>
                    )}
                    {filters.timeRange && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-2 w-2 mr-1" />
                        {filters.timeRange === "custom" && filters.dateFrom && filters.dateTo
                          ? `${format(filters.dateFrom, "MMM d")} - ${format(filters.dateTo, "MMM d")}`
                          : timeRangeOptions.find(t => t.value === filters.timeRange)?.label
                        }
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
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
                <h3 className="text-lg font-medium">Enhanced Global Search</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Search with geographic and temporal intelligence filtering
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
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    Geographic
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Temporal
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
        
        {/* Custom Date Range Popover */}
        {filters.timeRange === "custom" && (
          <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
            <PopoverTrigger asChild>
              <div />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4">
                <h4 className="font-medium mb-3">Select Date Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">From Date</label>
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To Date</label>
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCustomDateSelect(filters.dateFrom, filters.dateTo)}
                      disabled={!filters.dateFrom || !filters.dateTo}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomDateOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </DialogContent>
    </Dialog>
  )
}