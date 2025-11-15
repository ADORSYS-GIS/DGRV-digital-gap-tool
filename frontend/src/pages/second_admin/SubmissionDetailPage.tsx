import { useParams } from "react-router-dom";
import { useSubmissionSummary } from "@/hooks/submissions/useSubmissionSummary";
import { SubmissionDetail } from "@/components/second_admin/submissions/SubmissionDetail";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function SubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const {
    data: summary,
    isLoading,
    error,
  } = useSubmissionSummary(submissionId!);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {summary && <SubmissionDetail summary={summary} />}
    </div>
  );
}
