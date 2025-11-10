import * as React from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import { useDigitalisationLevelsByType } from "@/hooks/digitalisationLevels/useDigitalisationLevelsByType";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Landmark } from "lucide-react";
import { useSaveSubmission } from "@/hooks/submissions/useSaveSubmission";
import { useSubmission } from "@/hooks/submissions/useSubmission";
import { useAddActionItem } from "@/hooks/actionItems/useAddActionItem";
import { Assessment } from "@/types/assessment";

const AnswerDimensionPage: React.FC = () => {
  const { dimensionId } = useParams<{ dimensionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const assessment = location.state?.assessment as Assessment;

  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const { data: gaps, isLoading: isLoadingGaps } = useDigitalisationGaps();
  const { data: currentLevels, isLoading: isLoadingCurrentLevels } =
    useDigitalisationLevelsByType(dimensionId || "", "current");
  const { data: desiredLevels, isLoading: isLoadingDesiredLevels } =
    useDigitalisationLevelsByType(dimensionId || "", "desired");

  const { data: existingSubmission } = useSubmission(
    assessment?.id || "",
    dimensionId || "",
  );
  const { mutate: saveSubmission, isPending: isSaving } = useSaveSubmission();
  const { mutate: addActionItem } = useAddActionItem();

  const [currentLevel, setCurrentLevel] = React.useState<string | undefined>();
  const [desiredLevel, setDesiredLevel] = React.useState<string | undefined>();
  const [comments, setComments] = React.useState("");
  const [gap, setGap] = React.useState<number | null>(null);
  const [gapScore, setGapScore] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!assessment) {
      navigate("/dashboard/answer-assessment", {
        state: { error: "Assessment data is missing. Please select an assessment again." },
        replace: true,
      });
    }
  }, [assessment, navigate]);

  React.useEffect(() => {
    // Reset form state when the dimension changes to prevent stale data
    setCurrentLevel(undefined);
    setDesiredLevel(undefined);
    setComments("");
    setGap(null);
    setGapScore(null);
    setIsSubmitted(false);
  }, [dimensionId]);

  React.useEffect(() => {
    if (existingSubmission) {
      setCurrentLevel(existingSubmission.currentLevel?.toString());
      setDesiredLevel(existingSubmission.toBeLevel?.toString());
      setComments(existingSubmission.comments || "");
      setGap(existingSubmission.gap);
      setGapScore(existingSubmission.gapScore);
      setIsSubmitted(true);
    }
  }, [existingSubmission]);

  const dimension = dimensions?.find((d) => d.id === dimensionId);

  const getGapScore = (gap: number): string => {
    if (gap >= 1 && gap <= 2) return "LOW";
    if (gap === 3) return "MEDIUM";
    if (gap >= 4 && gap <= 5) return "HIGH";
    return "NO GAP";
  };

  const handleSubmit = () => {
    if (currentLevel && desiredLevel && dimensionId && assessment) {
      const calculatedGap = parseInt(desiredLevel) - parseInt(currentLevel);
      const calculatedGapScore = getGapScore(calculatedGap);

      setGap(calculatedGap);
      setGapScore(calculatedGapScore);
      setIsSubmitted(true);

      const submissionData = {
        assessmentId: assessment.id,
        assessmentName: assessment.name,
        dimensionId,
        currentLevel: parseInt(currentLevel),
        toBeLevel: parseInt(desiredLevel),
        gap: calculatedGap,
        gapScore: calculatedGapScore,
        comments,
        recommendations: [],
      };

      saveSubmission(submissionData, {
        onSuccess: () => {
          const relevantGap = gaps?.find(
            (g) => g.category === dimension?.name && g.gap === calculatedGapScore,
          );
          if (relevantGap) {
            addActionItem({
              assessmentId: assessment.id,
              dimensionId,
              recommendation: relevantGap.scope,
            });
          }
        },
      });
    }
  };

  const nextDimension = React.useMemo(() => {
    if (!assessment || !dimensions) return null;
    const currentIndex = assessment.categories.findIndex(
      (category) => dimensions.find((d) => d.name === category)?.id === dimensionId,
    );
    if (currentIndex === -1 || currentIndex === assessment.categories.length - 1) {
      return null;
    }
    const nextCategory = assessment.categories[currentIndex + 1];
    return dimensions.find((d) => d.name === nextCategory);
  }, [assessment, dimensions, dimensionId]);

  if (
    isLoadingDimensions ||
    isLoadingGaps ||
    isLoadingCurrentLevels ||
    isLoadingDesiredLevels
  ) {
    return <LoadingSpinner />;
  }

  if (!dimension) {
    return <div>Dimension not found</div>;
  }

  const relevantGap = gaps?.find(
    (g) => g.category === dimension.name && g.gap === gapScore,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link
            to="/dashboard/answer-assessment"
            state={{ assessment }}
            className="text-blue-600 hover:underline"
          >
            &larr; Back to Assessment Overview
          </Link>
          <div className="text-center mt-4">
            <Landmark className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">{dimension.name}</h1>
            <p className="text-gray-600 mt-2">{dimension.description}</p>
          </div>
        </header>

        <main>
          <Card>
            <CardHeader>
              <CardTitle>Assessment Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="font-semibold">
                  What is your cooperative's current level for {dimension.name}?
                </label>
                <Select
                  onValueChange={setCurrentLevel}
                  value={currentLevel}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select current level (1-5)" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentLevels?.map((level) => (
                      <SelectItem key={level.id} value={level.state.toString()}>
                        Level {level.state} - {level.scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold">
                  What is your desired 'to-be' level for {dimension.name}?
                </label>
                <Select
                  onValueChange={setDesiredLevel}
                  value={desiredLevel}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select desired level (1-5)" />
                  </SelectTrigger>
                  <SelectContent>
                    {desiredLevels?.map((level) => (
                      <SelectItem key={level.id} value={level.state.toString()}>
                        Level {level.state} - {level.scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold">
                  Additional Comments (Optional)
                </label>
                <Textarea
                  placeholder="Share any specific challenges, initiatives, or context about this perspective..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={isSubmitted}
                />
              </div>
              {!isSubmitted ? (
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? "Submitting..." : "Submit"}
                </Button>
              ) : nextDimension ? (
                <Button
                  onClick={() =>
                    navigate(
                      `/dashboard/answer-assessment/${nextDimension.id}`,
                      { state: { assessment } },
                    )
                  }
                >
                  Continue to {nextDimension.name}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    navigate("/dashboard/answer-assessment", {
                      state: { assessment },
                    })
                  }
                >
                  Finish Assessment
                </Button>
              )}
            </CardContent>
          </Card>

          {isSubmitted && gap !== null && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Your Assessment Results</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold">Level {currentLevel}</p>
                  <p className="text-gray-600">Current Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">Level {desiredLevel}</p>
                  <p className="text-gray-600">Desired Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">Gap: {gap}</p>
                  <p className="text-gray-600">
                    {gap > 0 ? "Improvement needed" : "No Gap"}
                  </p>
                </div>
              </CardContent>
              {relevantGap && (
                <CardContent>
                  <h3 className="font-semibold">Recommended Actions:</h3>
                  <p>{relevantGap.scope}</p>
                </CardContent>
              )}
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnswerDimensionPage;