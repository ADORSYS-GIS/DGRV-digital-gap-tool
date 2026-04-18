import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useParams, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ActionPlanPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { data: assessments } = useSubmissions();
  const location = useLocation();
  const basePath = location.pathname.split("/")[1];

  const { t } = useTranslation();
  const assessmentName = assessments?.find((a) => a.id === assessmentId)?.name;

  if (!assessmentId) return <p>{t("sharedPages.actionPlans.assessmentNotFound", { defaultValue: "Assessment not found." })}</p>;

  return (
    // h-full fills the layout's scrollable content div
    // overflow-hidden prevents this page from scrolling — only columns scroll
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent px-5 py-3 border border-primary/10 shrink-0 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{t("sharedPages.actionPlans.title", { defaultValue: "Action plan" })}</h1>
          <p className="text-sm text-muted-foreground">
            {t("sharedPages.actionPlans.managingActionsFor", { defaultValue: "Managing actions for " })}
            <span className="font-medium">{assessmentName || t("sharedPages.actionPlans.assessment", { defaultValue: "Assessment" })}</span>
          </p>
        </div>
        <Link
          to={`/${basePath}/submissions`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t("sharedPages.actionPlans.backToSubmissions", { defaultValue: "Back to submissions" })}
        </Link>
      </div>

      {/* Board — flex-1 min-h-0 lets it fill remaining height without overflowing */}
      <div className="flex-1 min-h-0">
        <KanbanBoard submissionId={assessmentId} />
      </div>
    </div>
  );
}
