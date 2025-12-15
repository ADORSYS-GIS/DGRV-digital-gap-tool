import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionDetail } from "@/components/shared/submissions/SubmissionDetail";
import { Button } from "@/components/ui/button";
import { useSubmission } from "@/hooks/submissions/useSubmission";
import { ArrowLeft, Download } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExportReportPage: React.FC = () => {
  const { organizationId, submissionId } = useParams<{
    organizationId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();

  const {
    data: submission,
    isLoading,
    error,
  } = useSubmission(submissionId || "");

  const handleExportReport = () => {
    // TODO: Implement actual report export logic here
    console.log(`Exporting report for submission ${submissionId}`);
    alert("Report export functionality is not yet implemented.");
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
      <div className="text-center text-red-500">
        Error loading submission: {error.message}
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center text-gray-500">Submission not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        onClick={() => navigate(`/admin/reports/${organizationId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Submissions
      </Button>
      <h1 className="text-2xl font-bold mb-4">Export Report</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Submission Details</h2>
        <SubmissionDetail submission={submission} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleExportReport} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>
    </div>
  );
};

export default ExportReportPage;