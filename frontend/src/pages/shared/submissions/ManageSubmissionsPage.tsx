import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ManageSubmissionsPage() {
  const { data: submissions, isLoading, error } = useSubmissions();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Submissions
        </h1>
        <p className="text-gray-600">
          View and manage all your sustainability submissions
        </p>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {submissions && <SubmissionList submissions={submissions} />}
    </div>
  );
}
