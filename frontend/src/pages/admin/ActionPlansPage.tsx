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
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Admin Action Plans
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Oversee and manage action plans across all organizations.
          </p>
        </div>
      </div>

      {!selectedOrganizationId ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Select an Organization
            </h2>
          </div>
          {isLoadingOrganizations ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <OrganizationList
              organizations={organizations || []}
              onOrganizationSelect={handleOrganizationSelect}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedOrganizationId(null)}
                className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
              >
                ← Back to Organizations
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                Select a Submission
              </h2>
            </div>
          </div>

          {isLoadingSubmissions ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
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
