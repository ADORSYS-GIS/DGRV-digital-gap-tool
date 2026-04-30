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

    // The backend stores a LANGUAGE-SPECIFIC UUID per current/desired state.
    // A submission answered in Portuguese stores Portuguese state UUIDs, which
    // are never found in an English-only fetch. To reliably resolve the score
    // for any language, we fetch all supported languages in parallel and search
    // across every response until we find the matching UUID.
    const SUPPORTED_LANGS = ["en", "pt", "fr", "ss"];

    import("@/openapi-client/services.gen").then(({ getDimensionWithStates }) => {
      Promise.all(
        SUPPORTED_LANGS.map((l) =>
          getDimensionWithStates({ id: dimensionAssessment.dimension_id, lang: l }).catch(
            () => null,
          ),
        ),
      ).then((responses) => {
        if (!isMounted) return;

        let currentScore: number | undefined;
        let desiredScore: number | undefined;

        for (const res of responses) {
          if (!res?.data) continue;

          if (currentScore === undefined) {
            const match = res.data.current_states?.find(
              (s) => s.current_state_id === dimensionAssessment.current_state_id,
            );
            if (match !== undefined) currentScore = match.score;
          }

          if (desiredScore === undefined) {
            const match = res.data.desired_states?.find(
              (s) => s.desired_state_id === dimensionAssessment.desired_state_id,
            );
            if (match !== undefined) desiredScore = match.score;
          }

          if (currentScore !== undefined && desiredScore !== undefined) break;
        }

        setScores({
          currentScore: currentScore ?? 0,
          desiredScore: desiredScore ?? 0,
        });
      });
    })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsScoresLoading(false);
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

    // Only show Unknown/Loading when the level is genuinely not resolved yet.
    // Do NOT treat score=0 as missing — 0 is a valid score for the lowest level.
    if (!level) {
      return {
        id: fallbackId,
        dimensionId: dimensionKey,
        level: score,
        name: isScoresLoading ? "Loading..." : "Unknown",
        description: isScoresLoading ? "" : "Details not available",
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
          dimensionKey={dimensionKey}
          allDimensionStates={allStates}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
