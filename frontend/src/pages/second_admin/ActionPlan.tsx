import * as React from "react";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmittedAssessmentCard } from "@/components/second_admin/action_plan/SubmittedAssessmentCard";
import { Assessment } from "@/types/assessment";

const ActionPlan: React.FC = () => {
  const { data: assessments, isLoading: isLoadingAssessments } =
    useAssessments();
  const { data: submissions, isLoading: isLoadingSubmissions } =
    useSubmissions();

  if (isLoadingAssessments || isLoadingSubmissions) {
    return <LoadingSpinner />;
  }

  const submittedAssessments =
    assessments?.filter((assessment: Assessment) => {
      const assessmentSubmissions =
        submissions?.filter((s) => s.assessmentId === assessment.id) || [];
      return assessmentSubmissions.length >= assessment.categories.length;
    }) || [];

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Action Plan</h1>
          <p className="text-gray-600">
            View submitted assessments and their action plans.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {submittedAssessments.map((assessment: Assessment) => (
          <SubmittedAssessmentCard
            key={assessment.id}
            assessment={assessment}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionPlan;