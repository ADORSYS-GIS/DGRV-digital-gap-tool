import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Using native alert for now since @/components/ui/alert is not available
import { Loader2, AlertCircle } from "lucide-react";
import { LevelSelector } from "./LevelSelector";
import {
  IDimensionAssessment,
  IDimensionState,
  IDimensionWithStates,
} from "@/types/dimension";
import { cn } from "@/lib/utils";

interface DimensionAssessmentAnswerProps {
  /** The dimension data with its states */
  dimension: IDimensionWithStates;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Callback when the form is submitted with valid data */
  onSubmit: (
    currentLevel: number,
    desiredLevel: number,
    currentStateId: string,
    desiredStateId: string,
  ) => void;
  /** Additional class name for the component */
  className?: string;
  /** Optional error message from parent component */
  error?: string | null;
  /** Optional existing assessment data */
  existingAssessment?: IDimensionAssessment | null;
}

export function DimensionAssessmentAnswer({
  dimension,
  isSubmitting,
  onSubmit,
  className,
  existingAssessment,
}: DimensionAssessmentAnswerProps) {
  const currentAvailableLevels =
    dimension.current_states
      ?.map((s: IDimensionState) => ({
        id: s.id,
        value: s.level,
        name: s.name,
        description: s.description,
      }))
      .sort((a, b) => a.value - b.value) ?? [];
  const desiredAvailableLevels =
    dimension.desired_states
      ?.map((s: IDimensionState) => ({
        id: s.id,
        value: s.level,
        name: s.name,
        description: s.description,
      }))
      .sort((a, b) => a.value - b.value) ?? [];

  const [currentLevel, setCurrentLevel] = useState<number | null>(
    () =>
      existingAssessment?.currentState?.level ??
      currentAvailableLevels[0]?.value ??
      null,
  );
  const [desiredLevel, setDesiredLevel] = useState<number | null>(
    () =>
      existingAssessment?.desiredState?.level ??
      desiredAvailableLevels[0]?.value ??
      null,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  // Use local error state if no error prop is provided
  const error = localError;

  // Update state when existingAssessment changes (e.g., when it loads from API)
  useEffect(() => {
    if (existingAssessment) {
      if (existingAssessment.currentState?.level) {
        setCurrentLevel(existingAssessment.currentState.level);
      }
      if (existingAssessment.desiredState?.level) {
        setDesiredLevel(existingAssessment.desiredState.level);
      }
    }
  }, [existingAssessment]);

  // Reset local error when current/desired level changes
  useEffect(() => {
    setLocalError(null);
  }, [currentLevel, desiredLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (currentLevel === null || desiredLevel === null) {
      setLocalError("Please select both current and desired levels");
      return;
    }

    const currentState = currentAvailableLevels.find(
      (l) => l.value === currentLevel,
    );
    const desiredState = desiredAvailableLevels.find(
      (l) => l.value === desiredLevel,
    );

    if (!currentState || !desiredState) {
      setLocalError("Please select both current and desired levels");
      return;
    }

    try {
      onSubmit(currentLevel, desiredLevel, currentState.id, desiredState.id);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  };

  const isFormValid =
    currentLevel !== null &&
    desiredLevel !== null &&
    currentAvailableLevels.some((l) => l.value === currentLevel) &&
    desiredAvailableLevels.some((l) => l.value === desiredLevel);

  return (
    <Card className={cn("w-full max-w-3xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-2xl">{dimension.name}</CardTitle>
        {dimension.description && (
          <p className="text-muted-foreground">{dimension.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {(dimension.current_states?.length === 0 ||
            dimension.desired_states?.length === 0) && (
            <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                This dimension has not been fully configured with level
                descriptions. Please contact your administrator.
              </div>
            </div>
          )}

          <LevelSelector
            title="Current Level"
            description={
              currentAvailableLevels.find((l) => l.value === currentLevel)
                ?.description ?? "Select your current level for this dimension"
            }
            level={currentLevel}
            onChange={setCurrentLevel}
            availableLevels={currentAvailableLevels}
            disabled={isSubmitting || currentAvailableLevels.length === 0}
          />

          <LevelSelector
            title="Desired Level"
            description={
              desiredAvailableLevels.find((l) => l.value === desiredLevel)
                ?.description ?? "Select your desired level for this dimension"
            }
            level={desiredLevel}
            onChange={setDesiredLevel}
            availableLevels={desiredAvailableLevels}
            disabled={isSubmitting || desiredAvailableLevels.length === 0}
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Assessment"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
