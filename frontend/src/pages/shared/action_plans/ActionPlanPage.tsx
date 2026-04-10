import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useParams, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function ActionPlanPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { data: assessments } = useSubmissions();
  const location = useLocation();
  const basePath = location.pathname.split("/")[1];

  const assessmentName = assessments?.find(
    (a) => a.id === assessmentId,
  )?.name;

  if (!assessmentId) {
    return <p>Assessment not found.</p>;
  }

  return (
    /*
     * We use negative margins to "escape" the layout's px-4 py-6 padding,
     * then re-apply padding only on the sides. This lets the page fill the
     * full height of the scrollable container without the container scrolling.
     * overflow-hidden here stops the wrapper div from scrolling — only the
     * column content areas (overflow-y-auto) scroll.
     */
    <div
      className="flex flex-col overflow-hidden"
      style={{
        margin: "-24px -16px",
        height: "calc(100% + 48px)",
        padding: "16px 16px 0",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent px-5 py-3 border border-primary/10 shrink-0 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Action plan</h1>
          <p className="text-sm text-muted-foreground">
            Managing actions for <span className="font-medium">{assessmentName || "Assessment"}</span>
          </p>
        </div>
        <Link
          to={`/${basePath}/submissions`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to submissions
        </Link>
      </div>

      {/* Board — fills remaining height, columns scroll internally */}
      <div className="flex-1 min-h-0">
        <KanbanBoard submissionId={assessmentId} />
      </div>
    </div>
  );
}
