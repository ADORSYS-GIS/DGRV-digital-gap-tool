/**
 * Answer Assessment page for the Third Admin Dashboard.
 * This page displays a list of available assessments for the user to answer.
 */
import * as React from "react";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AssessmentCard } from "@/components/user/assessments/AssessmentCard";

const AnswerAssessment: React.FC = () => {
  const { data: assessments, isLoading: isLoadingAssessments } =
    useAssessments();

  if (isLoadingAssessments) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Answer Assessment</h1>
          <p className="text-gray-600">
            Select an assessment to answer.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {assessments?.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>
    </div>
  );
};

export default AnswerAssessment;
