import { Download, FileJson, TestTube, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMapExport } from "@/hooks/useMapExport";
import { FeedbackForm } from "./feedback-form";
import { LanguageSwitcher } from "./language-switcher";

interface ExportPanelProps {
  currentAOI?: {
    name?: string;
    lat: number;
    lng: number;
    radiusKm?: number;
  };
  activeTopPanel?: string | null;
  activeBottomPanel?: string | null;
}

export function ExportPanel({ currentAOI, activeTopPanel, activeBottomPanel }: ExportPanelProps) {
  const { exportMapData, fetchTestExport, isExporting } = useMapExport();

  const handleExport = () => {
    exportMapData({
      timestamp: new Date().toISOString(),
      aoi: currentAOI,
      activePanels: {
        top: activeTopPanel || null,
        bottom: activeBottomPanel || null,
      },
      metadata: {
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    });
  };

  return (
    <div className="space-y-6 p-6" data-testid="panel-export">
      <div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400 mb-2">Settings & Export</h2>
        <p className="text-base text-blue-200/90 font-medium">
          Configure app settings and export data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-100">
            <Languages className="h-6 w-6 text-blue-400" />
            Language
          </CardTitle>
          <CardDescription className="text-base text-gray-300 font-medium">
            Choose your preferred interface language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-100">
              <FileJson className="h-6 w-6 text-blue-400" />
              Current View Export
            </CardTitle>
            <CardDescription className="text-base text-gray-300 font-medium">
              Export current AOI, active panels, and filters as JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
              data-testid="button-export-current"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Current View
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-100">
              <TestTube className="h-6 w-6 text-blue-400" />
              Test Export
            </CardTitle>
            <CardDescription className="text-base text-gray-300 font-medium">
              Download a test export with sample data for QA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={fetchTestExport}
              variant="outline"
              className="w-full"
              data-testid="button-export-test"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Test Export
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6 border-t">
        <FeedbackForm />
      </div>
    </div>
  );
}
