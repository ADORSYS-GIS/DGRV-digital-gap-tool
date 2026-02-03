import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { DimensionAssessmentDetail } from "./DimensionAssessmentDetail";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";
import { DimensionAssessmentSummary } from "@/types/assessment";
import { IDimensionState } from "@/types/dimension";

interface AssessmentDimensionItemProps {
    dimensionAssessment: DimensionAssessmentSummary;
    dimensionName: string;
}

export const AssessmentDimensionItem = ({
    dimensionAssessment,
    dimensionName,
}: AssessmentDimensionItemProps) => {
    const { data: levels } = useDigitalisationLevels(
        dimensionAssessment.dimension_id,
    );

    const mapLevelToState = (
        levelId: string,
    ): IDimensionState => {
        const level = levels?.find((l) => l.id === levelId);

        if (!level) {
            return {
                id: levelId,
                dimensionId: dimensionAssessment.dimension_id,
                level: 0,
                name: "Unknown",
                description: "Details not available",
                createdAt: "",
                updatedAt: "",
            };
        }

        return {
            id: level.id,
            dimensionId: level.dimensionId,
            level: level.state,
            name: level.title,
            description: level.description || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    };

    // We can also find by state if ID match fails, but ID match should work if synced safely.
    // However, `dimensionAssessment` has `current_state_id` and `desired_state_id`.
    // `useDigitalisationLevels` returns levels with `id`.

    const currentState = mapLevelToState(dimensionAssessment.current_state_id);
    const desiredState = mapLevelToState(dimensionAssessment.desired_state_id);

    // We need all states for the context in Detail component? 
    // DimensionAssessmentDetail takes `allDimensionStates`. 
    // We can map all `levels` to `IDimensionState`.

    const allStates: IDimensionState[] = (levels || []).map(l => ({
        id: l.id,
        dimensionId: l.dimensionId,
        level: l.state,
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
