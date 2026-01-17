import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Clock, X, Zap, Building2, AlertTriangle, History, Sparkles, ArrowRight, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ParsedQuery {
  location?: { name: string; lat: number; lng: number };
  timeRange?: { label: string; value: string; from?: Date; to?: Date };
  events?: string[];
  infrastructure?: string[];
  raw: string;
}

interface UnifiedSearchBarProps {
  onQueryParsed: (query: ParsedQuery) => void;
  currentLocation?: string;
  activeFilters?: ParsedQuery;
  onClearFilters?: () => void;
  className?: string;
}

interface IntelligenceResult {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  type: "report" | "event" | "threat" | "infrastructure";
  relevance: number;
  location?: string;
}

const LOCATIONS = [
  { name: "Dhaka", lat: 23.8103, lng: 90.4125, aliases: ["dhaka", "dha"], population: "21M" },
  { name: "Chittagong", lat: 22.3569, lng: 91.7832, aliases: ["chittagong", "ctg", "chattogram"], population: "5M" },
  { name: "Sylhet", lat: 24.8949, lng: 91.8687, aliases: ["sylhet", "syl"], population: "500K" },
  { name: "Khulna", lat: 22.8456, lng: 89.5403, aliases: ["khulna", "khu"], population: "1.5M" },
  { name: "Rajshahi", lat: 24.3745, lng: 88.6042, aliases: ["rajshahi", "raj"], population: "450K" },
  { name: "Cox's Bazar", lat: 21.4272, lng: 92.0058, aliases: ["cox's bazar", "coxs bazar", "cox"], population: "250K" },
  { name: "Kamalapur Station", lat: 23.7327, lng: 90.4264, aliases: ["kamalapur", "kamalapur station", "railway station"], population: "" },
  { name: "Hazrat Shahjalal Airport", lat: 23.8513, lng: 90.4089, aliases: ["airport", "shahjalal", "dhaka airport"], population: "" },
];

const SMART_SUGGESTIONS = [
  { query: "Dhaka protests last 7 days", icon: AlertTriangle, category: "Trending" },
  { query: "infrastructure status Chittagong", icon: Building2, category: "Common" },
  { query: "healthcare access gaps", icon: TrendingUp, category: "Analysis" },
  { query: "transport disruptions today", icon: Zap, category: "Live" },
  { query: "power grid vulnerabilities", icon: Building2, category: "Infrastructure" },
  { query: "political unrest since December", icon: AlertTriangle, category: "Events" },
];

const MOCK_INTELLIGENCE: IntelligenceResult[] = [
  {
    id: "intel-1",
    title: "Elevated protest activity in Shahbag",
    summary: "University students organizing peaceful demonstrations. Low escalation risk assessed.",
    source: "Field Report",
    timestamp: "2h ago",
    type: "event",
    relevance: 0.95,
    location: "Dhaka"
  },
  {
    id: "intel-2", 
    title: "Power grid maintenance scheduled",
    summary: "DPDC announces scheduled maintenance affecting Gulshan and Banani sectors.",
    source: "Official Notice",
    timestamp: "4h ago",
    type: "infrastructure",
    relevance: 0.88,
    location: "Dhaka"
  },
  {
    id: "intel-3",
    title: "Transport disruption at Kamalapur",
    summary: "Train delays reported due to track maintenance. Alternative routes recommended.",
    source: "Local Report",
    timestamp: "6h ago",
    type: "infrastructure",
    relevance: 0.82,
    location: "Dhaka"
  },
  {
    id: "intel-4",
    title: "Healthcare facility capacity update",
    summary: "Dhaka Medical College operating at 78% capacity. No critical shortages reported.",
    source: "Health Ministry",
    timestamp: "1d ago",
    type: "report",
    relevance: 0.75,
    location: "Dhaka"
  },
  {
    id: "intel-5",
    title: "Political rally announced for Chittagong",
    summary: "Opposition party scheduled rally for next week. Enhanced monitoring recommended.",
    source: "Open Source",
    timestamp: "1d ago",
    type: "event",
    relevance: 0.71,
    location: "Chittagong"
  },
  {
    id: "intel-6",
    title: "Port operations normal at Chittagong",
    summary: "All berths operational. Cargo throughput at seasonal average levels.",
    source: "Port Authority",
    timestamp: "3h ago",
    type: "infrastructure",
    relevance: 0.68,
    location: "Chittagong"
  },
];

const TIME_PATTERNS = [
  { pattern: /(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})/i, 
    handler: (m: RegExpMatchArray) => ({ label: `${m[1]} to ${m[2]}`, value: `range:${m[1]}:${m[2]}` }) },
  { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i,
    handler: (m: RegExpMatchArray) => ({ label: `${m[1]} ${m[2]}`, value: `date:${m[1].toLowerCase()}-${m[2]}` }) },
  { pattern: /mid[- ]?(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    handler: (m: RegExpMatchArray) => ({ label: `Mid-${m[1]}`, value: `mid:${m[1].toLowerCase()}` }) },
  { pattern: /last\s*(\d+)\s*days?/i, handler: (m: RegExpMatchArray) => ({ label: `Last ${m[1]} days`, value: `${m[1]}d` }) },
  { pattern: /past\s*(\d+)\s*days?/i, handler: (m: RegExpMatchArray) => ({ label: `Past ${m[1]} days`, value: `${m[1]}d` }) },
  { pattern: /last\s*(\d+)\s*hours?/i, handler: (m: RegExpMatchArray) => ({ label: `Last ${m[1]} hours`, value: `${m[1]}h` }) },
  { pattern: /last\s*week/i, handler: () => ({ label: "Last week", value: "7d" }) },
  { pattern: /past\s*week/i, handler: () => ({ label: "Past week", value: "7d" }) },
  { pattern: /last\s*month/i, handler: () => ({ label: "Last month", value: "30d" }) },
  { pattern: /past\s*month/i, handler: () => ({ label: "Past month", value: "30d" }) },
  { pattern: /since\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i, 
    handler: (m: RegExpMatchArray) => ({ label: `Since ${m[1]}`, value: `since-${m[1].toLowerCase()}` }) },
  { pattern: /today/i, handler: () => ({ label: "Today", value: "24h" }) },
];

const EVENT_KEYWORDS = [
  { keywords: ["protest", "protests", "demonstration", "rally"], category: "protests" },
  { keywords: ["unrest", "political unrest", "civil unrest"], category: "unrest" },
  { keywords: ["strike", "strikes", "shutdown", "hartal"], category: "strikes" },
  { keywords: ["flood", "flooding", "floods"], category: "flooding" },
  { keywords: ["outage", "blackout", "power outage"], category: "outage" },
  { keywords: ["disruption", "transport disruption"], category: "disruption" },
];

const INFRASTRUCTURE_KEYWORDS = [
  { keywords: ["hospital", "hospitals", "healthcare", "medical"], category: "hospitals" },
  { keywords: ["power", "electricity", "power grid"], category: "power" },
  { keywords: ["rail", "railway", "train"], category: "rail" },
  { keywords: ["bridge", "bridges"], category: "bridges" },
  { keywords: ["water", "water treatment"], category: "water" },
  { keywords: ["airport", "airports"], category: "airports" },
  { keywords: ["port", "ports"], category: "ports" },
];

