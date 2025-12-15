import { useActionPlans } from "@/hooks/action_plans/useActionPlans";
import { ActionPlanList } from "@/components/shared/action_plans/ActionPlanList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";

export default function ActionPlansListPage() {
  const {
    data: actionPlans,
    isLoading: isLoadingActionPlans,
    error: errorActionPlans,
  } = useActionPlans();
  const {
    data: assessments,
    isLoading: isLoadingAssessments,
    error: errorAssessments,
  } = useSubmissions();

  const isLoading = isLoadingActionPlans || isLoadingAssessments;
  const error = errorActionPlans || errorAssessments;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Action Plans
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            View and manage all your action plans to bridge digital gaps.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                An error occurred: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {actionPlans && assessments && (
        <ActionPlanList actionPlans={actionPlans} assessments={assessments} />
      )}
    </div>
  );
}
