import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ConsolidatedReport } from "@/openapi-client";
import { getOrgAdminConsolidatedReport } from "@/services/consolidated_reports/consolidatedReportRepository";
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
  TrendingUp,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
} from "lucide-react";
import { cn } from "@/utils/utils";

interface ChartData {
  dimension_name: string;
  dominant_risk_name: string;
  dominant_risk_value: number;
  dominant_risk_color: string;
}

interface PieChartDataItem {
  name: string;
  value: number;
  fill: string;
  [key: string]: string | number;
}

// Risk level color constants
const RISK_COLORS: Record<"high" | "medium" | "low", string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartData }>;
}) => {
  if (active && payload && payload.length && payload[0]?.payload) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold">{data.dimension_name}</p>
        <p className="text-sm text-muted-foreground">
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

// Custom tooltip for pie chart
const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (active && payload && payload.length && payload[0]) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {data.value.toFixed(2)}%
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

export function ConsolidatedReportPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!organizationId) {
      setError("Organization ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getOrgAdminConsolidatedReport(organizationId);
      setReport(data);
    } catch (err) {
      setError("Failed to fetch consolidated report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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

  const pieChartData = useMemo(() => {
    if (!report?.dimension_summaries) return [];

    const data: PieChartDataItem[] = [];

    report.dimension_summaries.forEach((summary) => {
      const {
        high_risk_percentage,
        medium_risk_percentage,
        low_risk_percentage,
      } = summary.risk_level_distribution;

      if (high_risk_percentage > 0) {
        data.push({
          name: `${summary.dimension_name} - High Risk`,
          value: high_risk_percentage,
          fill: RISK_COLORS.high,
        });
      }
      if (medium_risk_percentage > 0) {
        data.push({
          name: `${summary.dimension_name} - Medium Risk`,
          value: medium_risk_percentage,
          fill: RISK_COLORS.medium,
        });
      }
      if (low_risk_percentage > 0) {
        data.push({
          name: `${summary.dimension_name} - Low Risk`,
          value: low_risk_percentage,
          fill: RISK_COLORS.low,
        });
      }
    });

    return data;
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
      <Badge variant={variant} className="font-mono">
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
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Consolidated Report
        </h1>
        <p className="text-muted-foreground">
          Comprehensive overview of digital gap analysis for your organization
        </p>
      </div>

      {/* High-Level Summary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Cooperatives"
          value={report.total_entities_analyzed}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Submissions"
          value={report.total_submissions}
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricCard
          title="Overall Average Risk"
          value={report.overall_average_risk_level.toFixed(2)}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="risk"
        />
        <MetricCard
          title="Overall Average Gap"
          value={report.overall_average_gap_score.toFixed(2)}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="gap"
        />
      </div>

      {/* Dimension-Specific Analysis Table */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Dimension Analysis</CardTitle>
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
                  <TableHead className="font-semibold">
                    Avg. Risk Level
                  </TableHead>
                  <TableHead className="font-semibold">
                    Avg. Gap Score
                  </TableHead>
                  <TableHead className="font-semibold">High Risk %</TableHead>
                  <TableHead className="font-semibold">Medium Risk %</TableHead>
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
                      <Badge
                        variant={getRiskBadgeVariant(
                          summary.average_risk_level,
                        )}
                      >
                        {summary.average_risk_level.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getRiskBadgeVariant(summary.average_gap_score)}
                      >
                        {summary.average_gap_score.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getRiskPercentageBadge(
                        summary.risk_level_distribution.high_risk_percentage,
                        "high",
                      )}
                    </TableCell>
                    <TableCell>
                      {getRiskPercentageBadge(
                        summary.risk_level_distribution.medium_risk_percentage,
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

      {/* Highest Risk Dimension & Recommendations */}
      {highestRiskDimension && (
        <Card className="border-l-4 border-l-destructive transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Highest Risk Dimension & Recommendations</CardTitle>
            </div>
            <CardDescription>
              Priority focus area requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {highestRiskDimension.dimension_name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Average Risk Level:
                </span>
                <Badge variant="destructive" className="text-sm">
                  {highestRiskDimension.average_risk_level.toFixed(2)}
                </Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-base">
                Top High-Priority Recommendations
              </h4>
              <ul className="space-y-2">
                {highestRiskDimension.top_recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                    <span className="text-sm leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Visualization */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dominant Risk by Dimension Bar Chart */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Dominant Risk by Dimension</CardTitle>
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

        {/* Risk Level Distribution Pie Chart */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Risk Level Distribution</CardTitle>
            </div>
            <CardDescription>
              Overall distribution of risk levels across all dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) =>
                    percent && percent > 0.05
                      ? `${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => {
                    const parts = value.split(" - ");
                    return parts.length > 1 ? parts[1] : value;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ConsolidatedReportPage;
