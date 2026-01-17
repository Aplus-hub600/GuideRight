import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Clock, X, Zap, Building2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const LOCATIONS = [
  { name: "Dhaka", lat: 23.8103, lng: 90.4125, aliases: ["dhaka", "dha"] },
  { name: "Chittagong", lat: 22.3569, lng: 91.7832, aliases: ["chittagong", "ctg", "chattogram"] },
  { name: "Sylhet", lat: 24.8949, lng: 91.8687, aliases: ["sylhet", "syl"] },
  { name: "Khulna", lat: 22.8456, lng: 89.5403, aliases: ["khulna", "khu"] },
  { name: "Rajshahi", lat: 24.3745, lng: 88.6042, aliases: ["rajshahi", "raj"] },
  { name: "Cox's Bazar", lat: 21.4272, lng: 92.0058, aliases: ["cox's bazar", "coxs bazar", "cox"] },
  { name: "Dhaka Airport", lat: 23.8513, lng: 90.4089, aliases: ["dhaka airport", "airport"] },
  { name: "Kamalapur Station", lat: 23.7327, lng: 90.4264, aliases: ["kamalapur", "kamalapur station", "railway"] },
];

const TIME_PATTERNS = [
  // Absolute date ranges: "2024-12-01 to 2025-01-10"
  { pattern: /(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})/i, 
    handler: (m: RegExpMatchArray) => ({ label: `${m[1]} to ${m[2]}`, value: `range:${m[1]}:${m[2]}` }) },
  // Single date anchor: "December 12", "Jan 15"
  { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i,
    handler: (m: RegExpMatchArray) => ({ label: `${m[1]} ${m[2]}`, value: `date:${m[1].toLowerCase()}-${m[2]}` }) },
  // Mid-month: "mid-December", "mid December"
  { pattern: /mid[- ]?(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    handler: (m: RegExpMatchArray) => ({ label: `Mid-${m[1]}`, value: `mid:${m[1].toLowerCase()}` }) },
  // Relative patterns
  { pattern: /last\s*(\d+)\s*days?/i, handler: (m: RegExpMatchArray) => ({ label: `Last ${m[1]} days`, value: `${m[1]}d` }) },
  { pattern: /past\s*(\d+)\s*days?/i, handler: (m: RegExpMatchArray) => ({ label: `Past ${m[1]} days`, value: `${m[1]}d` }) },
  { pattern: /last\s*(\d+)\s*hours?/i, handler: (m: RegExpMatchArray) => ({ label: `Last ${m[1]} hours`, value: `${m[1]}h` }) },
  { pattern: /last\s*week/i, handler: () => ({ label: "Last week", value: "7d" }) },
  { pattern: /past\s*week/i, handler: () => ({ label: "Past week", value: "7d" }) },
  { pattern: /last\s*month/i, handler: () => ({ label: "Last month", value: "30d" }) },
  { pattern: /past\s*month/i, handler: () => ({ label: "Past month", value: "30d" }) },
  { pattern: /last\s*30\s*days/i, handler: () => ({ label: "Last 30 days", value: "30d" }) },
  { pattern: /last\s*7\s*days/i, handler: () => ({ label: "Last 7 days", value: "7d" }) },
  { pattern: /last\s*24\s*hours/i, handler: () => ({ label: "Last 24 hours", value: "24h" }) },
  { pattern: /since\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i, 
    handler: (m: RegExpMatchArray) => ({ label: `Since ${m[1]}`, value: `since-${m[1].toLowerCase()}` }) },
  { pattern: /today/i, handler: () => ({ label: "Today", value: "24h" }) },
  { pattern: /this\s*week/i, handler: () => ({ label: "This week", value: "7d" }) },
];

const EVENT_KEYWORDS = [
  { keywords: ["protest", "protests", "demonstration", "rally"], category: "protests" },
  { keywords: ["unrest", "political unrest", "civil unrest", "instability"], category: "unrest" },
  { keywords: ["strike", "strikes", "shutdown", "hartal"], category: "strikes" },
  { keywords: ["flood", "flooding", "floods"], category: "flooding" },
  { keywords: ["outage", "blackout", "power outage"], category: "outage" },
  { keywords: ["disruption", "transport disruption", "traffic"], category: "disruption" },
  { keywords: ["violence", "conflict", "clash"], category: "violence" },
  { keywords: ["healthcare", "medical", "hospital access"], category: "healthcare" },
];

const INFRASTRUCTURE_KEYWORDS = [
  { keywords: ["hospital", "hospitals", "healthcare", "medical"], category: "hospitals" },
  { keywords: ["power", "electricity", "power grid", "electrical"], category: "power" },
  { keywords: ["rail", "railway", "train", "rail hub"], category: "rail" },
  { keywords: ["bridge", "bridges"], category: "bridges" },
  { keywords: ["water", "water treatment", "water supply"], category: "water" },
  { keywords: ["airport", "airports", "aviation"], category: "airports" },
  { keywords: ["port", "ports", "seaport"], category: "ports" },
  { keywords: ["road", "roads", "highway"], category: "roads" },
];

