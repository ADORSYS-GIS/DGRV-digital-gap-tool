import {
  getAssessmentSummary,
  listSubmissionsByCooperation,
  listSubmissionsByOrganization,
} from "@/openapi-client";
import {
  type ApiResponseAssessmentSummaryResponse,
  type AssessmentResponse,
  type ApiResponseAssessmentsResponse,
} from "@/openapi-client/types.gen";
import { db } from "@/services/db";
import type {
  AssessmentDetails,
  AssessmentSummary,
  DimensionAssessmentSummary,
} from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

// Helper function to map API response to AssessmentSummary
const mapApiResponseToAssessmentSummary = (
  response: ApiResponseAssessmentSummaryResponse | null,
): AssessmentSummary | null => {
  if (!response?.data || !response.data.assessment) return null;

  const {
    assessment,
    dimension_assessments = [],
    gaps_count = 0,
    recommendations_count = 0,
    overall_score = null,
  } = response.data;

  const assessmentDetails: AssessmentDetails = {
    assessment_id: assessment?.assessment_id ?? "",
    document_title: assessment?.document_title || "Untitled Assessment",
    status: assessment?.status || "draft",
    organization_id: assessment?.organization_id ?? "",
    cooperation_id: assessment?.cooperation_id ?? null,
    started_at: assessment?.started_at ?? null,
    completed_at: assessment?.completed_at ?? null,
    created_at: assessment?.created_at ?? "",
    updated_at: assessment?.updated_at ?? "",
    dimensions_id: Array.isArray(assessment?.dimensions_id)
      ? assessment?.dimensions_id
      : assessment?.dimensions_id
        ? ([assessment.dimensions_id] as string[])
        : [],
  };

  // Map dimension assessments to the expected format
  const mappedDimensionAssessments: DimensionAssessmentSummary[] =
    dimension_assessments.map((da) => ({
      dimension_assessment_id: da.dimension_assessment_id,
      assessment_id: da.assessment_id,
      dimension_id: da.dimension_id,
      current_state_id: da.current_state_id,
      desired_state_id: da.desired_state_id,
      gap_score: da.gap_score,
      gap_id: da.gap_id,
      created_at: da.created_at,
      updated_at: da.updated_at,
    }));

  return {
    id: assessment.assessment_id,
    assessment: assessmentDetails,
    dimension_assessments: mappedDimensionAssessments,
    gaps_count,
    recommendations_count,
    overall_score: overall_score ?? null,
    syncStatus: SyncStatus.SYNCED,
    lastError: "",
  };
};

