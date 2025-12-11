import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { LoadingSpinner } from "../LoadingSpinner";
import type { AssessmentSummaryResponse } from "@/openapi-client";

interface SelectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assessmentId: string) => void;
}

export const SelectSubmissionModal: React.FC<SelectSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const organizationId = useOrganizationId();
  const {
    data: submissions,
    isLoading,
    error,
  } = useSubmissionsByOrganization(organizationId || "", {
    enabled: !!organizationId && isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Submission</DialogTitle>
          <DialogDescription>
            Choose a submitted assessment to export a report for.
          </DialogDescription>
        </DialogHeader>
        <div>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-red-500">
              Failed to load submissions: {error.message}
            </p>
          )}
          {submissions && submissions.length > 0 ? (
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.assessment.assessment_id}
                  onClick={() => onSelect(submission.assessment.assessment_id)}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <p className="font-semibold">
                    {submission.assessment.document_title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on:{" "}
                    {submission.assessment.completed_at
                      ? new Date(
                          submission.assessment.completed_at,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && <p>No submissions found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
