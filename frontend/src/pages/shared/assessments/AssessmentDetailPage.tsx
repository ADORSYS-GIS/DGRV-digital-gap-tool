import { DimensionCard } from "@/components/shared/DimensionCard";
import { Progress } from "@/components/ui/progress";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { Assessment } from "@/types/assessment";
import { IDimension } from "@/types/dimension";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [dimensions, setDimensions] = useState<IDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      if (!assessmentId) return;

      try {
        setLoading(true);
        const fetchedAssessment =
          await assessmentRepository.getById(assessmentId);
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
          setError(t("assessmentDetailPage.assessmentNotFound"));
        }
      } catch (err) {
        setError(t("assessmentDetailPage.failedToFetch"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [assessmentId]);

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);

  const submittedDimensionIds = useMemo(() => {
    return new Set(dimensionAssessments?.map((da) => da.dimensionId));
  }, [dimensionAssessments]);

  const completedPerspectives = submittedDimensionIds.size;

  const handleStartDimensionAssessment = (dimensionId: string) => {
    if (assessmentId) {
      const basePath = location.pathname.split("/")[1];
      navigate(
        `/${basePath}/assessment/${assessmentId}/dimension/${dimensionId}`,
      );
    } else {
      toast.error(t("assessmentDetailPage.missingAssessmentId"));
    }
  };

  if (loading) {
    return <div>{t("assessmentDetailPage.loading")}</div>;
  }

  if (error) {
    return <div>{t("assessmentDetailPage.error", { message: error })}</div>;
  }

  if (!assessment) {
    return <div>{t("assessmentDetailPage.assessmentNotFound")}</div>;
  }

  const progressPercentage =
    dimensions.length > 0
      ? (completedPerspectives / dimensions.length) * 100
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {t("assessmentDetailPage.title")}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="w-64">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {t("assessmentDetailPage.progressLabel")}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {t("assessmentDetailPage.progressCount", {
                      completed: completedPerspectives,
                      total: dimensions.length,
                    })}
                  </span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
              <span className="font-semibold text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            {t("assessmentDetailPage.welcomeTitle")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("assessmentDetailPage.welcomeDescription", {
              count: dimensions.length,
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dimensions.map((dimension) => (
            <DimensionCard
              key={dimension.id}
              dimension={dimension}
              onClick={handleStartDimensionAssessment}
              isSubmitted={submittedDimensionIds.has(dimension.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