function parseQuery(query: string): ParsedQuery {
  const result: ParsedQuery = { raw: query };
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return result;
  
  // Parse coordinates (lat, lng format): "23.81, 90.41" or "23.81 90.41"
  const coordMatch = query.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    // Basic validation for Bangladesh region
    if (lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93) {
      result.location = { name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`, lat, lng };
    }
  }
  
  // Parse named location (only if no coordinates found)
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
  
  // Parse time
  for (const { pattern, handler } of TIME_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      result.timeRange = handler(match);
      break;
    }
  }
  
  // Parse events
  const foundEvents: string[] = [];
  for (const { keywords, category } of EVENT_KEYWORDS) {
    for (const kw of keywords) {
      if (lowerQuery.includes(kw)) {
        if (!foundEvents.includes(category)) {
          foundEvents.push(category);
        }
        break;
      }
    }
  }
  if (foundEvents.length > 0) {
    result.events = foundEvents;
  }
  
  // Parse infrastructure
  const foundInfra: string[] = [];
  for (const { keywords, category } of INFRASTRUCTURE_KEYWORDS) {
    for (const kw of keywords) {
      if (lowerQuery.includes(kw)) {
        if (!foundInfra.includes(category)) {
          foundInfra.push(category);
        }
        break;
      }
    }
  }
  if (foundInfra.length > 0) {
    result.infrastructure = foundInfra;
  }
  
  return result;
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = activeFilters && (
    activeFilters.location || 
    activeFilters.timeRange || 
    activeFilters.events?.length || 
    activeFilters.infrastructure?.length
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live preview as user types
  useEffect(() => {
    if (searchValue.length >= 2) {
      setPreview(parseQuery(searchValue));
    } else {
      setPreview(null);
    }
  }, [searchValue]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchValue.trim()) {
      const parsed = parseQuery(searchValue);
      onQueryParsed(parsed);
      setSearchValue("");
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  }, [searchValue, onQueryParsed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleLocationClick = (loc: typeof LOCATIONS[0]) => {
    onQueryParsed({ 
      location: { name: loc.name, lat: loc.lat, lng: loc.lng },
      raw: loc.name 
    });
    setSearchValue("");
    setIsExpanded(false);
  };

  const filteredLocations = LOCATIONS.filter(loc =>
    searchValue.length > 0 && 
    (loc.name.toLowerCase().includes(searchValue.toLowerCase()) ||
     loc.aliases.some(a => a.includes(searchValue.toLowerCase())))
  );

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Main Search Bar */}
      <Card className="w-full overflow-hidden" data-testid="unified-search-bar">
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
            placeholder={currentLocation ? `${currentLocation} - search location, time, events...` : "Search location, time, events..."}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
            data-testid="input-unified-search"
          />

          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setSearchValue("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            type="submit" 
            size="sm" 
            className="h-8 px-3 flex-shrink-0"
            disabled={!searchValue.trim()}
          >
            Search
          </Button>
        </form>

        {/* Active Filters - Always visible when filters are active */}
        {hasActiveFilters && (
          <div className="px-3 pb-2 flex items-center gap-2 flex-wrap">
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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Dropdown - Query preview and suggestions */}
      {isExpanded && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden max-h-[400px]">
          {/* Query Intent Preview */}
          {preview && (searchValue.length >= 2) && (
            <div className="p-3 border-b bg-muted/30">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Query Interpretation
              </div>
              <div className="flex flex-wrap gap-2">
                {preview.location && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    Location: {preview.location.name}
                  </Badge>
                )}
                {preview.timeRange && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Time: {preview.timeRange.label}
                  </Badge>
                )}
                {preview.events?.map(event => (
                  <Badge key={event} variant="outline" className="gap-1 border-amber-500/50">
                    <Zap className="h-3 w-3" />
                    Event: {event}
                  </Badge>
                ))}
                {preview.infrastructure?.map(infra => (
                  <Badge key={infra} variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    Focus: {infra}
                  </Badge>
                ))}
                {!preview.location && !preview.timeRange && !preview.events?.length && !preview.infrastructure?.length && (
                  <span className="text-xs text-muted-foreground">
                    No recognized patterns. Try: "Dhaka last 7 days protests"
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Location Suggestions */}
          {filteredLocations.length > 0 && (
            <div className="border-b">
              <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Locations
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleLocationClick(loc)}
                    className="w-full text-left p-3 hover-elevate flex items-center gap-3"
                    data-testid={`location-${loc.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Examples */}
          {searchValue.length < 2 && (
            <div className="p-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Example Queries
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">location</Badge>
                  <span>Dhaka, Chittagong, Sylhet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">time</Badge>
                  <span>last 7 days, past month, since January</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">events</Badge>
                  <span>protests, strikes, flooding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">infra</Badge>
                  <span>hospitals, power grid, rail</span>
                </div>
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                  <strong>Try:</strong> "Dhaka last 30 days protests"
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
