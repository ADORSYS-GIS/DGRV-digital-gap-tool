import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "../LoadingSpinner";
import type { AssessmentSummary } from "@/types/assessment";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";

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
  const { user } = useAuth();

  const organizationId = useOrganizationId();
  const cooperationIdFromRoute = useCooperationId();
  const {
    cooperationId: cooperationIdFromPath,
    isLoading: isLoadingCoopFromPath,
    error: coopFromPathError,
  } = useCooperationIdFromPath();

  const effectiveCooperationId =
    cooperationIdFromRoute || cooperationIdFromPath;

  const userRoles = (user?.roles || []).map((role) => role?.toLowerCase());
  const isOrgAdmin = userRoles.includes(ROLES.ORG_ADMIN.toLowerCase());
  const isCoopUser =
    userRoles.includes(ROLES.COOP_USER.toLowerCase()) ||
    userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());

  const {
    data: orgSubmissions = [],
    isLoading: isLoadingOrg,
    error: orgError,
  } = useSubmissionsByOrganization(organizationId || "", {
    enabled: isOpen && isOrgAdmin && !!organizationId,
    status: ["Completed"],
  });

  const {
    data: coopSubmissions = [],
    isLoading: isLoadingCoop,
    error: coopError,
  } = useSubmissionsByCooperation(effectiveCooperationId || "", {
    enabled: isOpen && isCoopUser && !!effectiveCooperationId,
  });

  const isLoading =
    (isOrgAdmin ? isLoadingOrg : isCoopUser ? isLoadingCoop : false) ||
    isLoadingCoopFromPath;

  const error = isOrgAdmin
    ? orgError
    : isCoopUser
      ? coopError || coopFromPathError
      : null;

  const submissions: AssessmentSummary[] = isOrgAdmin
    ? orgSubmissions
    : isCoopUser
      ? coopSubmissions
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a submission</DialogTitle>
          <DialogDescription>
            Choose a submitted assessment to export a report for.
          </DialogDescription>
        </DialogHeader>
        <div>
          {isLoading && <LoadingSpinner />}
          {error && (
            <p className="text-sm text-destructive">
              Failed to load submissions:{" "}
              {String((error as Error)?.message || "Unknown error")}
            </p>
          )}
          {!isLoading && !error && submissions.length > 0 ? (
            <div className="space-y-2">
              {submissions.map((submission) => (
                <button
                  key={submission.assessment.assessment_id}
                  type="button"
                  onClick={() => onSelect(submission.assessment.assessment_id)}
                  className="w-full cursor-pointer rounded-lg border p-4 text-left transition-colors hover:bg-accent"
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
                </button>
              ))}
            </div>
          ) : null}

          {!isLoading && !error && submissions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No submissions found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
