/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ConsolidatedReport } from "@/openapi-client";
import { consolidatedReportRepository } from "@/services/consolidated_reports/consolidatedReportRepository";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Download,
  Info,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/utils/utils";

interface ChartData {
  dimension_name: string;
  dominant_risk_name: string;
  dominant_risk_value: number;
  dominant_risk_color: string;
}

// Risk level color constants
const RISK_COLORS: Record<"high" | "medium" | "low", string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm text-muted-foreground text-center">
          {data.dominant_risk_name}:{" "}
          <span className="font-medium text-foreground">
            {data.dominant_risk_value.toFixed(2)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// Skeleton loader for metrics cards
const MetricCardSkeleton = () => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardHeader className="pb-3">
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
    </CardContent>
  </Card>
);

// Metric card component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  variant?: "default" | "risk" | "gap";
}

const MetricCard = ({
  title,
  value,
  icon,
  description,
  variant = "default",
}: MetricCardProps) => {
  const getValueColor = () => {
    if (variant === "risk" && typeof value === "number") {
      if (value >= 2.5) return "text-destructive";
      if (value >= 1.5) return "text-yellow-600";
      return "text-green-600";
    }
    if (variant === "gap" && typeof value === "number") {
      if (value >= 2.5) return "text-destructive";
      if (value >= 1.5) return "text-yellow-600";
      return "text-green-600";
    }
    return "text-foreground";
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-5 w-5 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", getValueColor())}>{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const InfoPopover = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:bg-muted-foreground/20"
      >
        <Info className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="space-y-2">
        <h4 className="font-semibold leading-none">{title}</h4>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </PopoverContent>
  </Popover>
);

export function ConsolidatedReportPage() {
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
      }).then(
        (canvas: HTMLCanvasElement) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("consolidated-report.pdf");
        },
      );
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data =
        await consolidatedReportRepository.getDgrvAdminConsolidatedReport();
      setReport(data);
    } catch (err) {
      setError("Failed to fetch consolidated report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const highestRiskDimension = useMemo(() => {
    if (
      !report?.dimension_summaries ||
      report.dimension_summaries.length === 0
    ) {
      return null;
    }
    return report.dimension_summaries.reduce((max, summary) =>
      summary.average_risk_level > max.average_risk_level ? summary : max,
    );
  }, [report]);

  const chartData = useMemo(() => {
    if (!report?.dimension_summaries) return [];

    return report.dimension_summaries.map((summary) => {
      const {
        high_risk_percentage,
        medium_risk_percentage,
        low_risk_percentage,
      } = summary.risk_level_distribution;

      let dominantRisk = {
        name: "Low Risk",
        value: low_risk_percentage,
        color: RISK_COLORS.low,
      };

      if (medium_risk_percentage >= dominantRisk.value) {
        dominantRisk = {
          name: "Medium Risk",
          value: medium_risk_percentage,
          color: RISK_COLORS.medium,
        };
      }

      if (high_risk_percentage >= dominantRisk.value) {
        dominantRisk = {
          name: "High Risk",
          value: high_risk_percentage,
          color: RISK_COLORS.high,
        };
      }

      return {
        dimension_name: summary.dimension_name,
        dominant_risk_name: dominantRisk.name,
        dominant_risk_value: dominantRisk.value,
        dominant_risk_color: dominantRisk.color,
      };
    });
  }, [report]);

  const getRiskBadgeVariant = (riskLevel: number) => {
    if (riskLevel >= 2.5) return "destructive";
    if (riskLevel >= 1.5) return "warning";
    return "success";
  };

  const getRiskPercentageBadge = (
    percentage: number,
    type: "high" | "medium" | "low",
  ) => {
    const variant =
      type === "high"
        ? "destructive"
        : type === "medium"
          ? "warning"
          : "success";
    return (
      <Badge variant={variant} className="font-mono tabular-nums min-w-[70px] justify-center">
        {percentage.toFixed(2)}%
      </Badge>
    );
  };

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl p-6 space-y-8">
        <div className="space-y-2">
          <div className="h-9 w-80 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                Error Loading Report
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchReport} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!report) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Report Data Available
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              There is no consolidated report data to display at this time.
            </p>
            <Button onClick={fetchReport} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8 overflow-y-auto h-full">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Consolidated Report
          </h1>
          <p className="text-muted-foreground">
            Comprehensive overview of digital gap analysis across all
            organizations
          </p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div ref={reportRef} className="p-4">
        {/* High-Level Summary Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Submissions"
            value={report.total_submissions}
            icon={<FileText className="h-5 w-5" />}
          />
        </div>

        {/* Dimension-Specific Analysis Table */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Dimension Analysis</CardTitle>
              <InfoPopover title="About Dimension Analysis">
                <p>
                  This table provides a detailed breakdown of risk distribution
                  for each dimension across all submissions. It helps in
                  identifying which areas of your organization are most exposed
                  to digital risks.
                </p>
                <ul className="mt-2 list-disc pl-4 space-y-1">
                  <li>
                    <strong>High Risk %:</strong> The percentage of submissions
                    where the dimension was assessed as high risk. High-risk
                    areas require immediate attention.
                  </li>
                  <li>
                    <strong>Medium Risk %:</strong> The percentage of
                    submissions where the dimension was assessed as medium risk.
                    These areas should be monitored.
                  </li>
                  <li>
                    <strong>Low Risk %:</strong> The percentage of submissions
                    where the dimension was assessed as low risk. These are
                    areas of strength.
                  </li>
                </ul>
              </InfoPopover>
            </div>
            <CardDescription>
              Detailed breakdown of risk levels and gap scores by dimension
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Dimension</TableHead>
                    <TableHead className="font-semibold">High Risk %</TableHead>
                    <TableHead className="font-semibold">
                      Medium Risk %
                    </TableHead>
                    <TableHead className="font-semibold">Low Risk %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.dimension_summaries.map((summary, index) => (
                    <TableRow
                      key={summary.dimension_name}
                      className={cn(
                        index % 2 === 0 && "bg-muted/50",
                        "transition-colors hover:bg-muted",
                      )}
                    >
                      <TableCell className="font-medium">
                        {summary.dimension_name}
                      </TableCell>
                      <TableCell>
                        {getRiskPercentageBadge(
                          summary.risk_level_distribution.high_risk_percentage,
                          "high",
                        )}
                      </TableCell>
                      <TableCell>
                        {getRiskPercentageBadge(
                          summary.risk_level_distribution
                            .medium_risk_percentage,
                          "medium",
                        )}
                      </TableCell>
                      <TableCell>
                        {getRiskPercentageBadge(
                          summary.risk_level_distribution.low_risk_percentage,
                          "low",
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Focus Section */}
        {highestRiskDimension && (() => {
          const level = highestRiskDimension.average_risk_level;
          const isLow = level < 1.5;
          const isMedium = level >= 1.5 && level <= 2.5;
          const isHigh = level > 2.5;

          const accent = isHigh
            ? "border-l-destructive"
            : isMedium
              ? "border-l-amber-500"
              : "border-l-emerald-500";

          const Icon = isHigh ? AlertTriangle : isMedium ? TrendingUp : CheckCircle2;
          const iconColor = isHigh
            ? "text-destructive"
            : isMedium
              ? "text-amber-500"
              : "text-emerald-500";

          const title = isHigh
            ? "Highest Risk Dimension & Recommendations"
            : isMedium
              ? "Dimension Needing Attention & Recommendations"
              : "Dimension with Most Room to Improve";

          const subtitle = isHigh
            ? "Priority focus area requiring immediate attention"
            : isMedium
              ? "This dimension has a moderate gap — worth monitoring and improving"
              : "All dimensions are performing well. This one has the most potential for further growth";

          const popoverBody = isHigh
            ? "This dimension has the highest average risk score across all submissions. It represents the most critical area requiring immediate action."
            : isMedium
              ? "This dimension has a moderate average risk score. It is not critical but should be monitored and improved over time."
              : "All dimensions are at low risk. This dimension has the highest score among them, meaning it has the most room for further improvement — not that it is at risk.";

          const badgeClass = isHigh
            ? "bg-destructive text-destructive-foreground"
            : isMedium
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-emerald-100 text-emerald-800 border border-emerald-300";

          const bulletColor = isHigh
            ? "bg-destructive"
            : isMedium
              ? "bg-amber-500"
              : "bg-emerald-500";

          const recTitle = isHigh
            ? "Top High-Priority Recommendations"
            : isMedium
              ? "Recommendations to Improve This Dimension"
              : "Suggestions to Further Strengthen This Dimension";

          return (
            <Card className={`border-l-4 ${accent} transition-all duration-200 hover:shadow-md`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                  <CardTitle>{title}</CardTitle>
                  <InfoPopover title="About This Section">
                    <p>{popoverBody}</p>
                    <p className="mt-2">
                      The recommendations below are tailored to this dimension
                      and can be incorporated into your action plan.
                    </p>
                  </InfoPopover>
                </div>
                <CardDescription>{subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {highestRiskDimension.dimension_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Average Risk Score:
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                        {isLow ? "Low" : isMedium ? "Medium" : "High"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-base">{recTitle}</h4>
                    <ul className="space-y-2">
                      {highestRiskDimension.top_recommendations.map(
                        (rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${bulletColor} shrink-0`} />
                            <span className="text-sm leading-relaxed">{rec}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Data Visualization */}
        <div className="grid gap-6 lg:grid-cols-1">
          {/* Dominant Risk by Dimension Bar Chart */}
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Dominant Risk level by Dimension</CardTitle>
                <InfoPopover title="About Dominant Risk">
                  <p>
                    This bar chart visualizes the most dominant risk level
                    (High, Medium, or Low) for each dimension. The dominant risk
                    is the risk level with the highest percentage of submissions
                    for that dimension.
                  </p>
                  <p className="mt-2">
                    This provides a quick overview of the general risk profile
                    of each dimension, helping you to easily spot which
                    dimensions are consistently ranked as high-risk.
                  </p>
                </InfoPopover>
              </div>
              <CardDescription>
                Percentage of dominant risk level per dimension
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="dimension_name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="dominant_risk_value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.dominant_risk_color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ConsolidatedReportPage;
