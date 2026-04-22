import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDigitalisationGap } from "@/hooks/digitalisationGaps/useDigitalisationGap";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Gap } from "@/types/digitalisationGap";

interface GapDescriptionDisplayProps {
  gapId: string;
  currentLevel: number;
  desiredLevel: number;
  currentLevelDescription?: string;
  desiredLevelDescription?: string;
  currentLevelTitle?: string;
  desiredLevelTitle?: string;
}

export const GapDescriptionDisplay: React.FC<GapDescriptionDisplayProps> = ({
  gapId,
  currentLevel,
  desiredLevel,
  currentLevelDescription,
  desiredLevelDescription,
  currentLevelTitle,
  desiredLevelTitle,
}) => {
  const { t } = useTranslation();
  const { data: gap, isLoading, error } = useDigitalisationGap(gapId || "missing-id");

  const renderGapContent = () => {
    if (!gapId || gapId === "missing-id") {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-amber-600 bg-amber-50 rounded-md border border-amber-200">
          <AlertCircle className="h-6 w-6 mb-2" />
          <p className="text-sm font-medium text-center">
            {t("offline.gapAnalysisPending", {
              defaultValue: "The administrator has not finished configuring the system. Please be patient or contact the administrator."
            })}
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">{t("assessmentAnswering.form.analyzing")}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-start space-x-2 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold">{t("adminReports.organizations.errorLoading", { error: "" }).split(":")[0]}</h5>
            <p>{error.message || t("assessmentAnswering.errors.loadGapError")}</p>
          </div>
        </div>
      );
    }

    if (!gap) {
      return <p>{t("assessmentAnswering.errors.noGapFound")}</p>;
    }

    const getSeverityColor = (severity: Gap) => {
      switch (severity) {
        case Gap.HIGH:
          return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
        case Gap.MEDIUM:
          return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
        case Gap.LOW:
          return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-semibold">{t("assessmentAnswering.form.severity")}:</span>
          <Badge
            variant="outline"
            className={`text-sm px-3 py-1 ${getSeverityColor(gap.gap_severity)}`}
          >
            {gap.gap_severity} {t("assessmentAnswering.form.risk")}
          </Badge>
        </div>
        <p className="text-muted-foreground">{gap.description}</p>
      </div>
    );
  };

  return (
    <Card className="mt-6 w-full max-w-3xl mx-auto border-t-4 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-bold">
          {t("assessmentAnswering.form.analysis")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className={`flex flex-col ${currentLevel < desiredLevel ? "bg-red-50" : "bg-green-50"
              }`}
          >
            <CardHeader className="text-center pb-3">
              <CardTitle
                className={`text-lg font-semibold mb-2 ${currentLevel < desiredLevel
                  ? "text-red-800"
                  : "text-green-800"
                  }`}
              >
                {t("assessmentAnswering.dimension.yourCurrent")}
              </CardTitle>
              {currentLevelTitle && (
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  {currentLevelTitle}
                </p>
              )}
              <p
                className={`text-5xl font-bold ${currentLevel < desiredLevel
                  ? "text-red-600"
                  : "text-green-600"
                  }`}
              >
                {currentLevel}
              </p>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
              <p className="text-sm text-muted-foreground break-words leading-relaxed">
                {currentLevelDescription || t("assessmentAnswering.form.noDescription")}
              </p>
            </CardContent>
          </Card>
          <Card
            className={`flex flex-col ${desiredLevel > currentLevel ? "bg-green-50" : "bg-red-50"
              }`}
          >
            <CardHeader className="text-center pb-3">
              <CardTitle
                className={`text-lg font-semibold mb-2 ${desiredLevel > currentLevel
                  ? "text-green-800"
                  : "text-red-800"
                  }`}
              >
                {t("assessmentAnswering.dimension.yourDesired")}
              </CardTitle>
              {desiredLevelTitle && (
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  {desiredLevelTitle}
                </p>
              )}
              <p
                className={`text-5xl font-bold ${desiredLevel > currentLevel
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {desiredLevel}
              </p>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
              <p className="text-sm text-muted-foreground break-words leading-relaxed">
                {desiredLevelDescription || t("assessmentAnswering.form.noDescription")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">
            {t("assessmentAnswering.form.gapAnalysis")}
          </h3>
          {renderGapContent()}
        </div>
      </CardContent>
    </Card>
  );
};
