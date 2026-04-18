import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IDimensionAssessment, IDimensionState } from "@/types/dimension";
import { cn } from "@/lib/utils";

import { useTranslation } from "react-i18next";
import { useDigitalisationGap } from "@/hooks/digitalisationGaps/useDigitalisationGap";
import { Loader2 } from "lucide-react";

interface DimensionAssessmentDetailProps {
  assessment: IDimensionAssessment;
  allDimensionStates: IDimensionState[];
}

function getRiskLevel(gapScore: number): {
  level: "LOW" | "MEDIUM" | "HIGH";
  className: string;
} {
  if (gapScore <= 1) {
    return { level: "LOW", className: "bg-green-100 text-green-800 font-medium" };
  }
  if (gapScore <= 3) {
    return { level: "MEDIUM", className: "bg-yellow-100 text-yellow-800 font-medium" };
  }
  return { level: "HIGH", className: "bg-red-100 text-red-800 font-medium" };
}

export function DimensionAssessmentDetail({
  assessment,
  allDimensionStates,
}: DimensionAssessmentDetailProps) {
  const { t } = useTranslation();
  const { currentState, desiredState, gap_id } = assessment;
  const gapScore = desiredState.level - currentState.level;
  const risk = getRiskLevel(gapScore);

  const { data: gap, isLoading: isLoadingGap } = useDigitalisationGap(gap_id || "");

  const allStates: IDimensionState[] = [
    ...allDimensionStates,
    assessment.currentState,
    assessment.desiredState,
  ];

  const currentStateDescription =
    allStates.find((s) => s.id === currentState.id)?.description ??
    t("sharedSubmissions.detail.descriptionNotFound");
  const desiredStateDescription =
    allStates.find((s) => s.id === desiredState.id)?.description ??
    t("sharedSubmissions.detail.descriptionNotFound");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <Card className="bg-red-50/50 border-red-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-900/70 uppercase tracking-wider">
              {t("sharedSubmissions.detail.currentLevel")}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-red-800">{currentState.level}</span>
              <span className="text-sm font-medium text-red-700 bg-red-100/50 px-2 py-0.5 rounded">
                {currentState.name}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-900/80 leading-relaxed font-normal">
              {currentStateDescription}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900/70 uppercase tracking-wider">
              {t("sharedSubmissions.detail.desiredLevel")}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-green-800">{desiredState.level}</span>
              <span className="text-sm font-medium text-green-700 bg-green-100/50 px-2 py-0.5 rounded">
                {desiredState.name}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-900/80 leading-relaxed font-normal">
              {desiredStateDescription}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="px-6 pb-6 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("sharedSubmissions.detail.riskLevel")}
          </h4>
          <Badge variant="outline" className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border-none shadow-sm", risk.className)}>
            {t(`shared.gap_severity.${risk.level}`)}
          </Badge>
        </div>

        {isLoadingGap ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("common.loading")}</span>
          </div>
        ) : gap?.description ? (
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              "{gap.description}"
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground bg-muted/20 rounded p-3 border border-dashed">
            {t("sharedSubmissions.detail.riskLevelDesc")}
          </p>
        )}
      </div>
    </div>
  );
}
