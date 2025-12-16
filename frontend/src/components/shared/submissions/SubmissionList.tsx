import { useState } from "react";
import { AssessmentSummary } from "@/types/assessment";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Leaf, Trash2 } from "lucide-react";
import { useDeleteAssessment } from "@/hooks/assessments/useDeleteAssessment";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SubmissionListProps {
  submissions: AssessmentSummary[];
  limit?: number;
  basePath: string;
  showOrganization?: boolean;
  onSubmissionSelect?: (submissionId: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "reviewed":
      return "success";
    case "under review":
      return "warning";
    case "draft":
      return "outline";
    case "completed":
      return "default";
    default:
      return "secondary";
  }
};

interface SubmissionItemData {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  status: string;
  overall_score: number | null;
  gaps_count: number;
}

export const SubmissionList = ({
  submissions,
  limit,
  basePath,
  showOrganization = false,
  onSubmissionSelect,
}: SubmissionListProps) => {
  const { user } = useAuth();
  const deleteAssessment = useDeleteAssessment();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<AssessmentSummary | null>(null);

  const userRoles = (user?.roles || []).map((role) => role.toLowerCase());
  const canDelete =
    userRoles.includes(ROLES.ORG_ADMIN.toLowerCase()) ||
    userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());

  const items = limit ? submissions.slice(0, limit) : submissions;

  const handleSubmissionClick = (submissionId: string) => {
    if (onSubmissionSelect) {
      onSubmissionSelect(submissionId);
    }
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    submission: AssessmentSummary,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (submissionToDelete?.assessment?.assessment_id) {
      deleteAssessment.mutate(submissionToDelete.assessment.assessment_id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSubmissionToDelete(null);
        },
      });
    }
  };

  // Transform AssessmentSummary to the format expected by the list item
  const getSubmissionData = (
    submission: AssessmentSummary,
  ): SubmissionItemData | null => {
    if (!submission || !submission.assessment) {
      console.warn("Invalid submission data:", submission);
      return null;
    }

    return {
      id: submission.assessment.assessment_id || "unknown-id",
      name: submission.assessment.document_title || "Unnamed Assessment",
      organization_id: submission.assessment.organization_id || "",
      created_at: submission.assessment.created_at || new Date().toISOString(),
      status: submission.assessment.status || "draft",
      overall_score: submission.overall_score ?? null,
      gaps_count: submission.gaps_count ?? 0,
    };
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No submissions found</p>
      </div>
    );
  }

  // Filter out any invalid submissions
  const validItems = items
    .map((submission) => ({
      submission,
      data: getSubmissionData(submission),
    }))
    .filter((item) => item.data !== null) as Array<{
    submission: AssessmentSummary;
    data: SubmissionItemData;
  }>;

  if (validItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No valid submissions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {validItems.map(({ submission, data: submissionData }) =>
        onSubmissionSelect ? (
          <button
            key={submissionData.id}
            onClick={() => handleSubmissionClick(submissionData.id)}
            className="w-full text-left border rounded-xl p-4 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-primary/10 rounded-full mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {submissionData.name}
                    </h3>
                    <Badge
                      variant={getStatusVariant(submissionData.status)}
                      className="text-xs font-medium px-2 py-0.5"
                    >
                      {submissionData.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Submitted on{" "}
                    {new Date(submissionData.created_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>

                  <div className="pt-2 flex items-center space-x-6 text-sm">
                    {submissionData.overall_score !== null && (
                      <div className="flex items-center">
                        <span className="font-semibold text-foreground">
                          {submissionData.overall_score.toFixed(1)}%
                        </span>
                        <span className="ml-1.5 text-muted-foreground">
                          overall score
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center">
                View details
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </button>
        ) : (
          <div
            key={submissionData.id}
            className="border rounded-xl p-4 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group bg-card"
          >
            <Link
              to={`${basePath}/submissions/${submissionData.id}`}
              className="block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-primary/10 rounded-full mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {submissionData.name}
                      </h3>
                      <Badge
                        variant={getStatusVariant(submissionData.status)}
                        className="text-xs font-medium px-2 py-0.5"
                      >
                        {submissionData.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Submitted on{" "}
                      {new Date(submissionData.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>

                    <div className="pt-2 flex items-center space-x-6 text-sm">
                      {submissionData.overall_score !== null && (
                        <div className="flex items-center">
                          <span className="font-semibold text-foreground">
                            {submissionData.overall_score.toFixed(1)}%
                          </span>
                          <span className="ml-1.5 text-muted-foreground">
                            overall score
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(e, submission);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                      aria-label="Delete submission"
                      title="Delete submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center">
                    View details
                    <span className="ml-1 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ),
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {submissionToDelete?.assessment?.document_title ||
                  "this submission"}
              </span>
              ? This action cannot be undone and will permanently remove the
              submission and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssessment.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
