import React, { useCallback, useEffect, useMemo, useState } from "react";
import { calculateGapScore } from "@/utils/gapCalculation";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useTranslation } from "react-i18next";
// Core React and routing
// Material-UI components
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();

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
    return dimensionAssessments?.find((da) => da.dimensionId === dimensionId);
  }, [dimensionAssessments, dimensionId]);

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
    setError(error.message || t("answerDimensionAssessment.submitError"));
  };

  const handleSubmit = useCallback(
    async (currentLevel: number, desiredLevel: number) => {
      if (!assessmentId || !dimensionId || !dimension) {
        setError(t("answerDimensionAssessment.missingIdsError"));
        return;
      }

      const currentState = dimension.current_states?.find(
        (state) => state.level === currentLevel,
      );
      const desiredState = dimension.desired_states?.find(
        (state) => state.level === desiredLevel,
      );

      if (!currentState || !desiredState) {
        setError(t("answerDimensionAssessment.invalidLevelError"));
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
          throw new Error(t("answerDimensionAssessment.organizationIdRequired"));
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
            : new Error(t("answerDimensionAssessment.unknownError")),
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        data-testid="loading-indicator"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (dimensionError || !dimension) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          bgcolor="error.light"
          color="error.contrastText"
          p={2}
          mb={2}
          borderRadius={1}
        >
          {t("answerDimensionAssessment.loadDimensionError")}{" "}
          {dimensionError?.message || t("answerDimensionAssessment.tryAgainLater")}
        </Box>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          {t("answerDimensionAssessment.backToAssessment")}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4 }}>
      <Box mb={3} display="flex" flexDirection="column" alignItems="center">
        <DimensionIcon
          name={dimension.name}
          className="w-16 h-16 mb-2 text-primary"
        />
        <Typography variant="h4" component="h1" sx={{ color: "primary.main" }}>
          {dimension.name} {t("answerDimensionAssessment.assessmentSuffix")}
        </Typography>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

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

      {showResult && gapId && submittedData && (
        <GapDescriptionDisplay
          gapId={gapId}
          currentLevel={submittedData.currentLevel}
          desiredLevel={submittedData.desiredLevel}
          currentLevelDescription={submittedData.currentLevelDescription || ""}
          desiredLevelDescription={submittedData.desiredLevelDescription || ""}
        />
      )}

      {showResult && (
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinue}
            data-testid="continue-button"
          >
            {isLastDimension
              ? t("answerDimensionAssessment.finishAssessment")
              : t("answerDimensionAssessment.continueToNextAssessment")}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default AnswerDimensionAssessmentPage;
