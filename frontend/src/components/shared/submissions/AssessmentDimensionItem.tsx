import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DimensionAssessmentDetail } from "./DimensionAssessmentDetail";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";
import { DimensionAssessmentSummary } from "@/types/assessment";
import { IDimensionState } from "@/types/dimension";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface AssessmentDimensionItemProps {
  dimensionAssessment: DimensionAssessmentSummary;
  dimensionName: string;
  dimensionKey: string;
}

export const AssessmentDimensionItem = ({
  dimensionAssessment,
  dimensionName,
  dimensionKey,
}: AssessmentDimensionItemProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language ?? "en").split("-")[0];

  const [scores, setScores] = useState({ currentScore: 0, desiredScore: 0 });
  const [isScoresLoading, setIsScoresLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    import("@/openapi-client/services.gen").then(({ getDimensionWithStates }) => {
      // Fetch the original states directly without lang parameter to discover their numeric scores
      getDimensionWithStates({ id: dimensionAssessment.dimension_id })
        .then((res) => {
          if (!isMounted) return;
          const currentScore =
            res.data?.current_states?.find(
              (s) => s.current_state_id === dimensionAssessment.current_state_id,
            )?.score || 0;
          const desiredScore =
            res.data?.desired_states?.find(
              (s) => s.desired_state_id === dimensionAssessment.desired_state_id,
            )?.score || 0;
          setScores({ currentScore, desiredScore });
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setIsScoresLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [
    dimensionAssessment.dimension_id,
    dimensionAssessment.current_state_id,
    dimensionAssessment.desired_state_id,
  ]);

  // Fetch localized levels mapping for display
  const { data: levels } = useDigitalisationLevels(dimensionKey, lang);

  const mapScoreToState = (score: number, fallbackId: string): IDimensionState => {
    // Find the localized level with this score
    const level = levels?.find((l) => Number(l.state) === score || Number(l.level) === score);

    if (!level || score === 0) {
      return {
        id: fallbackId,
        dimensionId: dimensionKey,
        level: score,
        name: isScoresLoading ? "Loading..." : "Unknown",
        description: "Details not available",
        createdAt: "",
        updatedAt: "",
      };
    }

    return {
      id: level.id,
      dimensionId: level.dimensionId,
      level: Number(level.state ?? level.level),
      name: level.title,
      description: level.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const currentState = mapScoreToState(
    scores.currentScore,
    dimensionAssessment.current_state_id,
  );
  const desiredState = mapScoreToState(
    scores.desiredScore,
    dimensionAssessment.desired_state_id,
  );

  const allStates: IDimensionState[] = (levels || []).map((l) => ({
    id: l.id,
    dimensionId: l.dimensionId,
    level: Number(l.state ?? l.level),
    name: l.title,
    description: l.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return (
    <AccordionItem
      value={dimensionAssessment.dimension_assessment_id}
      className="border-b border-border/60 last:border-b-0"
    >
      <AccordionTrigger className="px-6 py-4 hover:bg-muted/40 text-left">
        <span className="font-semibold text-foreground">{dimensionName}</span>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <DimensionAssessmentDetail
          assessment={{
            id: dimensionAssessment.dimension_assessment_id,
            dimensionId: dimensionAssessment.dimension_id,
            assessmentId: dimensionAssessment.assessment_id,
            currentState: currentState,
            desiredState: desiredState,
            createdAt: dimensionAssessment.created_at,
            updatedAt: dimensionAssessment.updated_at,
            syncStatus: "SYNCED",
            gap_id: dimensionAssessment.gap_id,
          }}
          allDimensionStates={allStates}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
