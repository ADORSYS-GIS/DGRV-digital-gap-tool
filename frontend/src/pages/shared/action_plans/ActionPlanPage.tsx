import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ActionPlanPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { data: assessments } = useSubmissions();
  const { t } = useTranslation();

  const assessmentName = assessments?.find(
    (assessment) => assessment.id === assessmentId,
  )?.name;

  if (!assessmentId) {
    return <p>{t("actionPlanPage.assessmentNotFound")}</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("actionPlanPage.title", {
            name:
              assessmentName || t("answerDimensionAssessment.assessmentSuffix"),
          })}
        </h1>
        <p className="text-gray-600">{t("actionPlanPage.subtitle")}</p>
      </div>

      <KanbanBoard submissionId={assessmentId} />
    </div>
  );
}
