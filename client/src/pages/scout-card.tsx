import { DifferentiatorVisual } from "@/components/differentiator-visual"

export default function ScoutCardPage() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Scout Card Visual</h1>
          <p className="text-muted-foreground">
            Export this diagram for use in Vulcan Scout Cards, demo slides, and documentation.
          </p>
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm overflow-auto">
          <DifferentiatorVisual />
        </div>
      </div>
    </div>
  )
}
