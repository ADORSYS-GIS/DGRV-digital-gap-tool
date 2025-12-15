import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OrganizationReportsPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();

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
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        onClick={() => navigate("/admin/reports")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Organizations
      </Button>
      <h1 className="text-2xl font-bold mb-4">
        Submissions for Organization {organizationId}
      </h1>
      {submissions && submissions.length > 0 ? (
        <SubmissionList
          submissions={submissions}
          onSubmissionSelect={handleSubmissionSelect}
          basePath={`/admin/reports/${organizationId}`}
        />
      ) : (
        <p>No submissions found for this organization.</p>
      )}
    </div>
  );
};

export default OrganizationReportsPage;