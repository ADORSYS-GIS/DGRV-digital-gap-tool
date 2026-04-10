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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-5 sm:p-7 border border-primary/10">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Action plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Managing actions for <span className="font-medium">{assessmentName || "Assessment"}</span>
          </p>
        </div>
      </div>

      <KanbanBoard submissionId={assessmentId} />
    </div>
  );
}
