import * as React from "react";
import { Link } from "react-router-dom";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList } from "lucide-react";

const ActionPlanPage: React.FC = () => {
  const { data: submissions, isLoading, isError } = useSubmissions();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load submissions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const uniqueAssessments = Array.from(
    new Map(submissions?.map((sub) => [sub.assessmentId, sub])).values(),
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Select an Assessment</h1>
        <p className="text-muted-foreground mt-2">
          Choose an assessment to view its detailed action plan.
        </p>
      </header>

      {uniqueAssessments && uniqueAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueAssessments.map((submission) => (
            <Link
              to={`/third-admin/action-plan/${submission.assessmentId}`}
              key={submission.assessmentId}
              className="transform transition-transform duration-300 hover:scale-105"
            >
              <Card className="h-full flex flex-col hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-primary" />
                    <span>
                      {submission.assessmentName || "Unknown Assessment"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Action plan for assessment submitted on{" "}
                    {submission.createdAt
                      ? new Date(submission.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>No Action Plans Available</AlertTitle>
          <AlertDescription>
            You must complete an assessment to generate an action plan.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ActionPlanPage;