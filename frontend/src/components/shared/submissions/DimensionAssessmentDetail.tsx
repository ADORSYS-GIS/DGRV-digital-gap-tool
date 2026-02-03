import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IDimensionAssessment, IDimensionState } from "@/types/dimension";
import { cn } from "@/lib/utils";

interface DimensionAssessmentDetailProps {
  assessment: IDimensionAssessment;
  dimensionName: string;
  allDimensionStates: IDimensionState[];
}

function getRiskLevel(gapScore: number): {
  level: "LOW" | "MEDIUM" | "HIGH";
  className: string;
} {
  if (gapScore <= 1) {
    return { level: "LOW", className: "bg-green-100 text-green-800" };
  }
  if (gapScore <= 3) {
    return { level: "MEDIUM", className: "bg-yellow-100 text-yellow-800" };
  }
  return { level: "HIGH", className: "bg-red-100 text-red-800" };
}

export function DimensionAssessmentDetail({
  assessment,
  dimensionName,
  allDimensionStates,
}: DimensionAssessmentDetailProps) {
  const { currentState, desiredState } = assessment;
  const gapScore = desiredState.level - currentState.level;
  const risk = getRiskLevel(gapScore);

  const allStates: IDimensionState[] = [
    ...allDimensionStates,
    assessment.currentState,
    assessment.desiredState,
  ];

  const currentStateDescription =
    allStates.find((s) => s.id === currentState.id)?.description ??
    "Description not found";
  const desiredStateDescription =
    allStates.find((s) => s.id === desiredState.id)?.description ??
    "Description not found";

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={`item-${assessment.id}`}>
        <AccordionTrigger>
          <div className="flex justify-between items-center w-full pr-4">
            <span className="font-semibold text-lg">{dimensionName}</span>
            <Badge
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                risk.className,
              )}
            >
              Gap Score: {gapScore}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle>Your Current Level</CardTitle>
                <CardDescription className="text-red-800 font-bold text-2xl">
                  {currentState.level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {currentStateDescription}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle>Your Desired Level</CardTitle>
                <CardDescription className="text-green-800 font-bold text-2xl">
                  {desiredState.level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {desiredStateDescription}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="px-4 pb-4">
            <h4 className="font-semibold mb-2">Risk Level</h4>
            <Badge
              className={cn(
                "text-sm px-3 py-1 rounded-md",
                risk.className,
              )}
            >
              {risk.level}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              The gap between your current and desired levels is analyzed to
              determine a risk level, indicating the urgency and importance of
              addressing this area.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
