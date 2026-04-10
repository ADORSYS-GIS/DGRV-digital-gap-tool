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
    <div className="w-full flex flex-col gap-6" style={{ height: "calc(100vh - 120px)", overflow: "hidden" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-5 sm:p-7 border border-primary/10 shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Action plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Managing actions for <span className="font-medium">{assessmentName || "Assessment"}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard submissionId={assessmentId} />
      </div>
    </div>
  );
}
