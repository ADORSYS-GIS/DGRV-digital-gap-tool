import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Assessment } from "../../../types/assessment";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { EditAssessmentForm } from "./EditAssessmentForm";
import { useDeleteAssessment } from "../../../hooks/assessments/useDeleteAssessment";
import { useUpdateAssessment } from "../../../hooks/assessments/useUpdateAssessment";
import { useDimensions } from "../../../hooks/dimensions/useDimensions";

interface AssessmentListProps {
  assessments: Assessment[];
}

export function AssessmentList({ assessments }: AssessmentListProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(
    null,
  );
  const { mutate: deleteAssessment } = useDeleteAssessment();
  const { mutate: updateAssessment } = useUpdateAssessment();
  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const navigate = useNavigate();

  const handleEdit = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAssessment(id);
  };

  const handleAnswer = (id: string) => {
    navigate(`/second-admin/assessment/${id}`);
  };

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{assessment.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>11/5/2025</span>
                <span className="mx-2">|</span>
                <span>11:14:15 AM</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {isLoadingDimensions ? (
                  <Badge variant="outline">Loading dimensions...</Badge>
                ) : (
                  assessment.dimensionIds?.map((id) => {
                    const dimension = dimensions?.find((d) => d.id === id);
                    if (!dimension) return null;
                    return (
                      <Badge
                        key={id}
                        variant="default"
                        className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                      >
                        {dimension.name}
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => handleAnswer(assessment.id)}>Answer</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(assessment)}
            >
              <Edit className="h-5 w-5 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(assessment.id)}
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      {selectedAssessment && (
        <EditAssessmentForm
          isOpen={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          assessment={selectedAssessment}
        />
      )}
    </div>
  );
}