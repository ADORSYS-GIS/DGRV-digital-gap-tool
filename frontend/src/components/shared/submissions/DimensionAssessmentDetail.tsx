import { useDimensionWithStates } from "@/hooks/assessments/useDimensionWithStates";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { IDimensionState } from "@/types/dimension";
import { useDigitalisationGap } from "@/hooks/digitalisationGaps/useDigitalisationGap";
import { Lightbulb } from "lucide-react";

interface DimensionAssessmentDetailProps {
  dimensionId: string;
  currentStateId: string;
  desiredStateId: string;
  gapScore: number;
  gapId: string | null;
}

export const DimensionAssessmentDetail = ({
  dimensionId,
  currentStateId,
  desiredStateId,
  gapScore,
  gapId,
}: DimensionAssessmentDetailProps) => {
  const {
    data: dimensionWithStates,
    isLoading: isLoadingDimension,
    error: dimensionError,
  } = useDimensionWithStates(dimensionId);

  const {
    data: gap,
    isLoading: isLoadingGap,
    error: gapError,
  } = useDigitalisationGap(gapId!);

  const isLoading = isLoadingDimension || isLoadingGap;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (dimensionError || gapError) {
    return (
      <p className="p-4 text-red-500">
        Could not load details for dimension {dimensionId}.
      </p>
    );
  }

  if (!dimensionWithStates) {
    return null;
  }

  const allStates: IDimensionState[] = [
    ...(dimensionWithStates.current_states || []),
    ...(dimensionWithStates.desired_states || []),
  ];

  const currentState = allStates.find((s) => s.id === currentStateId);
  const desiredState = allStates.find((s) => s.id === desiredStateId);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold text-gray-600 mb-1">Current State</p>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
            {currentState?.description || "N/A"}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-600 mb-1">Desired State</p>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
            {desiredState?.description || "N/A"}
          </p>
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-600 mb-1">Gap Score</p>
        <p className="text-2xl font-bold text-blue-600">{gapScore}</p>
      </div>
      {gap && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-start">
            <Lightbulb className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-blue-800">Gap Description</p>
              <p className="text-gray-700 mt-1">{gap.scope}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
