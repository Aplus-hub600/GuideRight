import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Link2,
  Clock,
} from "lucide-react";

interface Confidence {
  level: "Low" | "Med" | "High";
  score: number;
  basis: string[];
}

interface Claim {
  id: string;
  text: string;
  tag: "SUPPORTED" | "ASSUMPTION" | "UNKNOWN";
  confidence: Confidence;
  evidence?: Array<{ artifact_id: string; reliability: string }>;
}

interface Citation {
  id: string;
  artifact_id: string;
  text: string;
  reliability: string;
}

interface ModeResult {
  schema_version: string;
  mode: string;
  title: string;
  time_window?: { from: string; to: string };
  confidence?: Confidence;
  claims: Claim[];
  citations: Citation[];
  audit: { tools_used: string[]; policy_flags: string[] };
  [key: string]: unknown;
}

interface GIAResultRendererProps {
  result: ModeResult;
}

export function GIAResultRenderer({ result }: GIAResultRendererProps) {
  switch (result.mode) {
    case "PMESII":
      return <PMESIIRenderer result={result} />;
    case "RISK_BRIEF":
      return <RiskBriefRenderer result={result} />;
    case "SITREP":
      return <SITREPRenderer result={result} />;
    case "GRAPH_QUERY":
      return <GraphQueryRenderer result={result} />;
    case "ARTIFACT_SUMMARY":
      return <ArtifactSummaryRenderer result={result} />;
    case "MISSION_SUPPORT":
      return <MissionSupportRenderer result={result} />;
    case "DEGRADED":
      return <DegradedRenderer result={result} />;
    default:
      return <GenericRenderer result={result} />;
  }
}

function ConfidenceBadge({ confidence }: { confidence?: Confidence }) {
  if (!confidence) return null;

  const config = {
    High: { variant: "default" as const, icon: CheckCircle2 },
    Med: { variant: "secondary" as const, icon: HelpCircle },
    Low: { variant: "destructive" as const, icon: AlertTriangle },
  };

  const current = config[confidence.level];
  const Icon = current.icon;

  return (
    <Badge variant={current.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {confidence.level} ({Math.round(confidence.score * 100)}%)
    </Badge>
  );
}

function ClaimTag({ tag }: { tag: "SUPPORTED" | "ASSUMPTION" | "UNKNOWN" }) {
  const variantMap = {
    SUPPORTED: "default" as const,
    ASSUMPTION: "secondary" as const,
    UNKNOWN: "outline" as const,
  };

  return (
    <Badge variant={variantMap[tag]} className="text-xs">
      {tag}
    </Badge>
  );
}

function TimeWindowDisplay({ timeWindow }: { timeWindow?: { from: string; to: string } }) {
  if (!timeWindow) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {new Date(timeWindow.from).toLocaleDateString()} - {new Date(timeWindow.to).toLocaleDateString()}
    </div>
  );
}

