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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Action Plans</h1>
        <p className="text-gray-600">View and manage all your action plans</p>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {actionPlans && assessments && (
        <ActionPlanList actionPlans={actionPlans} assessments={assessments} />
      )}
    </div>
  );
}