function parseQuery(query: string): ParsedQuery {
  const result: ParsedQuery = { raw: query };
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return result;
  
  const coordMatch = query.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93) {
      result.location = { name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`, lat, lng };
    }
  }
  
  if (!result.location) {
    for (const loc of LOCATIONS) {
      for (const alias of loc.aliases) {
        if (lowerQuery.includes(alias)) {
          result.location = { name: loc.name, lat: loc.lat, lng: loc.lng };
          break;
        }
      }
      if (result.location) break;
    }
  }
  
  for (const { pattern, handler } of TIME_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      result.timeRange = handler(match);
      break;
    }
  }
  
  const foundEvents: string[] = [];
  for (const { keywords, category } of EVENT_KEYWORDS) {
    for (const kw of keywords) {
      if (lowerQuery.includes(kw) && !foundEvents.includes(category)) {
        foundEvents.push(category);
        break;
      }
    }
  }
  if (foundEvents.length > 0) result.events = foundEvents;
  
  const foundInfra: string[] = [];
  for (const { keywords, category } of INFRASTRUCTURE_KEYWORDS) {
    for (const kw of keywords) {
      if (lowerQuery.includes(kw) && !foundInfra.includes(category)) {
        foundInfra.push(category);
        break;
      }
    }
  }
  if (foundInfra.length > 0) result.infrastructure = foundInfra;
  
  return result;
}

function searchIntelligence(query: string): IntelligenceResult[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return MOCK_INTELLIGENCE
    .filter(item => 
      item.title.toLowerCase().includes(lower) ||
      item.summary.toLowerCase().includes(lower) ||
      item.location?.toLowerCase().includes(lower) ||
      item.source.toLowerCase().includes(lower)
    )
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

const SEARCH_HISTORY_KEY = "guideright_search_history";

function getSearchHistory(): string[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addToSearchHistory(query: string) {
  try {
    const history = getSearchHistory().filter(q => q !== query);
    history.unshift(query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
  } catch {}
}

const typeIcons = {
  report: FileText,
  event: AlertTriangle,
  threat: Zap,
  infrastructure: Building2
};

export function UnifiedSearchBar({ 
  onQueryParsed, 
  currentLocation, 
  activeFilters,
  onClearFilters,
  className 
}: UnifiedSearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [preview, setPreview] = useState<ParsedQuery | null>(null);
  const [searchResults, setSearchResults] = useState<IntelligenceResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = activeFilters && (
    activeFilters.location || activeFilters.timeRange || 
    activeFilters.events?.length || activeFilters.infrastructure?.length
  );

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchValue.length >= 2) {
      setPreview(parseQuery(searchValue));
      setSearchResults(searchIntelligence(searchValue));
    } else {
      setPreview(null);
      setSearchResults([]);
    }
  }, [searchValue]);

  const executeSearch = useCallback((query: string) => {
    if (query.trim()) {
      const parsed = parseQuery(query);
      onQueryParsed(parsed);
      addToSearchHistory(query);
      setSearchHistory(getSearchHistory());
      setSearchValue("");
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  }, [onQueryParsed]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    executeSearch(searchValue);
  }, [searchValue, executeSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchValue(query);
    executeSearch(query);
  };

  const handleLocationClick = (loc: typeof LOCATIONS[0]) => {
    onQueryParsed({ 
      location: { name: loc.name, lat: loc.lat, lng: loc.lng },
      raw: loc.name 
    });
    addToSearchHistory(loc.name);
    setSearchHistory(getSearchHistory());
    setSearchValue("");
    setIsExpanded(false);
  };

  const filteredLocations = LOCATIONS.filter(loc =>
    searchValue.length > 0 && 
    (loc.name.toLowerCase().includes(searchValue.toLowerCase()) ||
     loc.aliases.some(a => a.includes(searchValue.toLowerCase())))
  ).slice(0, 4);

  const hasPreviewContent = preview && (preview.location || preview.timeRange || preview.events?.length || preview.infrastructure?.length);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Card className="w-full overflow-visible" data-testid="unified-search-bar">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
            <Search className="h-4 w-4" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder={currentLocation ? `${currentLocation} — search intel, locations, events...` : "Search intel, locations, events..."}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
            data-testid="input-unified-search"
          />

          {searchValue && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setSearchValue("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button type="submit" size="sm" className="h-8 px-3 flex-shrink-0" disabled={!searchValue.trim()}>
            <Search className="h-3.5 w-3.5 mr-1.5" />
            Search
          </Button>
        </form>

        {hasActiveFilters && (
          <div className="px-3 pb-2 flex items-center gap-2 flex-wrap border-t pt-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            {activeFilters?.location && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                {activeFilters.location.name}
              </Badge>
            )}
            {activeFilters?.timeRange && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {activeFilters.timeRange.label}
              </Badge>
            )}
            {activeFilters?.events?.map(event => (
              <Badge key={event} variant="outline" className="gap-1 text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {event}
              </Badge>
            ))}
            {activeFilters?.infrastructure?.map(infra => (
              <Badge key={infra} variant="outline" className="gap-1 text-xs">
                <Building2 className="h-3 w-3" />
                {infra}
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground ml-auto" onClick={onClearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </Card>

      {isExpanded && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden shadow-lg border">
          <ScrollArea className="max-h-[420px]">
            {/* Query Interpretation Preview */}
            {hasPreviewContent && (
              <div className="p-3 bg-primary/5 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">Query Interpretation</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {preview?.location && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      {preview.location.name}
                    </Badge>
                  )}
                  {preview?.timeRange && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {preview.timeRange.label}
                    </Badge>
                  )}
                  {preview?.events?.map(event => (
                    <Badge key={event} variant="outline" className="gap-1 text-xs border-amber-500/50">
                      <Zap className="h-3 w-3" />
                      {event}
                    </Badge>
                  ))}
                  {preview?.infrastructure?.map(infra => (
                    <Badge key={infra} variant="outline" className="gap-1 text-xs">
                      <Building2 className="h-3 w-3" />
                      {infra}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Intelligence Results */}
            {searchResults.length > 0 && (
              <div className="border-b">
                <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Intelligence Matches</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{searchResults.length}</Badge>
                </div>
                <div className="pb-1">
                  {searchResults.map((item) => {
                    const Icon = typeIcons[item.type];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.title)}
                        className="w-full text-left px-3 py-2 hover-elevate flex items-start gap-3"
                      >
                        <div className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 mt-0.5",
                          item.type === "event" ? "bg-amber-500/10 text-amber-600" :
                          item.type === "threat" ? "bg-red-500/10 text-red-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.summary}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{item.source}</span>
                            <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                            {item.location && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">{item.location}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="text-[10px] text-muted-foreground">{Math.round(item.relevance * 100)}%</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Results */}
            {filteredLocations.length > 0 && (
              <div className="border-b">
                <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Locations</span>
                </div>
                <div className="pb-1">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => handleLocationClick(loc)}
                      className="w-full text-left px-3 py-2 hover-elevate flex items-center gap-3"
                      data-testid={`location-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary flex-shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{loc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                          {loc.population && ` · Pop: ${loc.population}`}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions - shown when no search value */}
            {searchValue.length < 2 && (
              <>
                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <div className="border-b">
                    <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                      <History className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent</span>
                    </div>
                    <div className="pb-1">
                      {searchHistory.map((query, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(query)}
                          className="w-full text-left px-3 py-2 hover-elevate flex items-center gap-3"
                        >
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart Suggestions */}
                <div>
                  <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggested Queries</span>
                  </div>
                  <div className="pb-2">
                    {SMART_SUGGESTIONS.map((suggestion, idx) => {
                      const Icon = suggestion.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          className="w-full text-left px-3 py-2 hover-elevate flex items-center gap-3"
                        >
                          <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0",
                            suggestion.category === "Trending" ? "bg-amber-500/10 text-amber-600" :
                            suggestion.category === "Live" ? "bg-green-500/10 text-green-600" :
                            "bg-muted text-muted-foreground"
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm flex-1">{suggestion.query}</span>
                          <Badge variant="outline" className="text-[10px]">{suggestion.category}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
