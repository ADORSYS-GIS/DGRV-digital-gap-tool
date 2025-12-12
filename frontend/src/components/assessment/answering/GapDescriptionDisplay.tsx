import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDigitalisationGap } from "@/hooks/digitalisationGaps/useDigitalisationGap";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Gap } from "@/types/digitalisationGap";

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

  const renderGapContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Analyzing your gap...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-start space-x-2 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold">Error</h5>
            <p>{error.message || "Failed to load gap description."}</p>
          </div>
        </div>
      );
    }

    if (!gap) {
      return <p>No gap description found.</p>;
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
          <span className="font-semibold">Severity:</span>
          <Badge
            variant="outline"
            className={`text-sm px-3 py-1 ${getSeverityColor(gap.gap_severity)}`}
          >
            {gap.gap_severity} RISK
          </Badge>
        </div>
        <p className="text-muted-foreground">{gap.scope}</p>
      </div>
    );
  };

  return (
    <Card className="mt-6 w-full max-w-3xl mx-auto border-t-4 border-primary shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center font-bold">
          Assessment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">
                Your Current Level
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
                Your Desired Level
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
            Digitalisation Gap Analysis
          </h3>
          {renderGapContent()}
        </div>
      </CardContent>
    </Card>
  );
};
