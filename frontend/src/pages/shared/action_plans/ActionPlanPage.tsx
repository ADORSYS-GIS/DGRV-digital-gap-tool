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
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Action Plan for {assessmentName || "Assessment"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Track your action items from to-do to approved. Drag and drop items to update their status.
          </p>
        </div>
      </div>

      <KanbanBoard submissionId={assessmentId} />
    </div>
  );
}
