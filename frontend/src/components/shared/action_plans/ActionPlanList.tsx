import { ActionPlan } from "@/types/actionPlan";
import { Link } from "react-router-dom";
import { Assessment } from "@/types/assessment";
import { ClipboardList, Calendar, ArrowRight } from "lucide-react";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actionPlans.map((plan) => (
        <Link
          key={plan.action_plan_id}
          to={`${basePath}/action-plans/${plan.assessment_id}`}
          className="group block h-full"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(plan.created_at).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {assessmentMap.get(plan.assessment_id) || "Unknown Assessment"}
              </h3>

              <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                Action plan for digital gap assessment. Click to view and manage
                action items.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium text-primary">
                View Plan
              </span>
              <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      ))}

      {actionPlans.length === 0 && (
        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <ClipboardList className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No action plans yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Action plans are created when you complete an assessment.
          </p>
        </div>
      )}
    </div>
  );
}