export const submissionRepository = {
  // Get all submissions from local database (for offline use)
  getAll: async (): Promise<AssessmentSummary[]> => {
    return db.submissions.toArray();
  },

  // Get a specific submission by ID
  getById: async (id: string): Promise<AssessmentSummary | undefined> => {
    // First try to get from local database
    let localSubmission = await db.submissions.get(id);

    try {
      // If online, try to fetch from server to ensure we have the latest data
      if (navigator.onLine) {
        const response = await getAssessmentSummary({ id });
        const syncedSubmission = mapApiResponseToAssessmentSummary(response);

        if (syncedSubmission) {
          await db.submissions.put(syncedSubmission);
          localSubmission = syncedSubmission;
        }
      }
    } catch (error) {
      console.error(`Failed to sync submission ${id} from backend:`, error);
    }

    return localSubmission;
  },

  // List all submissions for an organization
  listByOrganization: async (
    organizationId: string,
  ): Promise<AssessmentSummary[]> => {
    try {
      // Try to fetch from server first
      const listResponse = (await listSubmissionsByOrganization({
        organizationId,
      })) as unknown as ApiResponseAssessmentsResponse; // Assuming actual API returns this structure

      if (listResponse?.data?.assessments && Array.isArray(listResponse.data.assessments)) {
        const submissions = await Promise.all(
          listResponse.data.assessments.map(async (assessmentItem: AssessmentResponse) => {
            try {
              const summaryResponse = await getAssessmentSummary({ id: assessmentItem.assessment_id });
              const submission = mapApiResponseToAssessmentSummary(summaryResponse);
              return submission;
            } catch (summaryError) {
              console.error(
                `Error fetching summary for assessment ${assessmentItem.assessment_id}:`,
                summaryError,
              );
              return null;
            }
          }),
        );

        const validSubmissions = submissions.filter((s): s is AssessmentSummary => s !== null);

        for (const submission of validSubmissions) {
          await db.submissions.put(submission);
        }
        return validSubmissions;

      }
    } catch (error) {
      console.error(
        `Error fetching submissions for organization ${organizationId}:`,
        error,
      );
    }

    // Fall back to local data
    return db.submissions
      .where("assessment.organization_id")
      .equals(organizationId)
      .toArray();
  },

  // List all submissions for a cooperation
  listByCooperation: async (
    cooperationId: string,
  ): Promise<AssessmentSummary[]> => {
    try {
      // Try to fetch from server first
      try {
        const listResponse = (await listSubmissionsByCooperation({
          cooperationId,
        })) as unknown as ApiResponseAssessmentsResponse; // Assuming actual API returns this structure

        if (listResponse?.data?.assessments && Array.isArray(listResponse.data.assessments)) {
          const submissions = await Promise.all(
            listResponse.data.assessments.map(async (assessmentItem: AssessmentResponse) => {
              try {
                const summaryResponse = await getAssessmentSummary({ id: assessmentItem.assessment_id });
                const submission = mapApiResponseToAssessmentSummary(summaryResponse);
                return submission;
              } catch (summaryError) {
                console.error(
                  `Error fetching summary for assessment ${assessmentItem.assessment_id}:`,
                  summaryError,
                );
                return null;
              }
            }),
          );

          const validSubmissions = submissions.filter((s): s is AssessmentSummary => s !== null);

          for (const submission of validSubmissions) {
            await db.submissions.put(submission);
          }
          return validSubmissions;
        }
      } catch (apiError) {
        console.warn(
          `Primary submissions endpoint failed, trying alternative endpoint for cooperation ${cooperationId}:`,
          apiError,
        );

        // Fall back to listAssessmentsByCooperation if available
        const { listAssessmentsByCooperation } = await import(
          "@/openapi-client"
        );
        const assessmentsResponse = await listAssessmentsByCooperation({
          cooperationId,
        });

        if (assessmentsResponse?.data?.assessments) {
          // Map assessments to submissions format
          const submissions = await Promise.all(
            assessmentsResponse.data.assessments.map(async (assessment) => {
              try {
                const submission =
                  await submissionRepository.getSubmissionSummary(
                    assessment.assessment_id,
                  );
                return submission || null;
              } catch (error) {
                console.error(
                  `Error fetching submission for assessment ${assessment.assessment_id}:`,
                  error,
                );
                return null;
              }
            }),
          );

          return submissions.filter((s): s is AssessmentSummary => s !== null);
        }
      }
    } catch (error) {
      console.error(
        `Error fetching submissions for cooperation ${cooperationId}:`,
        error,
      );
    }

    // Fall back to local data with error handling for IndexedDB
    try {
      return await db.submissions
        .filter(
          (submission: AssessmentSummary) =>
            submission.assessment.cooperation_id === cooperationId,
        )
        .toArray();
    } catch (dbError) {
      console.error("Error querying local submissions:", dbError);
      return [];
    }
  },

  // Get all submissions (for backward compatibility)
  async getSubmissions(): Promise<AssessmentSummary[]> {
    return await db.submissions.toArray();
  },

  // Get a submission summary by ID
  async getSubmissionSummary(
    assessmentId: string,
  ): Promise<AssessmentSummary | undefined> {
    try {
      // First try to get from local database
      const submission = await db.submissions.get(assessmentId);

      // If online, try to sync with server
      if (navigator.onLine) {
        const response = await getAssessmentSummary({ id: assessmentId });
        if (response?.data) {
          const syncedSubmission = mapApiResponseToAssessmentSummary(response);
          if (syncedSubmission) {
            await db.submissions.put(syncedSubmission);
            return syncedSubmission;
          }
        }
      }

      return submission;
    } catch (error) {
      console.error(
        `Error getting submission summary for ${assessmentId}:`,
        error,
      );
      return db.submissions.get(assessmentId);
    }
  },

  // Get a submission summary by organization
  async getSubmissionSummaryByOrganization(
    assessmentId: string,
    organizationId: string,
  ): Promise<AssessmentSummary | undefined> {
    console.log(
      `[submissionRepository] getSubmissionSummaryByOrganization called with assessmentId: ${assessmentId}, organizationId: ${organizationId}`,
    );

    try {
      // First try to get from local database
      const submission = await db.submissions.get(assessmentId);

      // If online, try to sync with server
      if (navigator.onLine) {
        console.log(
          `[submissionRepository] Fetching assessment ${assessmentId} for organization ${organizationId}`,
        );
        const response = await getAssessmentSummary({ id: assessmentId });

        if (response?.data) {
          const syncedSubmission = mapApiResponseToAssessmentSummary(response);
          if (syncedSubmission) {
            // Verify the submission belongs to the organization
            if (
              syncedSubmission.assessment.organization_id === organizationId
            ) {
              await db.submissions.put(syncedSubmission);
              return syncedSubmission;
            } else {
              console.warn(
                `Submission ${assessmentId} does not belong to organization ${organizationId}`,
              );
              return undefined;
            }
          }
        }
      }

      // Return local submission if it exists and belongs to the organization
      if (
        submission &&
        submission.assessment.organization_id === organizationId
      ) {
        return submission;
      }

      return undefined;
    } catch (error) {
      console.error(
        `Error getting submission ${assessmentId} for organization ${organizationId}:`,
        error,
      );
      // Fall back to local data if available
      const localSubmission = await db.submissions.get(assessmentId);
      return localSubmission?.assessment.organization_id === organizationId
        ? localSubmission
        : undefined;
    }
  },

  // Get a submission summary by cooperation
  async getSubmissionSummaryByCooperation(
    assessmentId: string,
    cooperationId: string,
  ): Promise<AssessmentSummary | undefined> {
    console.log(
      `[submissionRepository] getSubmissionSummaryByCooperation called with assessmentId: ${assessmentId}, cooperationId: ${cooperationId}`,
    );

    try {
      // First try to get from local database
      const submission = await db.submissions.get(assessmentId);

      // If online, try to sync with server
      if (navigator.onLine) {
        console.log(
          `[submissionRepository] Fetching assessment ${assessmentId} for cooperation ${cooperationId}`,
        );
        const response = await getAssessmentSummary({ id: assessmentId });

        if (response?.data) {
          const syncedSubmission = mapApiResponseToAssessmentSummary(response);
          if (syncedSubmission) {
            // Verify the submission belongs to the cooperation
            if (syncedSubmission.assessment.cooperation_id === cooperationId) {
              await db.submissions.put(syncedSubmission);
              return syncedSubmission;
            } else {
              console.warn(
                `Submission ${assessmentId} does not belong to cooperation ${cooperationId}`,
              );
              return undefined;
            }
          }
        }
      }

      // Return local submission if it exists and belongs to the cooperation
      if (
        submission &&
        submission.assessment.cooperation_id === cooperationId
      ) {
        return submission;
      }

      return undefined;
    } catch (error) {
      console.error(
        `Error getting submission ${assessmentId} for cooperation ${cooperationId}:`,
        error,
      );
      // Fall back to local data if available
      const localSubmission = await db.submissions.get(assessmentId);
      return localSubmission?.assessment.cooperation_id === cooperationId
        ? localSubmission
        : undefined;
    }
  },
};
