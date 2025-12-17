import React, { useCallback, useEffect, useMemo, useState } from "react";
import { calculateGapScore } from "@/utils/gapCalculation";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { DimensionAssessmentAnswer } from "@/components/assessment/answering/DimensionAssessmentAnswer";
import { GapDescriptionDisplay } from "@/components/assessment/answering/GapDescriptionDisplay";
import { DimensionIcon } from "@/components/shared/DimensionIcon";
import { useAssessment } from "@/hooks/assessments/useAssessment";
import { useDimensionWithStates } from "@/hooks/assessments/useDimensionWithStates";
import { useSubmitDimensionAssessment } from "@/hooks/assessments/useSubmitDimensionAssessment";
import { useSubmitAssessment } from "@/hooks/submissions/useSubmitAssessment";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import {
  IDimensionAssessment,
  IDimensionState,
  IDimensionWithStates,
} from "@/types/dimension";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RouteParams extends Record<string, string | undefined> {
  assessmentId: string;
  dimensionId: string;
}

interface LocationState {
  from?: string;
}

interface DimensionWithStates extends IDimensionWithStates {
  states?: IDimensionState[];
  currentState?: IDimensionState | null;
  desiredState?: IDimensionState | null;
}

export const AnswerDimensionAssessmentPage: React.FC = () => {
  const { assessmentId, dimensionId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info and IDs
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const cooperationId = useCooperationId() || null; // Ensure null instead of undefined
  const userRoles = useMemo(() => user?.roles || [], [user?.roles]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gapId, setGapId] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    currentLevel: number;
    desiredLevel: number;
    currentLevelDescription?: string;
    desiredLevelDescription?: string;
  } | null>(null);

  // Check if we're coming from the assessment detail page to handle back navigation
  const locationState = location.state as LocationState | undefined;
  const fromAssessmentDetail = locationState?.from === "assessment-detail";

  const {
    data: dimension,
    isLoading,
    error: dimensionError,
  } = useDimensionWithStates(dimensionId || "") as {
    data: DimensionWithStates | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const { data: assessment } = useAssessment(assessmentId || "");
  const { data: dimensionAssessments } = useDimensionAssessments(
    assessmentId || "",
  );

  const existingAssessment = useMemo(() => {
    const rawAssessment = dimensionAssessments?.find(
      (da) => da.dimensionId === dimensionId,
    );

    // If we have an existing assessment and dimension data, enrich it with actual levels
    if (rawAssessment && dimension) {
      const currentState = dimension.current_states?.find(
        (s) => s.id === rawAssessment.currentState.id,
      );
      const desiredState = dimension.desired_states?.find(
        (s) => s.id === rawAssessment.desiredState.id,
      );

      return {
        ...rawAssessment,
        currentState: {
          ...rawAssessment.currentState,
          level: currentState?.level || 0,
          description: currentState?.description || "",
        },
        desiredState: {
          ...rawAssessment.desiredState,
          level: desiredState?.level || 0,
          description: desiredState?.description || "",
        },
      };
    }

    return rawAssessment;
  }, [dimensionAssessments, dimensionId, dimension]);

  const isLastDimension = useMemo(() => {
    if (assessment?.dimensionIds && dimensionId) {
      const currentIndex = assessment.dimensionIds.indexOf(dimensionId);
      return currentIndex === assessment.dimensionIds.length - 1;
    }
    return false;
  }, [assessment, dimensionId]);

  useEffect(() => {
    // Reset state when dimension changes
    setShowResult(false);
    setError(null);
    setGapId(null);
    setSubmittedData(null);
    setIsSubmitting(false);
  }, [dimensionId]);

  const { mutateAsync: submitDimensionAssessment } =
    useSubmitDimensionAssessment();
  const { mutateAsync: submitFullAssessment } = useSubmitAssessment();

  const handleSuccess = (data: IDimensionAssessment) => {
    if (data.gap_id) {
      setGapId(data.gap_id);
    }
    setShowResult(true);
    setIsSubmitting(false);
    setError(null);
  };

  const handleError = (error: Error) => {
    setIsSubmitting(false);
    setError(error.message || "Failed to submit assessment. Please try again.");
  };

  const handleSubmit = useCallback(
    async (currentLevel: number, desiredLevel: number) => {
      if (!assessmentId || !dimensionId || !dimension) {
        setError("Missing assessment or dimension ID");
        return;
      }

      const currentState = dimension.current_states?.find(
        (state) => state.level === currentLevel,
      );
      const desiredState = dimension.desired_states?.find(
        (state) => state.level === desiredLevel,
      );

      if (!currentState || !desiredState) {
        setError("Invalid level selected. Please try again.");
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        setSubmittedData({
          currentLevel,
          desiredLevel,
          currentLevelDescription: currentState.description,
          desiredLevelDescription: desiredState.description,
        });

        if (!organizationId) {
          throw new Error("Organization ID is required");
        }

        const payload = {
          assessmentId,
          dimensionId,
          currentStateId: currentState.id,
          desiredStateId: desiredState.id,
          gapScore: calculateGapScore(currentLevel, desiredLevel),
          currentLevel,
          desiredLevel,
          organizationId,
          cooperationId,
          userRoles,
        };

        await submitDimensionAssessment(payload, {
          onSuccess: handleSuccess,
          onError: handleError,
        });
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error("An unknown error occurred"),
        );
        throw error; // Re-throw to allow the form to handle the error
      }
    },
    [
      assessmentId,
      dimensionId,
      submitDimensionAssessment,
      dimension,
      organizationId,
      cooperationId,
      userRoles,
    ],
  );

  const handleBack = useCallback(() => {
    if (fromAssessmentDetail) {
      navigate(-1);
    } else if (assessmentId) {
      const basePath = location.pathname.split("/")[1];
      navigate(`/${basePath}/assessment/${assessmentId}`);
    } else {
      const basePath = location.pathname.split("/")[1];
      navigate(`/${basePath}/assessments`);
    }
  }, [navigate, fromAssessmentDetail, assessmentId, location.pathname]);

  const handleContinue = useCallback(async () => {
    if (assessment && assessment.dimensionIds && dimensionId) {
      const currentIndex = assessment.dimensionIds.indexOf(dimensionId);
      if (
        currentIndex !== -1 &&
        currentIndex < assessment.dimensionIds.length - 1
      ) {
        const nextDimensionId = assessment.dimensionIds[currentIndex + 1];
        const basePath = location.pathname.split("/")[1];
        navigate(
          `/${basePath}/assessment/${assessmentId}/dimension/${nextDimensionId}`,
        );
      } else {
        // Last dimension, submit the full assessment
        if (assessmentId) {
          await submitFullAssessment(assessmentId);
          const basePath = location.pathname.split("/")[1];
          navigate(`/${basePath}/assessment/${assessmentId}`);
        }
      }
    }
  }, [
    assessment,
    dimensionId,
    assessmentId,
    navigate,
    submitFullAssessment,
    location.pathname,
  ]);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading assessment…</span>
        </div>
      </div>
    );
  }

  // Error state
  if (dimensionError || !dimension) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md space-y-4 rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-5 text-sm text-destructive">
          <p className="font-semibold">Failed to load dimension details.</p>
          <p className="opacity-90">
            {dimensionError?.message || "Please try again later."}
          </p>
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-2 px-0 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Header */}
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DimensionIcon
              name={dimension.name}
              className="h-8 w-8 text-primary"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {dimension.name} assessment
            </h1>
            {dimension.description && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {dimension.description}
              </p>
            )}
          </div>
        </header>

        {/* Inline error banner */}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="flex items-start justify-between gap-3">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleCloseError}
                className="text-xs font-medium underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main answer form */}
        <DimensionAssessmentAnswer
          dimension={{
            ...dimension,
            currentState: dimension.currentState || null,
            desiredState: dimension.desiredState || null,
          }}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          error={error || null}
          existingAssessment={existingAssessment || null}
        />

        {/* Show analysis for both new submissions and existing assessments */}
        {((showResult && gapId && submittedData) ||
          (existingAssessment?.gap_id &&
            existingAssessment.currentState.level > 0 &&
            existingAssessment.desiredState.level > 0)) && (
          <GapDescriptionDisplay
            gapId={(showResult && gapId) || existingAssessment?.gap_id || ""}
            currentLevel={
              submittedData?.currentLevel ||
              existingAssessment?.currentState.level ||
              0
            }
            desiredLevel={
              submittedData?.desiredLevel ||
              existingAssessment?.desiredState.level ||
              0
            }
            currentLevelDescription={
              submittedData?.currentLevelDescription ||
              existingAssessment?.currentState.description ||
              ""
            }
            desiredLevelDescription={
              submittedData?.desiredLevelDescription ||
              existingAssessment?.desiredState.description ||
              ""
            }
          />
        )}

        {showResult && (
          <div className="flex justify-center pb-4 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={handleContinue}
              data-testid="continue-button"
              className="min-w-[220px]"
            >
              {isLastDimension ? "Finish assessment" : "Continue to next topic"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerDimensionAssessmentPage;
