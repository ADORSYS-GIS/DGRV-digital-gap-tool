import * as React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock, Tag, Trash2 } from "lucide-react";
import { Assessment } from "@/types/assessment";
import { Submission } from "@/types/submission";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import { useAddActionItem } from "@/hooks/actionItems/useAddActionItem";
import { useDeleteAssessment } from "@/hooks/assessments/useDeleteAssessment";

interface AssessmentCardProps {
  assessment: Assessment;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
}) => {
  const { data: submissions = [] } = useSubmissions(assessment.id);
  const { data: gaps } = useDigitalisationGaps();
  const addActionItemMutation = useAddActionItem();
  const deleteAssessmentMutation = useDeleteAssessment();

  const handleFinishAssessment = () => {
    submissions.forEach((submission) => {
      const gap =
        gaps?.find((g) => g.gapScore === submission.gapScore)?.scope ||
        "No recommendation found";

      addActionItemMutation.mutate({
        assessmentId: assessment.id,
        dimensionId: submission.dimensionId,
        recommendation: gap,
      });
    });
  };

  const handleDeleteAssessment = () => {
    deleteAssessmentMutation.mutate(assessment.id);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-start space-x-4">
          <FileText className="h-8 w-8 text-gray-400 mt-1" />
          <div>
            <h2 className="text-lg font-bold">{assessment.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
              <div className="flex items-center">
                <Calendar className="mr-1.5 h-4 w-4" />
                <span>{assessment.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1.5 h-4 w-4" />
                <span>{assessment.time}</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Tag className="mr-1.5 h-4 w-4" />
              <span>Assigned categories:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {assessment.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/second-admin/answer-assessment" state={{ assessment }}>
            <Button>Answer</Button>
          </Link>
          <Button
            onClick={handleFinishAssessment}
            disabled={submissions.length < assessment.categories.length}
          >
            Finish Assessment
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={handleDeleteAssessment}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};