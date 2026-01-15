import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDgrvAdminConsolidatedReport } from "@/hooks/consolidated_reports/useDgrvAdminConsolidatedReport";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Terminal } from "lucide-react";

export const ConsolidatedReport = () => {
  const { data, isLoading, error } = useDgrvAdminConsolidatedReport();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Failed to load the consolidated report. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Consolidated Report</h1>
      {data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Entities Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.total_entities_analyzed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.total_submissions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overall Average Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {data.overall_average_risk_level.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overall Average Gap Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {data.overall_average_gap_score.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
