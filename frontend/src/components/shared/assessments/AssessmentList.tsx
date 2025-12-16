import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Assessment } from "../../../types/assessment";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ClipboardList, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { EditAssessmentForm } from "./EditAssessmentForm";
import { useDeleteAssessment } from "../../../hooks/assessments/useDeleteAssessment";
import { useUpdateAssessment } from "../../../hooks/assessments/useUpdateAssessment";
import { useDimensions } from "../../../hooks/dimensions/useDimensions";

import { ROLES } from "@/constants/roles";

interface AssessmentListProps {
  assessments: Assessment[];
  userRoles: string[];
}

/**
 * Card-based list of draft assessments with actions to answer, edit and delete.
 */
export function AssessmentList({
  assessments,
  userRoles,
}: AssessmentListProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const { mutate: deleteAssessment } = useDeleteAssessment();
  const { mutate: updateAssessment } = useUpdateAssessment();
  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleEdit = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setEditDialogOpen(true);
  };

  const handleDelete = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAssessment) {
      deleteAssessment(selectedAssessment.id);
      setDeleteDialogOpen(false);
      setSelectedAssessment(null);
    }
  };

  const handleAnswer = (id: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/assessment/${id}`);
  };

  const canEditOrDelete =
    !userRoles.includes(ROLES.COOP_ADMIN.toLowerCase()) &&
    !userRoles.includes(ROLES.COOP_USER.toLowerCase());

  return (
    <div className="space-y-4">
      {assessments
        .filter((assessment) => assessment.syncStatus !== "deleted")
        .map((assessment) => (
          <div
            key={assessment.id}
            className="flex items-center justify-between gap-6 rounded-xl border border-border bg-gradient-to-r from-card to-card/60 px-6 py-5 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {assessment.name}
                  </h3>
                  {/* TODO: replace with real dates when available */}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Draft assessment
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isLoadingDimensions ? (
                    <Badge variant="outline">Loading dimensions…</Badge>
                  ) : (
                    assessment.dimensionIds?.map((id) => {
                      const dimension = dimensions?.find((d) => d.id === id);
                      if (!dimension) return null;
                      return (
                        <Badge
                          key={id}
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-800"
                        >
                          {dimension.name}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                size="sm"
                onClick={() => handleAnswer(assessment.id)}
                className="min-w-[96px]"
              >
                Answer
              </Button>
              {canEditOrDelete && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(assessment)}
                    className="text-blue-600 hover:text-blue-700"
                    aria-label="Edit assessment"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(assessment)}
                    className="text-red-600 hover:text-red-700"
                    aria-label="Delete assessment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The assessment and its configuration
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
