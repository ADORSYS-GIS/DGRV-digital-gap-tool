import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OrganizationReportsPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();

  const { data: organizations } = useOrganizations();
  const organizationName = organizations?.find(org => org.id === organizationId)?.name || organizationId;

  const {
    data: submissions,
    isLoading,
    error,
  } = useSubmissionsByOrganization(organizationId || "");

  const handleSubmissionSelect = (submissionId: string) => {
    navigate(`/admin/reports/${organizationId}/${submissionId}/export`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading submissions: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/reports")}
              className="text-gray-500 hover:text-primary hover:bg-primary/5 -ml-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Organizations
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Organization Reports
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            View submissions for Organization <span className="font-semibold text-primary">{organizationName}</span>
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Select a Submission</h2>
        </div>
        {submissions && submissions.length > 0 ? (
          <SubmissionList
            submissions={submissions}
            onSubmissionSelect={handleSubmissionSelect}
            basePath={`/admin/reports/${organizationId}`}
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No submissions found for this organization.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationReportsPage;
