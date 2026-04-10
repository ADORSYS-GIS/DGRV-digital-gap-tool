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
    // Negative margin cancels the layout's padding so we can fill the full height
    <div
      className="flex flex-col gap-4"
      style={{
        height: "calc(100vh - 96px)", // 96px = navbar (64px) + layout py-6 (24px top + 8px buffer)
        overflow: "hidden",
        margin: "-24px -16px 0",
        padding: "24px 16px 0",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent px-5 py-4 border border-primary/10 shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Action plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Managing actions for{" "}
            <span className="font-medium">{assessmentName || "Assessment"}</span>
          </p>
        </div>
      </div>

      {/* Board — fills remaining height, columns scroll internally */}
      <div className="flex-1 min-h-0">
        <KanbanBoard submissionId={assessmentId} />
      </div>
    </div>
  );
}
