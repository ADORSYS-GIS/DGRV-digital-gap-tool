import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { useDimensionWithStates } from "@/hooks/assessments/useDimensionWithStates";
import { useDigitalisationGap } from "@/hooks/digitalisationGaps/useDigitalisationGap";
import { IDimensionState } from "@/types/dimension";
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
        <div
          className={`p-4 rounded-lg ${
            currentState &&
            desiredState &&
            currentState.level < desiredState.level
              ? "bg-red-100"
              : "bg-green-100"
          }`}
        >
          <p className="font-semibold text-gray-600 mb-1">Your Current Level</p>
          <p className="text-2xl font-bold">{currentState?.level}</p>
          <p className="text-gray-800">{currentState?.description || "N/A"}</p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            currentState &&
            desiredState &&
            currentState.level > desiredState.level
              ? "bg-red-100"
              : "bg-green-100"
          }`}
        >
          <p className="font-semibold text-gray-600 mb-1">Your Desired Level</p>
          <p className="text-2xl font-bold">{desiredState?.level}</p>
          <p className="text-gray-800">{desiredState?.description || "N/A"}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {gap && (
          <div>
            <p className="font-semibold text-gray-600 mb-1">Risk Level</p>
            <Badge
              className={`text-sm font-semibold ${
                gap.gap_severity === "HIGH"
                  ? "bg-red-500 text-white"
                  : gap.gap_severity === "MEDIUM"
                    ? "bg-yellow-500 text-black"
                    : "bg-green-500 text-white"
              }`}
            >
              {gap.gap_severity}
            </Badge>
          </div>
        )}
        {gap && (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start">
              <Lightbulb className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-blue-800">Gap Description</p>
                <p className="text-gray-700 mt-1">{gap.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
