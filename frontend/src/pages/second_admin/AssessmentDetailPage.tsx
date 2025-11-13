import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { Assessment } from "@/types/assessment";
import { IDimension } from "@/types/dimension";
import { DimensionCard } from "@/components/shared/DimensionCard";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [dimensions, setDimensions] = useState<IDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedPerspectives, setCompletedPerspectives] = useState(0);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      if (!assessmentId) return;

      try {
        setLoading(true);
        const fetchedAssessment = await assessmentRepository.getById(
          assessmentId,
        );
        if (fetchedAssessment) {
          setAssessment(fetchedAssessment);
          if (
            fetchedAssessment.dimensionIds &&
            fetchedAssessment.dimensionIds.length > 0
          ) {
            const fetchedDimensions = await dimensionRepository.getByIds(
              fetchedAssessment.dimensionIds,
            );
            setDimensions(fetchedDimensions);
          }
        } else {
          setError("Assessment not found.");
        }
      } catch (err) {
        setError("Failed to fetch assessment details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [assessmentId]);

  const handleStartDimensionAssessment = (dimensionId: string) => {
    toast.info(
      `Starting assessment for dimension ${dimensionId}. This feature is not yet implemented.`,
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!assessment) {
    return <div>Assessment not found.</div>;
  }

  const progressPercentage =
    dimensions.length > 0
      ? (completedPerspectives / dimensions.length) * 100
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Digital Gap Assessment</h1>
              <div className="mt-4">
                <h2 className="text-md font-semibold">Your Progress</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {completedPerspectives} of {dimensions.length} perspectives
                  completed
                </p>
                <div className="flex items-center">
                  <Progress
                    value={progressPercentage}
                    className="w-full max-w-md"
                  />
                  <span className="ml-4 font-semibold text-gray-700">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline">Logout</Button>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to Your Digital Journey
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Assess your cooperative across {dimensions.length} key digital
            perspectives. Click on any card below to begin your assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dimensions.map((dimension) => (
            <DimensionCard
              key={dimension.id}
              dimension={dimension}
              onStart={handleStartDimensionAssessment}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetailPage;