import {
  getAssessmentSummary,
  listAssessments,
} from "@/openapi-client/services.gen";
import { AssessmentResponse } from "@/openapi-client/types.gen";
import { db } from "@/services/db";
import { SyncManager } from "@/services/syncManager";
import {
  Assessment,
  AssessmentSummary,
  AssessmentSummaryData,
} from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

const syncManager = new SyncManager<AssessmentSummary, AssessmentSummaryData>(
  db.submissions,
);
const assessmentsSyncManager = new SyncManager<Assessment, AssessmentResponse>(
  db.assessments,
);

export const submissionRepository = {
  async getSubmissions(): Promise<Assessment[]> {
    await assessmentsSyncManager.syncWithServer(
      async () => {
        const response = await listAssessments();
        return response.data?.items || [];
      },
      (assessment: AssessmentResponse) => ({
        id: assessment.assessment_id,
        name: assessment.document_title,
        syncStatus: SyncStatus.SYNCED,
        created_at: assessment.created_at,
        dimensionIds: assessment.dimensions_id as string[],
        status: assessment.status,
      }),
    );
    return await db.assessments.toArray();
  },

  async getSubmissionSummary(
    assessmentId: string,
  ): Promise<AssessmentSummary | undefined> {
    await syncManager.syncWithServer(
      async () => {
        const response = await getAssessmentSummary({ id: assessmentId });
        return response.data ? [response.data as AssessmentSummaryData] : [];
      },
      (summary: AssessmentSummaryData) => ({
        ...summary,
        id: summary.assessment.assessment_id,
        syncStatus: SyncStatus.SYNCED,
      }),
    );
    return await db.submissions.get(assessmentId);
  },
};
