import { useState } from "react"
import { DifferentiatorVisual } from "@/components/differentiator-visual"
import { DifferentiatorVisualAlt } from "@/components/differentiator-visual-alt"
import { Button } from "@/components/ui/button"

export default function ScoutCardPage() {
  const [view, setView] = useState<"both" | "dark" | "light">("both")

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Scout Card Visual</h1>
            <p className="text-muted-foreground">
              Compare versions and export your preferred diagram for Vulcan Scout Cards.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={view === "both" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("both")}
            >
              Compare Both
            </Button>
            <Button 
              variant={view === "dark" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("dark")}
            >
              Dark Version
            </Button>
            <Button 
              variant={view === "light" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("light")}
            >
              Light Version
            </Button>
          </div>
        </div>

        {view === "both" ? (
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
        ) : view === "dark" ? (
          <div className="max-w-[1000px] mx-auto">
            <div className="bg-card rounded-lg border shadow-sm overflow-auto">
              <DifferentiatorVisual />
            </div>
          </div>
        ) : (
          <div className="max-w-[1000px] mx-auto">
            <div className="bg-card rounded-lg border shadow-sm overflow-auto">
              <DifferentiatorVisualAlt />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
