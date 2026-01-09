import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  X, 
  Search, 
  AlertTriangle, 
  Target, 
  FileText, 
  Flag, 
  Users, 
  Link2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GraphNode } from "@shared/schema";

export interface GraphFilterState {
  q: string;
  type_in: string[];
  layer_in: string[];
  status_in: string[];
  severity_in: string[];
  sensitivity_in: string[];
  time_from: string;
  time_to: string;
  due_from: string;
  due_to: string;
  owner: string;
  team: string;
  has_location: boolean | undefined;
}

const DEFAULT_FILTERS: GraphFilterState = {
  q: "",
  type_in: [],
  layer_in: [],
  status_in: [],
  severity_in: [],
  sensitivity_in: [],
  time_from: "",
  time_to: "",
  due_from: "",
  due_to: "",
  owner: "",
  team: "",
  has_location: undefined,
};

const NODE_TYPES = [
  { value: "artifact", label: "Artifacts", icon: FileText },
  { value: "milestone", label: "Milestones", icon: Flag },
  { value: "risk", label: "Risks", icon: AlertTriangle },
  { value: "dependency", label: "Dependencies", icon: Link2 },
  { value: "decision", label: "Decisions", icon: Target },
  { value: "partner", label: "Partners", icon: Users },
];

const LAYERS = [
  { value: "evidence", label: "Evidence" },
  { value: "execution", label: "Execution" },
  { value: "dependencies", label: "Dependencies" },
  { value: "risk", label: "Risk" },
  { value: "people_orgs", label: "People & Orgs" },
  { value: "legal_ip", label: "Legal/IP" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

const SEVERITIES = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" },
];

const SENSITIVITIES = [
  { value: "unclassified", label: "UNCLASSIFIED" },
  { value: "cui", label: "CUI" },
  { value: "secret", label: "SECRET" },
  { value: "top_secret", label: "TOP SECRET" },
];

interface GraphFilterPanelProps {
  filters: GraphFilterState;
  onFiltersChange: (filters: GraphFilterState) => void;
  onApply?: () => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left font-medium text-sm text-muted-foreground hover-elevate p-1 rounded"
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {title}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string; icon?: any; color?: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1.5 pl-6">
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <Checkbox
            id={`filter-${option.value}`}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
          />
          <label
            htmlFor={`filter-${option.value}`}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            {option.icon && <option.icon className="h-3.5 w-3.5 text-muted-foreground" />}
            {option.color && (
              <span className={`w-2 h-2 rounded-full ${option.color}`} />
            )}
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}

export function GraphFilterPanel({
  filters,
  onFiltersChange,
  onApply,
}: GraphFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.type_in.length > 0) count++;
    if (filters.layer_in.length > 0) count++;
    if (filters.status_in.length > 0) count++;
    if (filters.severity_in.length > 0) count++;
    if (filters.sensitivity_in.length > 0) count++;
    if (filters.time_from || filters.time_to) count++;
    if (filters.due_from || filters.due_to) count++;
    if (filters.owner) count++;
    if (filters.team) count++;
    if (filters.has_location !== undefined) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    onFiltersChange({ ...DEFAULT_FILTERS });
  };

  const handleApply = () => {
    onApply?.();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[380px] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Intelligence Filters
            </SheetTitle>
            <SheetDescription>
              Filter graph nodes by type, layer, status, and more.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] mt-4 pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-filter">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-filter"
                    placeholder="Search labels and descriptions..."
                    value={filters.q}
                    onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <Separator />

              <FilterSection title="Node Types">
                <CheckboxGroup
                  options={NODE_TYPES}
                  selected={filters.type_in}
                  onChange={(values) => onFiltersChange({ ...filters, type_in: values })}
                />
              </FilterSection>

              <Separator />

              <FilterSection title="Intelligence Layers">
                <CheckboxGroup
                  options={LAYERS}
                  selected={filters.layer_in}
                  onChange={(values) => onFiltersChange({ ...filters, layer_in: values })}
                />
              </FilterSection>

              <Separator />

              <FilterSection title="Status" defaultOpen={false}>
                <CheckboxGroup
                  options={STATUSES}
                  selected={filters.status_in}
                  onChange={(values) => onFiltersChange({ ...filters, status_in: values })}
                />
              </FilterSection>

              <Separator />

              <FilterSection title="Severity" defaultOpen={false}>
                <CheckboxGroup
                  options={SEVERITIES}
                  selected={filters.severity_in}
                  onChange={(values) => onFiltersChange({ ...filters, severity_in: values })}
                />
              </FilterSection>

              <Separator />

              <FilterSection title="Sensitivity" defaultOpen={false}>
                <div className="space-y-1.5 pl-6">
                  {SENSITIVITIES.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`sensitivity-${option.value}`}
                        checked={filters.sensitivity_in.includes(option.value)}
                        onCheckedChange={() => {
                          const current = filters.sensitivity_in;
                          const newValues = current.includes(option.value)
                            ? current.filter((v) => v !== option.value)
                            : [...current, option.value];
                          onFiltersChange({ ...filters, sensitivity_in: newValues });
                        }}
                      />
                      <label
                        htmlFor={`sensitivity-${option.value}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </FilterSection>

              <Separator />

              <FilterSection title="Time Range" defaultOpen={false}>
                <div className="space-y-3 pl-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Created From</Label>
                    <Input
                      type="date"
                      value={filters.time_from}
                      onChange={(e) => onFiltersChange({ ...filters, time_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Created To</Label>
                    <Input
                      type="date"
                      value={filters.time_to}
                      onChange={(e) => onFiltersChange({ ...filters, time_to: e.target.value })}
                    />
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Due Dates" defaultOpen={false}>
                <div className="space-y-3 pl-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Due From</Label>
                    <Input
                      type="date"
                      value={filters.due_from}
                      onChange={(e) => onFiltersChange({ ...filters, due_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Due To</Label>
                    <Input
                      type="date"
                      value={filters.due_to}
                      onChange={(e) => onFiltersChange({ ...filters, due_to: e.target.value })}
                    />
                  </div>
                </div>
              </FilterSection>

              <Separator />

              <FilterSection title="Ownership" defaultOpen={false}>
                <div className="space-y-3 pl-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Owner</Label>
                    <Input
                      placeholder="e.g., ODA-1234"
                      value={filters.owner}
                      onChange={(e) => onFiltersChange({ ...filters, owner: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Team</Label>
                    <Input
                      placeholder="e.g., SOCOM-J2"
                      value={filters.team}
                      onChange={(e) => onFiltersChange({ ...filters, team: e.target.value })}
                    />
                  </div>
                </div>
              </FilterSection>

              <Separator />

              <FilterSection title="Location" defaultOpen={false}>
                <div className="space-y-1.5 pl-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="has-location"
                      checked={filters.has_location === true}
                      onCheckedChange={(checked) =>
                        onFiltersChange({
                          ...filters,
                          has_location: checked ? true : undefined,
                        })
                      }
                    />
                    <label htmlFor="has-location" className="flex items-center gap-2 text-sm cursor-pointer">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Has geolocation
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="no-location"
                      checked={filters.has_location === false}
                      onCheckedChange={(checked) =>
                        onFiltersChange({
                          ...filters,
                          has_location: checked ? false : undefined,
                        })
                      }
                    />
                    <label htmlFor="no-location" className="text-sm cursor-pointer">
                      No geolocation
                    </label>
                  </div>
                </div>
              </FilterSection>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ActiveFilterChips filters={filters} onFiltersChange={onFiltersChange} />
    </div>
  );
}

function ActiveFilterChips({
  filters,
  onFiltersChange,
}: {
  filters: GraphFilterState;
  onFiltersChange: (filters: GraphFilterState) => void;
}) {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.q) {
    chips.push({
      label: `Search: "${filters.q}"`,
      onRemove: () => onFiltersChange({ ...filters, q: "" }),
    });
  }

  if (filters.type_in.length > 0) {
    chips.push({
      label: `Types: ${filters.type_in.join(", ")}`,
      onRemove: () => onFiltersChange({ ...filters, type_in: [] }),
    });
  }

  if (filters.layer_in.length > 0) {
    chips.push({
      label: `Layers: ${filters.layer_in.join(", ")}`,
      onRemove: () => onFiltersChange({ ...filters, layer_in: [] }),
    });
  }

  if (filters.status_in.length > 0) {
    chips.push({
      label: `Status: ${filters.status_in.join(", ")}`,
      onRemove: () => onFiltersChange({ ...filters, status_in: [] }),
    });
  }

  if (filters.severity_in.length > 0) {
    chips.push({
      label: `Severity: ${filters.severity_in.join(", ")}`,
      onRemove: () => onFiltersChange({ ...filters, severity_in: [] }),
    });
  }

  if (filters.sensitivity_in.length > 0) {
    chips.push({
      label: `Classification: ${filters.sensitivity_in.join(", ")}`,
      onRemove: () => onFiltersChange({ ...filters, sensitivity_in: [] }),
    });
  }

  if (filters.time_from || filters.time_to) {
    const range = [filters.time_from, filters.time_to].filter(Boolean).join(" to ");
    chips.push({
      label: `Created: ${range}`,
      onRemove: () => onFiltersChange({ ...filters, time_from: "", time_to: "" }),
    });
  }

  if (filters.due_from || filters.due_to) {
    const range = [filters.due_from, filters.due_to].filter(Boolean).join(" to ");
    chips.push({
      label: `Due: ${range}`,
      onRemove: () => onFiltersChange({ ...filters, due_from: "", due_to: "" }),
    });
  }

  if (filters.owner) {
    chips.push({
      label: `Owner: ${filters.owner}`,
      onRemove: () => onFiltersChange({ ...filters, owner: "" }),
    });
  }

  if (filters.team) {
    chips.push({
      label: `Team: ${filters.team}`,
      onRemove: () => onFiltersChange({ ...filters, team: "" }),
    });
  }

  if (filters.has_location !== undefined) {
    chips.push({
      label: filters.has_location ? "Has location" : "No location",
      onRemove: () => onFiltersChange({ ...filters, has_location: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map((chip, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="gap-1 pl-2 pr-1 py-0.5 text-xs"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

export function useGraphFilters() {
  const [filters, setFilters] = useState<GraphFilterState>(DEFAULT_FILTERS);

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.type_in.length) params.set("type_in", filters.type_in.join(","));
    if (filters.layer_in.length) params.set("layer_in", filters.layer_in.join(","));
    if (filters.status_in.length) params.set("status_in", filters.status_in.join(","));
    if (filters.severity_in.length) params.set("severity_in", filters.severity_in.join(","));
    if (filters.sensitivity_in.length) params.set("sensitivity_in", filters.sensitivity_in.join(","));
    if (filters.time_from) params.set("time_from", filters.time_from);
    if (filters.time_to) params.set("time_to", filters.time_to);
    if (filters.due_from) params.set("due_from", filters.due_from);
    if (filters.due_to) params.set("due_to", filters.due_to);
    if (filters.owner) params.set("owner", filters.owner);
    if (filters.team) params.set("team", filters.team);
    if (filters.has_location !== undefined) params.set("has_location", String(filters.has_location));

    return params.toString();
  };

  const queryString = buildQueryParams();

  const { data, isLoading, refetch } = useQuery<{ nodes: GraphNode[]; total: number }>({
    queryKey: ["/api/graph/nodes", queryString],
    queryFn: async () => {
      const url = queryString ? `/api/graph/nodes?${queryString}` : "/api/graph/nodes";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch graph nodes");
      return res.json();
    },
  });

  return {
    filters,
    setFilters,
    nodes: data?.nodes || [],
    total: data?.total || 0,
    isLoading,
    refetch,
  };
}
