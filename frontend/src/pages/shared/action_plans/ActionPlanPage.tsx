import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useParams } from "react-router-dom";

export default function ActionPlanPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { data: assessments } = useSubmissions();

  const assessmentName = assessments?.find(
    (assessment) => assessment.id === assessmentId,
  )?.name;

  if (!assessmentId) {
    return <p>Assessment not found.</p>;
  }

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

      <KanbanBoard submissionId={assessmentId} />
    </div>
  );
}
