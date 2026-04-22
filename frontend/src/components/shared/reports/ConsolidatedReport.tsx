/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { exportConsolidatedReportAsPDF, type ExportTranslations } from "@/utils/exportConsolidatedReport";
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
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  Info,
  Download,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useDgrvAdminConsolidatedReport } from "@/hooks/consolidated_reports/useDgrvAdminConsolidatedReport";
import { useOrgAdminConsolidatedReport } from "@/hooks/consolidated_reports/useOrgAdminConsolidatedReport";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";

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

interface ConsolidatedReportProps {
  organizationId?: string;
}

export const ConsolidatedReport: React.FC<ConsolidatedReportProps> = ({
  organizationId,
}) => {
  const { t } = useTranslation();
  const {
    data: dgrvData,
    isLoading: dgrvLoading,
    error: dgrvError,
  } = useDgrvAdminConsolidatedReport();
  const {
    data: orgData,
    isLoading: orgLoading,
    error: orgError,
  } = useOrgAdminConsolidatedReport(organizationId || "");

  const report = organizationId ? orgData : dgrvData;
  const loading = organizationId ? orgLoading : dgrvLoading;
  const error = organizationId ? orgError : dgrvError;

  const handleExportPDF = () => {
    if (report) {
      const translations: ExportTranslations = {
        title: t("consolidatedReport.title"),
        digitalGapAnalysis: t("consolidatedReport.digitalGapAnalysis"),
        totalSubmissions: t("consolidatedReport.metrics.totalSubmissions"),
        dimensionAnalysis: t("consolidatedReport.dimensions.title"),
        riskDistributionDesc: t("consolidatedReport.dimensions.subtitle"),
        table: {
          dimension: t("consolidatedReport.dimensions.table.dimension"),
          highRisk: t("consolidatedReport.dimensions.table.highRisk"),
          mediumRisk: t("consolidatedReport.dimensions.table.mediumRisk"),
          lowRisk: t("consolidatedReport.dimensions.table.lowRisk"),
        },
        attention: {
          title: t("consolidatedReport.focus.high.title"),
          avgScore: t("consolidatedReport.focus.avgScore"),
          recommendations: t("consolidatedReport.focus.high.recTitle"),
          subtitles: {
            high: t("consolidatedReport.focus.high.subtitle"),
            medium: t("consolidatedReport.focus.medium.subtitle"),
            low: t("consolidatedReport.focus.low.subtitle"),
          },
          riskLevels: {
            high: t("consolidatedReport.focus.highRisk"),
            medium: t("consolidatedReport.focus.mediumRisk"),
            low: t("consolidatedReport.focus.lowRisk"),
          },
        },
        chart: {
          title: t("consolidatedReport.chart.title"),
          subtitle: t("consolidatedReport.chart.subtitle"),
        },
        legend: {
          highRisk: t("consolidatedReport.chart.highRisk"),
          mediumRisk: t("consolidatedReport.chart.mediumRisk"),
          lowRisk: t("consolidatedReport.chart.lowRisk"),
        },
        footer: {
          generatedOn: t("consolidatedReport.footer.generatedOn"),
          pageOf: t("consolidatedReport.footer.pageOf"),
        },
      };

      if (highestRiskDimension) {
        const avg = highestRiskDimension.average_risk_level;
        if (avg > 2.5) {
          translations.attention.title = t("consolidatedReport.focus.high.title");
          translations.attention.recommendations = t("consolidatedReport.focus.high.recTitle");
        } else if (avg >= 1.5) {
          translations.attention.title = t("consolidatedReport.focus.medium.title");
          translations.attention.recommendations = t("consolidatedReport.focus.medium.recTitle");
        } else {
          translations.attention.title = t("consolidatedReport.focus.low.title");
          translations.attention.recommendations = t("consolidatedReport.focus.low.recTitle");
        }
      }

      exportConsolidatedReportAsPDF(report, translations);
    }
  };

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
        name: t("consolidatedReport.focus.lowRisk"),
        value: low_risk_percentage,
        color: RISK_COLORS.low,
      };

      if (medium_risk_percentage >= dominantRisk.value) {
        dominantRisk = {
          name: t("consolidatedReport.focus.mediumRisk"),
          value: medium_risk_percentage,
          color: RISK_COLORS.medium,
        };
      }

      if (high_risk_percentage >= dominantRisk.value) {
        dominantRisk = {
          name: t("consolidatedReport.focus.highRisk"),
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !report) {
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
            <p className="text-muted-foreground">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8 overflow-y-auto h-full">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("consolidatedReport.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("consolidatedReport.subtitle")}
          </p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" />
          {t("consolidatedReport.exportPDF")}
        </Button>
      </div>

      <div className="p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t("consolidatedReport.metrics.totalSubmissions")}
            value={report.total_submissions}
            icon={<FileText className="h-5 w-5" />}
          />
        </div>

        <Card className="transition-all duration-200 hover:shadow-md mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{t("consolidatedReport.dimensions.title")}</CardTitle>
              <InfoPopover title={t("consolidatedReport.dimensions.popoverTitle")}>
                <p>
                  {t("consolidatedReport.dimensions.popoverDesc")}
                </p>
                <ul className="mt-2 list-disc pl-4 space-y-1">
                  <li>
                    <strong>{t("consolidatedReport.dimensions.table.highRisk")}</strong> {t("consolidatedReport.dimensions.highRiskDesc")}
                  </li>
                  <li>
                    <strong>{t("consolidatedReport.dimensions.table.mediumRisk")}</strong> {t("consolidatedReport.dimensions.mediumRiskDesc")}
                  </li>
                  <li>
                    <strong>{t("consolidatedReport.dimensions.table.lowRisk")}</strong> {t("consolidatedReport.dimensions.lowRiskDesc")}
                  </li>
                </ul>
              </InfoPopover>
            </div>
            <CardDescription>
              {t("consolidatedReport.dimensions.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">{t("consolidatedReport.dimensions.table.dimension")}</TableHead>
                    <TableHead className="font-semibold">{t("consolidatedReport.dimensions.table.highRisk")}</TableHead>
                    <TableHead className="font-semibold">
                      Medium Risk %
                    </TableHead>
                    <TableHead className="font-semibold">{t("consolidatedReport.dimensions.table.lowRisk")}</TableHead>
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
            ? t("consolidatedReport.focus.high.title")
            : isMedium
              ? t("consolidatedReport.focus.medium.title")
              : t("consolidatedReport.focus.low.title");

          const subtitle = isHigh
            ? t("consolidatedReport.focus.high.subtitle")
            : isMedium
              ? t("consolidatedReport.focus.medium.subtitle")
              : t("consolidatedReport.focus.low.subtitle");

          const popoverBody = isHigh
            ? t("consolidatedReport.focus.high.popover")
            : isMedium
              ? t("consolidatedReport.focus.medium.popover")
              : t("consolidatedReport.focus.low.popover");

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
            ? t("consolidatedReport.focus.high.recTitle")
            : isMedium
              ? t("consolidatedReport.focus.medium.recTitle")
              : t("consolidatedReport.focus.low.recTitle");

          return (
            <Card className={`border-l-4 ${accent} transition-all duration-200 hover:shadow-md mt-6`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                  <CardTitle>{title}</CardTitle>
                  <InfoPopover title={t("consolidatedReport.focus.aboutTitle")}>
                    <p>{popoverBody}</p>
                    <p className="mt-2">
                      {t("consolidatedReport.focus.aboutDesc")}
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

        <div className="grid gap-6 lg:grid-cols-1 mt-6">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t("consolidatedReport.chart.title")}</CardTitle>
                <InfoPopover title={t("consolidatedReport.chart.aboutTitle")}>
                  <p>
                    {t("consolidatedReport.chart.aboutDesc1")}
                  </p>
                  <p className="mt-2">
                    {t("consolidatedReport.chart.aboutDesc2")}
                  </p>
                </InfoPopover>
              </div>
              <CardDescription>
                {t("consolidatedReport.chart.subtitle")}
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
};
