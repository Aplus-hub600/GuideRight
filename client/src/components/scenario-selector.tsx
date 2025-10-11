import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiRequest, queryClient } from "@/lib/queryClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ODINCountry {
  name: string
  region: string
}

interface ScenarioSelectorProps {
  onScenarioChange?: (country: string) => void
  selectedCountry?: string
}

export function ScenarioSelector({ onScenarioChange, selectedCountry }: ScenarioSelectorProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const { data: countries, isLoading } = useQuery<{ success: boolean; countries: ODINCountry[] }>({
    queryKey: ['/api/odin/countries'],
    enabled: open
  })

  const selectScenarioMutation = useMutation({
    mutationFn: async (country: string) => {
      const response = await apiRequest('GET', `/api/odin/country/${encodeURIComponent(country)}`)
      return response.json()
    },
    onSuccess: (data, country) => {
      toast({
        title: "Scenario loaded",
        description: `Now analyzing ${country} using ODIN intelligence data`,
      })
      onScenarioChange?.(country)
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['/api/pmesii'] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to load scenario",
        description: error.message || "Could not retrieve ODIN data",
        variant: "destructive"
      })
    }
  })

  const groupedCountries = countries?.countries?.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = []
    }
    acc[country.region].push(country)
    return acc
  }, {} as Record<string, ODINCountry[]>) || {}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={selectedCountry ? "default" : "outline"}
          className="w-full gap-2"
          data-testid="button-scenario-selector"
        >
          <Globe className="h-4 w-4" />
          {selectedCountry || "Select Scenario"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            ODIN Training Scenarios
          </DialogTitle>
          <DialogDescription>
            Select a country from ODIN (OE Data Integration Network) to load realistic military training scenarios with PMESII intelligence data
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {Object.entries(groupedCountries).map(([region, regionCountries]) => (
              <div key={region} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {region}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {regionCountries.map((country) => (
                    <Card
                      key={country.name}
                      className={`p-3 cursor-pointer transition-all hover-elevate ${
                        selectedCountry === country.name
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : ""
                      }`}
                      onClick={() => selectScenarioMutation.mutate(country.name)}
                      data-testid={`scenario-${country.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {country.name}
                        </span>
                        {selectedCountry === country.name && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      {selectScenarioMutation.isPending && selectScenarioMutation.variables === country.name && (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500 mt-2" />
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <Badge variant="outline" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Data from odin.tradoc.army.mil
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}
