import { ActionPlan } from "@/types/actionPlan";
import { Link } from "react-router-dom";
import { Assessment } from "@/types/assessment";
import { useTranslation } from "react-i18next";

interface ActionPlanListProps {
  actionPlans: ActionPlan[];
  assessments: Assessment[];
}

export function ActionPlanList({
  actionPlans,
  assessments,
}: ActionPlanListProps) {
  const assessmentMap = new Map(
    assessments.map((assessment) => [assessment.id, assessment.name]),
  );
  const basePath = location.pathname.split("/").slice(0, 2).join("/");
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {actionPlans.map((plan) => (
          <li key={plan.action_plan_id}>
            <Link
              to={`${basePath}/action-plans/${plan.assessment_id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {assessmentMap.get(plan.assessment_id) ||
                      t("shared.actionPlans.unknownAssessment", { defaultValue: "Unknown Assessment" })}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {t("shared.actionPlans.viewPlan", { defaultValue: "View Plan" })}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {t("shared.actionPlans.createdOn", { defaultValue: "Created on:" })}{" "}
                      {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
