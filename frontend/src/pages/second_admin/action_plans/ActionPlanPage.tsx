import { useParams } from "react-router-dom";
import { useActionPlan } from "@/hooks/action_plans/useActionPlan";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { KanbanBoard } from "@/components/second_admin/action_plans/KanbanBoard";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";

export default function ActionPlanPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const {
    data: actionPlan,
    isLoading: isLoadingActionPlan,
    error: errorActionPlan,
  } = useActionPlan(assessmentId);
  const {
    data: assessments,
    isLoading: isLoadingAssessments,
    error: errorAssessments,
  } = useSubmissions();

  const isLoading = isLoadingActionPlan || isLoadingAssessments;
  const error = errorActionPlan || errorAssessments;

  const assessmentName = assessments?.find(
    (assessment) => assessment.id === assessmentId,
  )?.name;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Action Plan for {assessmentName || "Assessment"}
        </h1>
        <p className="text-gray-600">
          Track your action items from to-do to approved.
        </p>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {actionPlan && <KanbanBoard actionPlan={actionPlan} />}
    </div>
  );
}