function PMESIIRenderer({ result }: { result: ModeResult }) {
  const pmesii = result.pmesii as Record<string, { summary: string; claims?: string[] }>;
  if (!pmesii) return <GenericRenderer result={result} />;

  const dimensions = ["Political", "Military", "Economic", "Social", "Information", "Infrastructure"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <TimeWindowDisplay timeWindow={result.time_window} />
          </div>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={dimensions} className="w-full">
          {dimensions.map((dim) => {
            const data = pmesii[dim];
            if (!data) return null;

            return (
              <AccordionItem key={dim} value={dim}>
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <PMESIIDimensionIcon dimension={dim} />
                    {dim}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {data.summary}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {result.claims.length > 0 && (
          <>
            <Separator />
            <ClaimsList claims={result.claims} />
          </>
        )}

        <AuditTrail audit={result.audit} />
      </CardContent>
    </Card>
  );
}

function PMESIIDimensionIcon({ dimension }: { dimension: string }) {
  const index = ["Political", "Military", "Economic", "Social", "Information", "Infrastructure"].indexOf(dimension);
  const opacities = ["opacity-100", "opacity-85", "opacity-70", "opacity-55", "opacity-40", "opacity-25"];
  
  return <div className={`w-2 h-2 rounded-full bg-primary ${opacities[index] || "opacity-50"}`} />;
}

function RiskBriefRenderer({ result }: { result: ModeResult }) {
  const risks = result.risks as Array<{
    title: string;
    severity: string;
    score: number;
    drivers: string[];
    mitigations: string[];
    trend?: string;
  }>;

  if (!risks) return <GenericRenderer result={result} />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <TimeWindowDisplay timeWindow={result.time_window} />
          </div>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((risk, idx) => (
          <Card key={idx} className="border-l-4" style={{ borderLeftColor: getSeverityColor(risk.severity) }}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h4 className="font-medium">{risk.title}</h4>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={risk.severity} />
                  <TrendIndicator trend={risk.trend} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-medium">{risk.score}%</span>
                </div>
                <Progress value={risk.score} className="h-2" />
              </div>

              {risk.drivers.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Drivers</span>
                  <div className="flex flex-wrap gap-1">
                    {risk.drivers.map((driver, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {driver}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <AuditTrail audit={result.audit} />
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variantMap: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    CRITICAL: "destructive",
    HIGH: "destructive",
    MEDIUM: "secondary",
    LOW: "default",
  };

  return (
    <Badge variant={variantMap[severity] || "outline"}>
      {severity}
    </Badge>
  );
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: "hsl(var(--destructive))",
    HIGH: "hsl(var(--destructive))",
    MEDIUM: "hsl(var(--secondary))",
    LOW: "hsl(var(--primary))",
  };
  return colors[severity] || "hsl(var(--muted))";
}

function TrendIndicator({ trend }: { trend?: string }) {
  if (!trend || trend === "Unknown") return null;

  const config: Record<string, { icon: typeof TrendingUp; className: string }> = {
    Improving: { icon: TrendingDown, className: "text-primary" },
    Worsening: { icon: TrendingUp, className: "text-destructive" },
    Stable: { icon: Minus, className: "text-muted-foreground" },
  };

  const current = config[trend];
  if (!current) return null;

  const Icon = current.icon;
  return <Icon className={`h-4 w-4 ${current.className}`} />;
}

function SITREPRenderer({ result }: { result: ModeResult }) {
  const sections = result.sections as Array<{ heading: string; bullets: string[] }>;
  if (!sections) return <GenericRenderer result={result} />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <TimeWindowDisplay timeWindow={result.time_window} />
          </div>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {section.heading}
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground pl-6">
              {section.bullets.map((bullet, i) => (
                <li key={i} className="list-disc">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <AuditTrail audit={result.audit} />
      </CardContent>
    </Card>
  );
}

function GraphQueryRenderer({ result }: { result: ModeResult }) {
  const answer = result.answer as {
    summary: string;
    nodes?: Array<{ id: string; label: string }>;
    edges?: Array<{ id: string }>;
    paths?: Array<{ from: string; to: string; explanation: string }>;
  };

  if (!answer) return <GenericRenderer result={result} />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <CardDescription>{result.question as string}</CardDescription>
          </div>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{answer.summary}</p>

        {answer.nodes && answer.nodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Related Nodes ({answer.nodes.length})</h4>
            <div className="flex flex-wrap gap-1">
              {answer.nodes.slice(0, 10).map((node) => (
                <Badge key={node.id} variant="secondary" className="text-xs">
                  {node.label}
                </Badge>
              ))}
              {answer.nodes.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{answer.nodes.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <AuditTrail audit={result.audit} />
      </CardContent>
    </Card>
  );
}

function ArtifactSummaryRenderer({ result }: { result: ModeResult }) {
  const artifacts = result.artifacts as Array<{
    id: string;
    filename: string;
    summary: string;
    reliability: string;
  }>;

  if (!artifacts) return <GenericRenderer result={result} />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">{result.title}</CardTitle>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {artifacts.map((artifact) => (
          <Card key={artifact.id} className="bg-muted/30">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{artifact.filename}</span>
                <Badge variant="outline" className="text-xs">
                  Reliability: {artifact.reliability}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{artifact.summary}</p>
            </CardContent>
          </Card>
        ))}

        <AuditTrail audit={result.audit} />
      </CardContent>
    </Card>
  );
}

function MissionSupportRenderer({ result }: { result: ModeResult }) {
  const analysis = result.analysis as string;
  const recommendations = result.recommendations as string[];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <TimeWindowDisplay timeWindow={result.time_window} />
          </div>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis && (
          <p className="text-sm whitespace-pre-wrap">{analysis}</p>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recommendations</h4>
            <ul className="space-y-1 text-sm text-muted-foreground pl-4">
              {recommendations.map((rec, i) => (
                <li key={i} className="list-disc">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <AuditTrail audit={result.audit} />
      </CardContent>
    </Card>
  );
}

function DegradedRenderer({ result }: { result: ModeResult }) {
  const reason = result.degraded_reason as string;

  return (
    <Card className="border-yellow-500/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">Degraded Mode</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          AI analysis is temporarily unavailable ({reason}). Showing cached and deterministic data only.
        </p>
      </CardContent>
    </Card>
  );
}

function GenericRenderer({ result }: { result: ModeResult }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">{result.title}</CardTitle>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
          {JSON.stringify(result, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

function ClaimsList({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Link2 className="h-4 w-4" />
        Claims ({claims.length})
      </h4>
      <div className="space-y-2">
        {claims.map((claim) => (
          <div key={claim.id} className="p-2 bg-muted/30 rounded text-sm space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1">{claim.text}</p>
              <ClaimTag tag={claim.tag} />
            </div>
            {claim.evidence && claim.evidence.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {claim.evidence.length} evidence source(s)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTrail({ audit }: { audit: { tools_used: string[]; policy_flags: string[] } }) {
  if (audit.tools_used.length === 0 && audit.policy_flags.length === 0) return null;

  return (
    <div className="pt-2 border-t">
      <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
        {audit.tools_used.map((tool, i) => (
          <Badge key={i} variant="outline" className="text-xs font-mono">
            {tool}
          </Badge>
        ))}
        {audit.policy_flags.map((flag, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {flag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
