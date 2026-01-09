import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Filter, X, Clock, Target, FileImage, Brain, Shield, Calendar, Loader2, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { SearchResult } from "@shared/schema";

interface LocationSearchBarProps {
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
  currentLocation?: string;
}

interface SearchFilters {
  location?: string;
  timeRange?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const typeIcons = {
  waypoint: Target,
  geotagged: FileImage,
  pmesii: Brain,
  intelligence: Search,
  risk: Shield
};

const typeLabels = {
  waypoint: "Waypoints",
  geotagged: "Geotagged Files",
  pmesii: "PMESII Analysis", 
  intelligence: "Intelligence",
  risk: "Risk Assessments"
};

const locationOptions = [
  { value: "dhaka", label: "Dhaka" },
  { value: "chittagong", label: "Chittagong" },
  { value: "sylhet", label: "Sylhet" },
  { value: "khulna", label: "Khulna" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "bangladesh", label: "All Bangladesh" },
];

const timeRangeOptions = [
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "3 months" },
  { value: "custom", label: "Custom" },
];

export function LocationSearchBar({ onLocationSelect, currentLocation }: LocationSearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchValue, 300);

  const predefinedLocations = [
    { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
    { name: "Chittagong", lat: 22.3569, lng: 91.7832 },
    { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
    { name: "Khulna", lat: 22.8456, lng: 89.5403 },
    { name: "Rajshahi", lat: 24.3745, lng: 88.6042 },
    { name: "Dhaka Airport", lat: 23.8513, lng: 90.4089 },
    { name: "Gulshan", lat: 23.7925, lng: 90.4078 },
    { name: "Dhanmondi", lat: 23.7461, lng: 90.3742 },
    { name: "Motijheel", lat: 23.7330, lng: 90.4176 },
    { name: "Uttara", lat: 23.8759, lng: 90.3795 },
  ];

  const filteredLocations = predefinedLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleLocationClick = (loc: { name: string; lat: number; lng: number }) => {
    onLocationSelect(loc);
    setSearchValue("");
    setIsExpanded(false);
    setShowAdvancedSearch(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchResults, isLoading } = useQuery<{
    success: boolean;
    results: SearchResult[];
    grouped: Record<string, SearchResult[]>;
    total: number;
  }>({
    queryKey: ["/api/search", debouncedSearch, filters],
    enabled: showAdvancedSearch && debouncedSearch.length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedSearch,
        limit: "20"
      });
      
      if (filters.location) {
        params.append("location", filters.location);
      }
      
      if (filters.timeRange) {
        if (filters.timeRange === "custom" && filters.dateFrom && filters.dateTo) {
          params.append("dateFrom", filters.dateFrom.toISOString());
          params.append("dateTo", filters.dateTo.toISOString());
        } else {
          params.append("timeRange", filters.timeRange);
        }
      }
      
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
    if (!showAdvancedSearch) {
      setSearchValue("");
    }
  };

  const handleLocationChange = (location: string) => {
    setFilters(prev => ({ ...prev, location: location === "all" ? undefined : location }));
  };

  const handleTimeRangeChange = (timeRange: string) => {
    if (timeRange === "custom") {
      setCustomDateOpen(true);
      setFilters(prev => ({ ...prev, timeRange }));
    } else if (timeRange === "all") {
      setFilters(prev => ({ ...prev, timeRange: undefined, dateFrom: undefined, dateTo: undefined }));
    } else {
      setFilters(prev => ({ ...prev, timeRange, dateFrom: undefined, dateTo: undefined }));
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.location) {
      onLocationSelect({
        name: result.title,
        lat: result.location.lat,
        lng: result.location.lng
      });
    }
    setSearchValue("");
    setShowAdvancedSearch(false);
    setIsExpanded(false);
  };

  const hasActiveFilters = !!(filters.location || filters.timeRange);
  const groupedResults = searchResults?.grouped || {};
  const hasResults = Object.keys(groupedResults).length > 0;
  const totalResults = searchResults?.total || 0;

  return (
    <div className="relative" ref={containerRef}>
      <Card 
        className={`
          transition-all duration-200 ease-out overflow-hidden
          w-full max-w-[320px] sm:max-w-[480px]
          ${isExpanded || showAdvancedSearch ? 'sm:max-w-[480px]' : 'max-w-[320px]'}
        `}
        data-testid="location-search-bar"
      >
        <div className="flex items-center gap-3 p-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary flex-shrink-0">
            {showAdvancedSearch ? <Search className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={handleFocus}
            placeholder={showAdvancedSearch ? "Search intelligence data..." : (currentLocation || "Search location...")}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            data-testid="input-location-search"
          />

          <div className="flex items-center gap-1">
            <Button
              variant={showAdvancedSearch ? "default" : "ghost"}
              size="icon"
              onClick={toggleAdvancedSearch}
              title={showAdvancedSearch ? "Location search" : "Intelligence search"}
              data-testid="button-toggle-advanced-search"
            >
              {showAdvancedSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {showAdvancedSearch && (
          <div className="border-t px-3 py-2 bg-muted/30">
            <div className="flex items-center gap-2">
              <Select value={filters.location || "all"} onValueChange={handleLocationChange}>
                <SelectTrigger className="h-8 text-xs bg-background border-border w-[130px]">
                  <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Location" />
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

              <Select value={filters.timeRange || "all"} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="h-8 text-xs bg-background border-border w-[120px]">
                  <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Time" />
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

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  data-testid="button-clear-filters"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}

              <div className="flex-1" />

              {debouncedSearch.length >= 2 && !isLoading && (
                <Badge variant="secondary" className="text-xs font-mono">
                  {totalResults} results
                </Badge>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 mt-2">
                {filters.location && (
                  <Badge variant="outline" className="text-xs gap-1 pr-1">
                    <MapPin className="h-3 w-3" />
                    {locationOptions.find(l => l.value === filters.location)?.label}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, location: undefined }))}
                      className="ml-1 p-0.5 rounded hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.timeRange && filters.timeRange !== "custom" && (
                  <Badge variant="outline" className="text-xs gap-1 pr-1">
                    <Clock className="h-3 w-3" />
                    {timeRangeOptions.find(t => t.value === filters.timeRange)?.label}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, timeRange: undefined, dateFrom: undefined, dateTo: undefined }))}
                      className="ml-1 p-0.5 rounded hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.timeRange === "custom" && (
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1 pr-1 cursor-pointer"
                    onClick={() => setCustomDateOpen(true)}
                  >
                    <Calendar className="h-3 w-3" />
                    {filters.dateFrom && filters.dateTo
                      ? `${format(filters.dateFrom, "MMM d")} - ${format(filters.dateTo, "MMM d")}`
                      : "Set dates..."
                    }
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, timeRange: undefined, dateFrom: undefined, dateTo: undefined }));
                      }}
                      className="ml-1 p-0.5 rounded hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Location suggestions dropdown - shown when typing in location mode */}
      {isExpanded && !showAdvancedSearch && searchValue.length > 0 && filteredLocations.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            {filteredLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleLocationClick(loc)}
                className="w-full text-left p-3 hover-elevate flex items-center gap-3 transition-colors"
                data-testid={`location-suggestion-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{loc.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Show all locations when expanded but no search value */}
      {isExpanded && !showAdvancedSearch && searchValue.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden">
          <div className="p-2 border-b">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Locations</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {predefinedLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleLocationClick(loc)}
                className="w-full text-left p-3 hover-elevate flex items-center gap-3 transition-colors"
                data-testid={`location-quick-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{loc.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showAdvancedSearch && debouncedSearch.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-[400px] overflow-hidden z-50">
          {isLoading && (
            <div className="flex items-center justify-center p-8" data-testid="loading-search">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-3" />
              <span className="text-sm text-muted-foreground">Searching intelligence data...</span>
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="text-center p-8" data-testid="empty-search-results">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">No results found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                Try different search terms or adjust your filters
              </p>
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="max-h-[400px] overflow-y-auto">
              {Object.entries(groupedResults).map(([type, results], index) => {
                const Icon = typeIcons[type as keyof typeof typeIcons] || Search;
                const label = typeLabels[type as keyof typeof typeLabels] || type.charAt(0).toUpperCase() + type.slice(1);
                
                return (
                  <div key={type}>
                    {index > 0 && <Separator />}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {label}
                        </span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {results.length}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {results.map((result: SearchResult) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelectResult(result)}
                            className="w-full text-left p-3 rounded-md hover-elevate bg-muted/30 transition-colors"
                            data-testid={`search-result-${result.type}-${result.id}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {result.title}
                                </h4>
                                {result.snippet && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {result.snippet}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(result.timestamp).toLocaleDateString()}
                                  </span>
                                  {result.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate max-w-[100px]">
                                        {result.location.lat.toFixed(2)}, {result.location.lng.toFixed(2)}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge 
                                variant={result.score >= 0.8 ? "default" : result.score >= 0.5 ? "secondary" : "outline"}
                                className="text-xs flex-shrink-0 font-mono"
                              >
                                {Math.round(result.score * 100)}%
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
        <PopoverTrigger asChild>
          <span className="sr-only">Custom date range</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start" sideOffset={8}>
          <h4 className="font-medium text-sm mb-3">Select Date Range</h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <CalendarComponent
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                className="rounded-md border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <CalendarComponent
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                className="rounded-md border"
              />
            </div>
            <Button
              onClick={() => setCustomDateOpen(false)}
              className="w-full"
              size="sm"
              data-testid="button-apply-date-range"
            >
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
