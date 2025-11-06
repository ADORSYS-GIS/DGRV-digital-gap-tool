import * as React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddAssessmentModal } from "@/components/second_admin/assessments/AddAssessmentModal";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useAddAssessment } from "@/hooks/assessments/useAddAssessment";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AssessmentCard } from "@/components/second_admin/assessments/AssessmentCard";
import { Submission } from "@/types/submission";

const CreateAssessment: React.FC = () => {
  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const { data: assessments, isLoading: isLoadingAssessments } = useAssessments();
  const addAssessmentMutation = useAddAssessment();

  const handleCreateAssessment = (name: string, selectedDimensions: string[]) => {
    addAssessmentMutation.mutate({
      name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      categories: selectedDimensions
        .map((id) => dimensions?.find((d) => d.id === id)?.name)
        .filter((name): name is string => !!name),
      status: "New",
    });
  };

  if (isLoadingDimensions || isLoadingAssessments) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Assessment</h1>
          <p className="text-gray-600">
            Design and deploy new assessments for cooperatives.
          </p>
        </div>
        {dimensions && (
          <AddAssessmentModal
            dimensions={dimensions}
            onSave={handleCreateAssessment}
          />
        )}
      </div>

      <div className="space-y-4">
        {assessments?.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>
    </div>
  );
};

export default CreateAssessment;