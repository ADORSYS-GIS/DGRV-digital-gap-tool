import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Using native alert for now since @/components/ui/alert is not available
import { Loader2, AlertCircle } from "lucide-react";
import { LevelSelector } from "./LevelSelector";
import {
  IDimensionAssessment,
  IDimensionWithStates,
  IDimensionState,
} from "@/types/dimension";
import { cn } from "@/lib/utils";

interface DimensionAssessmentAnswerProps {
  /** The dimension data with its states */
  dimension: IDimensionWithStates & { states?: IDimensionState[] };
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Callback when the form is submitted with valid data */
  onSubmit: (currentLevel: number, desiredLevel: number) => void;
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
  const [currentLevel, setCurrentLevel] = useState<number>(
    existingAssessment?.currentState?.level ?? 1,
  );
  const [desiredLevel, setDesiredLevel] = useState<number>(
    existingAssessment?.desiredState?.level ?? 1,
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const maxLevel = 5;

  const currentLevelDescription = dimension.current_states?.find(
    (state) => state.level === currentLevel,
  )?.description;

  const desiredLevelDescription = dimension.desired_states?.find(
    (state) => state.level === desiredLevel,
  )?.description;

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

    if (currentLevel === 0 || desiredLevel === 0) {
      setLocalError("Please select both current and desired levels");
      return;
    }

    if (currentLevel === desiredLevel) {
      setLocalError("Current and desired levels cannot be the same");
      return;
    }

    try {
      onSubmit(currentLevel, desiredLevel);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  };

  const isFormValid =
    currentLevel > 0 &&
    desiredLevel > 0 &&
    currentLevel <= maxLevel &&
    desiredLevel <= maxLevel &&
    currentLevel !== desiredLevel &&
    !!currentLevelDescription &&
    !!desiredLevelDescription;

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

          {(!currentLevelDescription || !desiredLevelDescription) && (
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
            description="Select your current level for this dimension"
            level={currentLevel}
            onChange={setCurrentLevel}
            maxLevel={maxLevel}
            disabled={isSubmitting}
            levelDescription={currentLevelDescription}
          />

          <LevelSelector
            title="Desired Level"
            description="Select your desired level for this dimension"
            level={desiredLevel}
            onChange={setDesiredLevel}
            maxLevel={maxLevel}
            disabled={isSubmitting}
            levelDescription={desiredLevelDescription}
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
