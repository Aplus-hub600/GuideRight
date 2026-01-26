import { useState } from "react"
import { DifferentiatorVisual } from "@/components/differentiator-visual"
import { DifferentiatorVisualAlt } from "@/components/differentiator-visual-alt"
import { DifferentiatorFinal } from "@/components/differentiator-final"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ScoutCardPage() {
  const [view, setView] = useState<"final" | "compare">("final")

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Scout Card Visual</h1>
            <p className="text-muted-foreground">
              Export your preferred diagram for Vulcan Scout Cards and presentations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={view === "final" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("final")}
              className="gap-2"
            >
              Final Version
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </Button>
            <Button 
              variant={view === "compare" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("compare")}
            >
              Compare All
            </Button>
          </div>
        </div>

        {view === "final" ? (
          <div className="bg-card rounded-lg border shadow-sm overflow-auto">
            <DifferentiatorFinal />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                Final Version
                <Badge variant="secondary">Recommended</Badge>
              </h2>
              <div className="bg-card rounded-lg border shadow-sm overflow-auto">
                <DifferentiatorFinal />
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-foreground mb-3">Version A: Dark Theme</h2>
                <div className="bg-card rounded-lg border shadow-sm overflow-auto">
                  <DifferentiatorVisual />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground mb-3">Version B: Light Theme</h2>
                <div className="bg-card rounded-lg border shadow-sm overflow-auto">
                  <DifferentiatorVisualAlt />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
