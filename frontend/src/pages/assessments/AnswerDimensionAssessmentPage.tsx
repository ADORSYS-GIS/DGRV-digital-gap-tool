import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// Core React and routing
// Material-UI components
import { DimensionAssessmentAnswer } from "@/components/assessment/answering/DimensionAssessmentAnswer";
import { DimensionIcon } from "@/components/shared/DimensionIcon";
import { useDimensionWithStates } from "@/hooks/assessments/useDimensionWithStates";
import { useSubmitDimensionAssessment } from "@/hooks/assessments/useSubmitDimensionAssessment";
import { IDimensionState, IDimensionWithStates } from "@/types/dimension";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const dimensionStates = useMemo<IDimensionState[]>(() => {
    return dimension?.states || [];
  }, [dimension]);

  const { mutateAsync: submitAssessment } = useSubmitDimensionAssessment();

  const handleSuccess = () => {
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

        const payload = {
          assessmentId,
          dimensionId,
          currentStateId: currentState.id,
          desiredStateId: desiredState.id,
          gapScore: desiredLevel - currentLevel,
          currentLevel,
          desiredLevel,
        };

        await submitAssessment(payload, {
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
    [assessmentId, dimensionId, submitAssessment, dimension],
  );

  const handleEdit = useCallback(() => {
    setShowResult(false);
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    if (fromAssessmentDetail) {
      navigate(-1);
    } else if (assessmentId) {
      navigate(`/assessments/${assessmentId}`);
    } else {
      navigate("/assessments");
    }
  }, [navigate, fromAssessmentDetail, assessmentId]);

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
          Failed to load dimension details.{" "}
          {dimensionError?.message || "Please try again later."}
        </Box>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          Back to Assessment
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
          {dimension.name} Assessment
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
      />

      {showResult && dimension.currentState && dimension.desiredState && (
        <Box
          sx={{
            p: 3,
            mt: 3,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Assessment Submitted Successfully
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle1">
              Current Level: {dimension.currentState.level}
            </Typography>
            <Typography variant="subtitle1">
              Desired Level: {dimension.desiredState.level}
            </Typography>
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              disabled={isSubmitting}
            >
              Edit Assessment
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AnswerDimensionAssessmentPage;
