import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Filter, X, Clock, Target, FileImage, Brain, Shield, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  { value: "dhaka", label: "Dhaka, Bangladesh" },
  { value: "chittagong", label: "Chittagong, Bangladesh" },
  { value: "sylhet", label: "Sylhet, Bangladesh" },
  { value: "khulna", label: "Khulna, Bangladesh" },
  { value: "rajshahi", label: "Rajshahi, Bangladesh" },
  { value: "bangladesh", label: "All Bangladesh" },
];

const timeRangeOptions = [
  { value: "1h", label: "Last Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 3 Months" },
  { value: "custom", label: "Custom Range" },
];

export function LocationSearchBar({ onLocationSelect, currentLocation }: LocationSearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Google Places Autocomplete for location search
  useEffect(() => {
    if (!inputRef.current || !(window as any).google || showAdvancedSearch) return;

    const google = (window as any).google;
    
    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      fields: ["name", "geometry", "formatted_address"],
    });

    // Listen for place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.name || place.formatted_address || "Unknown Location";
        
        onLocationSelect({ name, lat, lng });
        setSearchValue("");
        setIsExpanded(false);
        setShowAdvancedSearch(false);
        inputRef.current?.blur();
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationSelect, showAdvancedSearch]);

  // Advanced search query
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

  const handleBlur = () => {
    setTimeout(() => {
      if (!searchValue && !showAdvancedSearch) {
        setIsExpanded(false);
      }
    }, 200);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
    if (!showAdvancedSearch) {
      setSearchValue("");
      if (autocompleteRef.current) {
        const google = (window as any).google;
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
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
    setShowFilters(false);
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

  return (
    <div className="relative">
      <div 
        className={`
          bg-gradient-to-r from-slate-900/70 to-slate-800/70 backdrop-blur-md rounded-full shadow-2xl border border-slate-700/50
          transition-all duration-300 ease-in-out
          ${isExpanded || showAdvancedSearch ? 'w-96' : 'w-72'}
        `}
        data-testid="location-search-bar"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={showAdvancedSearch ? "Search intelligence data..." : (currentLocation || "Search location...")}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-slate-400"
            data-testid="input-location-search"
          />
          <button
            onClick={toggleAdvancedSearch}
            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
              showAdvancedSearch 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-slate-500 hover:text-blue-400 hover:bg-slate-700/50'
            }`}
            title={showAdvancedSearch ? "Basic location search" : "Advanced search with filters"}
            data-testid="button-toggle-advanced-search"
          >
            {showAdvancedSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {/* Advanced Search Filters */}
        {showAdvancedSearch && (
          <div className="border-t border-slate-700/50 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Advanced Filters</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-3 w-3 inline mr-1" />
                {hasActiveFilters && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block ml-1" />}
              </button>
            </div>

            {showFilters && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <Select value={filters.location || "all"} onValueChange={handleLocationChange}>
                    <SelectTrigger className="flex-1 h-8 text-xs bg-slate-800/50 border-slate-700/50">
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
                  <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <Select value={filters.timeRange || "all"} onValueChange={handleTimeRangeChange}>
                    <SelectTrigger className="flex-1 h-8 text-xs bg-slate-800/50 border-slate-700/50">
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
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {filters.location && (
                        <Badge variant="secondary" className="text-xs h-5">
                          {locationOptions.find(l => l.value === filters.location)?.label}
                        </Badge>
                      )}
                      {filters.timeRange && (
                        <Badge variant="secondary" className="text-xs h-5">
                          {filters.timeRange === "custom" && filters.dateFrom && filters.dateTo
                            ? `${format(filters.dateFrom, "MMM d")} - ${format(filters.dateTo, "MMM d")}`
                            : timeRangeOptions.find(t => t.value === filters.timeRange)?.label
                          }
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 px-2 text-xs text-slate-400"
                      data-testid="button-clear-filters"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showAdvancedSearch && debouncedSearch.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden max-h-96 z-50">
          {isLoading && (
            <div className="flex items-center justify-center p-6" data-testid="loading-search">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400 mr-2" />
              <span className="text-sm text-slate-300">Searching...</span>
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="text-center p-6" data-testid="empty-search-results">
              <Search className="h-10 w-10 mx-auto mb-3 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-200">No results found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters</p>
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(groupedResults).map(([type, results], index) => {
                const Icon = typeIcons[type as keyof typeof typeIcons] || Search;
                const label = typeLabels[type as keyof typeof typeLabels] || type.charAt(0).toUpperCase() + type.slice(1);
                
                return (
                  <div key={type}>
                    {index > 0 && <Separator className="bg-slate-700/50" />}
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 mb-2">
                        <Icon className="h-3 w-3" />
                        {label}
                      </div>
                      <div className="space-y-1">
                        {results.map((result: SearchResult) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelectResult(result)}
                            className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                            data-testid={`search-result-${result.type}-${result.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-100 truncate">{result.title}</h4>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{result.snippet}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(result.timestamp).toLocaleDateString()}
                                  </span>
                                  {result.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs flex-shrink-0 border-blue-500/30 text-blue-400">
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
        </div>
      )}

      {/* Custom Date Range Popover */}
      {filters.timeRange === "custom" && (
        <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-700" align="start">
            <div className="p-4">
              <h4 className="font-medium text-slate-100 mb-3">Select Date Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-300">From Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">To Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                    className="w-full"
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
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
