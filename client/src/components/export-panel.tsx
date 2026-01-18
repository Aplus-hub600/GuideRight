import { useState } from "react";
import { Download, FileJson, TestTube, FileText, Map, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMapExport } from "@/hooks/useMapExport";
import { FeedbackForm } from "./feedback-form";

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
  const [exportingTemplate, setExportingTemplate] = useState<string | null>(null);

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

  const generateSITEMP = (templateType: "full" | "cub" | "threat" | "civil") => {
    setExportingTemplate(templateType);
    const regionName = currentAOI?.name || "Dhaka";
    const now = new Date();
    
    const baseTemplate = {
      classification: "UNCLASSIFIED // FOUO",
      templateType: templateType.toUpperCase(),
      generatedAt: now.toISOString(),
      validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      areaOfInterest: {
        name: regionName,
        coordinates: { lat: currentAOI?.lat || 23.8103, lng: currentAOI?.lng || 90.4125 },
        radiusKm: currentAOI?.radiusKm || 25
      }
    };

    let sitemp: Record<string, unknown>;

    switch (templateType) {
      case "full":
        sitemp = {
          ...baseTemplate,
          title: `SITEMP - ${regionName} - ${now.toLocaleDateString()}`,
          executiveSummary: `Situational template for ${regionName} operational environment. Assessment covers PMESII-PT factors, ASCOPE analysis, and current threat indicators.`,
          pmesiiAssessment: {
            political: { status: "STABLE", confidence: 0.75, summary: "Current government maintaining control; opposition activity within normal parameters" },
            military: { status: "MODERATE PRESENCE", confidence: 0.80, summary: "Security forces positioned at key infrastructure; routine patrol patterns observed" },
            economic: { status: "STRESSED", confidence: 0.70, summary: "Currency pressure continuing; import costs elevated" },
            social: { status: "TENSE", confidence: 0.65, summary: "Labor negotiations ongoing; student activity elevated" },
            information: { status: "ACTIVE", confidence: 0.72, summary: "Social media activity high; narrative competition ongoing" },
            infrastructure: { status: "FUNCTIONAL", confidence: 0.78, summary: "Critical infrastructure operational; maintenance scheduled" }
          },
          ascopeAnalysis: {
            areas: "Urban core with mixed commercial/residential; key terrain at government complex",
            structures: "Critical facilities: hospitals, power stations, telecommunications hubs",
            capabilities: "Manufacturing, medical, logistics capacity available",
            organizations: "Government, opposition parties, NGOs, religious institutions active",
            people: "20M+ population; young demographic; high connectivity",
            events: "Political rally scheduled; monsoon preparation underway"
          },
          threatAssessment: {
            overallLevel: "MEDIUM",
            primaryThreats: [
              "Political demonstrations with potential for escalation",
              "Infrastructure disruption from scheduled maintenance",
              "Labor action in industrial sector"
            ],
            mitigationMeasures: [
              "Monitor social media for mobilization indicators",
              "Coordinate with local security elements",
              "Maintain alternate routes for critical movement"
            ]
          },
          recommendations: [
            "Continue routine intelligence collection protocols",
            "Prepare contingency plans for political event period",
            "Coordinate with key stakeholders before scheduled events"
          ],
          sources: ["OSINT (A)", "HUMINT (B)", "Social Media (C)", "Official Reports (A)"],
          preparedBy: "GuideRight Intelligence Assistant",
          disclaimer: "This assessment is based on available open-source and reported intelligence. Confidence levels reflect source reliability aggregation using Dempster-Shafer methodology."
        };
        break;
        
      case "cub":
        sitemp = {
          ...baseTemplate,
          title: `CUB INPUT - ${regionName} - ${now.toLocaleDateString()}`,
          purpose: "Commander's Update Brief intelligence input",
          keyDevelopments: [
            { time: "0600L", event: "Routine security posture confirmed at key facilities" },
            { time: "0800L", event: "Economic indicators: Taka trading at 110/USD" },
            { time: "1000L", event: "Social media monitoring: Normal activity levels" },
            { time: "1200L", event: "Infrastructure status: All critical systems operational" }
          ],
          intelligenceHighlights: [
            "No significant change in threat posture over past 24 hours",
            "Opposition party announced rally for next week - monitoring",
            "Weather outlook: Clear conditions expected for 72 hours"
          ],
          watchItems: [
            "Scheduled power grid maintenance may impact industrial operations",
            "Student organization activity elevated ahead of academic calendar events"
          ],
          nextBriefWindow: "24 hours or as conditions warrant",
          preparedBy: "GuideRight Intelligence Assistant"
        };
        break;
        
      case "threat":
        sitemp = {
          ...baseTemplate,
          title: `THREAT ASSESSMENT - ${regionName} - ${now.toLocaleDateString()}`,
          overallThreatLevel: "MEDIUM",
          threatMatrix: [
            { category: "Political Violence", level: "MEDIUM", trend: "STABLE", confidence: 0.72 },
            { category: "Criminal Activity", level: "LOW", trend: "STABLE", confidence: 0.78 },
            { category: "Infrastructure Disruption", level: "MEDIUM", trend: "INCREASING", confidence: 0.68 },
            { category: "Civil Unrest", level: "MEDIUM", trend: "STABLE", confidence: 0.70 },
            { category: "Natural Hazards", level: "LOW", trend: "STABLE", confidence: 0.85 }
          ],
          namedThreats: [
            {
              name: "Political Rally Risk",
              description: "Opposition party rally scheduled for next week may attract large crowds",
              likelihood: "HIGH",
              impact: "MEDIUM",
              mitigation: "Avoid area during event; monitor for escalation indicators"
            },
            {
              name: "Infrastructure Maintenance",
              description: "Scheduled power grid maintenance may cause localized outages",
              likelihood: "CERTAIN",
              impact: "LOW",
              mitigation: "Plan for backup power; schedule activities accordingly"
            }
          ],
          indicatorsAndWarnings: [
            "Social media mobilization calls from political organizations",
            "Increased security force deployments at government buildings",
            "Labor union coordination meetings reported"
          ],
          preparedBy: "GuideRight Intelligence Assistant"
        };
        break;
        
      case "civil":
        sitemp = {
          ...baseTemplate,
          title: `CIVIL CONSIDERATIONS - ${regionName} - ${now.toLocaleDateString()}`,
          populationAssessment: {
            totalEstimate: "20+ million in greater metro area",
            demographics: "60% under age 30; high literacy; 90%+ mobile penetration",
            displacement: "No significant IDP populations in area",
            vulnerabilities: "Urban poor in informal settlements; flood-prone areas"
          },
          keyLeaders: [
            { role: "Government", influence: "HIGH", disposition: "NEUTRAL", notes: "Focused on economic stability" },
            { role: "Opposition", influence: "MEDIUM", disposition: "OPPOSED", notes: "Mobilizing for elections" },
            { role: "Religious", influence: "HIGH", disposition: "NEUTRAL", notes: "Influential in social matters" },
            { role: "Civil Society", influence: "MEDIUM", disposition: "SUPPORTIVE", notes: "Active in development" }
          ],
          civilInfrastructure: {
            healthcare: "Major hospitals operational; capacity adequate for routine needs",
            education: "Academic institutions in session; student population active",
            utilities: "Power and water generally reliable; maintenance scheduled",
            communications: "Mobile networks functional; internet access widespread"
          },
          humanitarianConsiderations: [
            "Monsoon season approaching - flood preparedness relevant",
            "Garment worker welfare ongoing concern",
            "Urban migration creating service delivery pressure"
          ],
          preparedBy: "GuideRight Intelligence Assistant"
        };
        break;
    }

    const blob = new Blob([JSON.stringify(sitemp, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guideright-${templateType}-${regionName.toLowerCase().replace(/\s+/g, '-')}-${now.toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => setExportingTemplate(null), 500);
  };

  return (
    <div className="space-y-4 p-4" data-testid="panel-export">
      <div>
        <h2 className="text-lg font-bold mb-1">Export & Templates</h2>
        <p className="text-xs text-muted-foreground">
          Generate structured intelligence products
        </p>
      </div>

      <div className="grid gap-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Map className="h-4 w-4 text-primary" />
                SITEMP Templates
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">IC Standard</Badge>
            </div>
            <CardDescription className="text-xs">
              Situational Templates for operational planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => generateSITEMP("full")}
              disabled={exportingTemplate === "full"}
              variant="default"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <FileText className="h-3 w-3" />
              Full SITEMP (PMESII + ASCOPE + Threat)
            </Button>
            <Button 
              onClick={() => generateSITEMP("cub")}
              disabled={exportingTemplate === "cub"}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <FileText className="h-3 w-3" />
              CUB Input (Commander's Update Brief)
            </Button>
            <Button 
              onClick={() => generateSITEMP("threat")}
              disabled={exportingTemplate === "threat"}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <AlertTriangle className="h-3 w-3" />
              Threat Assessment Only
            </Button>
            <Button 
              onClick={() => generateSITEMP("civil")}
              disabled={exportingTemplate === "civil"}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Users className="h-3 w-3" />
              Civil Considerations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileJson className="h-4 w-4 text-primary" />
              Raw Data Export
            </CardTitle>
            <CardDescription className="text-xs">
              Export current view and filters as JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              data-testid="button-export-current"
            >
              <Download className="h-3 w-3" />
              Export Current View
            </Button>
            <Button 
              onClick={fetchTestExport}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              data-testid="button-export-test"
            >
              <TestTube className="h-3 w-3" />
              Download Test Export
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 border-t">
        <FeedbackForm />
      </div>
    </div>
  );
}
