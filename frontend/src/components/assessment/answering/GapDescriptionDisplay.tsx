import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDigitalisationGap } from "@/hooks/digitalisationGaps/useDigitalisationGap";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GapDescriptionDisplayProps {
  gapId: string;
  currentLevel: number;
  desiredLevel: number;
  currentLevelDescription?: string;
  desiredLevelDescription?: string;
}

export const GapDescriptionDisplay: React.FC<GapDescriptionDisplayProps> = ({
  gapId,
  currentLevel,
  desiredLevel,
  currentLevelDescription,
  desiredLevelDescription,
}) => {
  const { data: gap, isLoading, error } = useDigitalisationGap(gapId);
  const { t } = useTranslation();

  const renderGapContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">
            {t("assessment.answering.analyzingGap", {
              defaultValue: "Analyzing your gap...",
            })}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-start space-x-2 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold">
              {t("assessment.answering.error", { defaultValue: "Error" })}
            </h5>
            <p>
              {error.message ||
                t("assessment.answering.failedToLoadGap", {
                  defaultValue: "Failed to load gap description.",
                })}
            </p>
          </div>
        </div>
      );
    }

    if (!gap) {
      return (
        <p>
          {t("assessment.answering.noGapFound", {
            defaultValue: "No gap description found.",
          })}
        </p>
      );
    }

    return <p className="text-muted-foreground">{gap.scope}</p>;
  };

  return (
    <Card className="mt-6 w-full max-w-3xl mx-auto border-t-4 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-bold">
          {t("assessment.answering.analysisTitle", {
            defaultValue: "Assessment Analysis",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">
                {t("assessment.answering.currentLevelTitle", {
                  defaultValue: "Your Current Level",
                })}
              </CardTitle>
              <p className="text-5xl font-bold text-primary">{currentLevel}</p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground h-12">
                {currentLevelDescription}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-800">
                {t("assessment.answering.desiredLevelTitle", {
                  defaultValue: "Your Desired Level",
                })}
              </CardTitle>
              <p className="text-5xl font-bold text-green-600">
                {desiredLevel}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground h-12">
                {desiredLevelDescription}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">
            {t("assessment.answering.digitalisationGapAnalysis", {
              defaultValue: "Digitalisation Gap Analysis",
            })}
          </h3>
          {renderGapContent()}
        </div>
      </CardContent>
    </Card>
  );
};
