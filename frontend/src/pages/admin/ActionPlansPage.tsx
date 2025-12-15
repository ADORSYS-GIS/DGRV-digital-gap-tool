import React, { useState } from "react";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { useSubmissionsByOrganization } from "@/hooks/submissions/useSubmissionsByOrganization";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { OrganizationList } from "@/components/admin/organizations/OrganizationList";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { KanbanBoard } from "@/components/shared/action_plans/KanbanBoard";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

const ActionPlansPage: React.FC = () => {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssessmentSummary | null>(null);

  const { data: organizations, isLoading: isLoadingOrganizations } =
    useOrganizations();
  const { data: submissionsData, isLoading: isLoadingSubmissions } =
    useSubmissionsByOrganization(selectedOrganizationId || "", {
      enabled: !!selectedOrganizationId,
    });

  const submissions: AssessmentSummary[] = (submissionsData || []).map((s) => ({
    ...s,
    id: s.assessment.assessment_id,
    syncStatus: SyncStatus.SYNCED,
    assessment: {
      ...s.assessment,
      started_at: s.assessment.started_at || null,
      completed_at: s.assessment.completed_at || null,
      dimensions_id: s.assessment.dimensions_id as string[],
    },
    overall_score: s.overall_score ?? null,
  }));

  const handleOrganizationSelect = (organizationId: string) => {
    setSelectedOrganizationId(organizationId);
    setSelectedSubmission(null);
  };

  const handleSubmissionSelect = (submissionId: string) => {
    const submission = submissions.find((s) => s.id === submissionId);
    if (submission) {
      setSelectedSubmission(submission);
    } else {
      console.error(`Submission with ID ${submissionId} not found.`);
    }
  };

  if (selectedSubmission) {
    return <KanbanBoard submissionId={selectedSubmission.id} />;
  }

  return (
    <div className="space-y-6">
      {!selectedOrganizationId ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select an Organization</h2>
          {isLoadingOrganizations ? (
            <LoadingSpinner />
          ) : (
            <OrganizationList
              organizations={organizations || []}
              onOrganizationSelect={handleOrganizationSelect}
            />
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select a Submission</h2>
          {isLoadingSubmissions ? (
            <LoadingSpinner />
          ) : (
            <SubmissionList
              submissions={submissions}
              onSubmissionSelect={handleSubmissionSelect}
              basePath="/admin"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ActionPlansPage;
