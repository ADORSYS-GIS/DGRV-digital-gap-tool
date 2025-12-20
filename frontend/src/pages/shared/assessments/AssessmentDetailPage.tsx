import { DimensionCard } from "@/components/shared/DimensionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { Assessment } from "@/types/assessment";
import { IDimension } from "@/types/dimension";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSubmitAssessment } from "@/hooks/submissions/useSubmitAssessment";

const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { mutateAsync: submitAssessment } = useSubmitAssessment();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [dimensions, setDimensions] = useState<IDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          } else {
            setDimensions([]);
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

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);

  const userRoles = useMemo(() => user?.roles || [], [user?.roles]);
  const isCoopUserRestricted = useMemo(
    () =>
      userRoles.map((r) => r.toLowerCase()).includes("coop_user") &&
      !userRoles.map((r) => r.toLowerCase()).includes("coop_admin"),
    [userRoles],
  );
  const assignedDimensionIds = useMemo(
    () => user?.assigned_dimensions || [],
    [user?.assigned_dimensions],
  );

  const filteredDimensions = useMemo(() => {
    if (!isCoopUserRestricted) return dimensions;
    if (!assignedDimensionIds.length) return [];
    return dimensions.filter((d) => assignedDimensionIds.includes(d.id));
  }, [dimensions, assignedDimensionIds, isCoopUserRestricted]);

  const submittedDimensionIds = useMemo(() => {
    return new Set(
      (dimensionAssessments || [])
        .filter((da) =>
          !isCoopUserRestricted
            ? true
            : assignedDimensionIds.includes(da.dimensionId),
        )
        .map((da) => da.dimensionId),
    );
  }, [dimensionAssessments, assignedDimensionIds, isCoopUserRestricted]);

  const completedPerspectives = submittedDimensionIds.size;

  const handleStartDimensionAssessment = (dimensionId: string) => {
    if (assessmentId) {
      const basePath = location.pathname.split("/")[1];
      navigate(
        `/${basePath}/assessment/${assessmentId}/dimension/${dimensionId}`,
      );
    } else {
      toast.error("Assessment ID not found.");
    }
  };

  const handleSubmit = async () => {
    if (assessmentId) {
      try {
        await submitAssessment(assessmentId);
        toast.success("Assessment submitted successfully!");
        const basePath = location.pathname.split("/")[1];
        navigate(`/${basePath}/assessments`);
      } catch (error) {
        toast.error("Failed to submit assessment.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading assessment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          <p className="font-semibold">Unable to load assessment</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-muted-foreground/30 bg-muted/40 px-6 py-4 text-sm text-muted-foreground">
          Assessment not found.
        </div>
      </div>
    );
  }

  const progressPercentage =
    filteredDimensions.length > 0
      ? (completedPerspectives / filteredDimensions.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress header */}
        <section className="mb-8 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:px-6 sm:py-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Digital gap assessment
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete each dimension to understand your current and desired
                digital maturity.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Your progress</span>
                <span>
                  {completedPerspectives} of {filteredDimensions.length}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-right text-xs font-semibold text-muted-foreground">
                {Math.round(progressPercentage)}%
              </p>
            </div>
          </div>
        </section>

        {/* Intro copy */}
        <section className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome to your digital journey
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Assess your cooperative across {filteredDimensions.length} key
            digital perspectives. Select a card below to start or continue an
            assessment.
          </p>
        </section>

        {/* Dimensions grid */}
        <section aria-label="Assessment dimensions">
          {filteredDimensions.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
              {isCoopUserRestricted
                ? "No dimensions are assigned to your account for this assessment."
                : "No dimensions are configured for this assessment yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDimensions.map((dimension) => (
                <DimensionCard
                  key={dimension.id}
                  dimension={dimension}
                  onClick={handleStartDimensionAssessment}
                  isSubmitted={submittedDimensionIds.has(dimension.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Finish Assessment Button */}
        {!isCoopUserRestricted && (
          <section className="mt-10 text-center">
            <Button
              size="lg"
              disabled={progressPercentage < 100}
              onClick={handleSubmit}
            >
              Finish assessment
            </Button>
          </section>
        )}
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
