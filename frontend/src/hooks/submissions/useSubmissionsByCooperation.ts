import {
  AssessmentResponse,
  AssessmentsResponse,
  AssessmentSummaryResponse,
  listSubmissionsByCooperation,
  listDimensionAssessments,
} from "@/openapi-client";
import { useQuery } from "@tanstack/react-query";

export const useSubmissionsByCooperation = (
  cooperationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<AssessmentSummaryResponse[]>({
    queryKey: ["submissions", "cooperation", cooperationId],
    queryFn: async () => {
      if (!cooperationId) return [];
      
      // Get all submissions for the cooperation
      const response = (await listSubmissionsByCooperation({
        cooperationId,
      })) as unknown as { data: AssessmentsResponse };

      const submissionsData = response.data?.assessments || [];
      
      // Fetch dimension assessments for each submission
      const submissions = await Promise.all(
        submissionsData.map(async (assessment: AssessmentResponse) => {
          try {
            // Get dimension assessments for this submission
            const dimResponse = await listDimensionAssessments({
              assessmentId: assessment.assessment_id,
            });
            
            return {
              assessment,
              dimension_assessments: dimResponse.data?.dimension_assessments || [],
              gaps_count: 0, // This will be calculated based on dimension assessments
              recommendations_count: 0, // This will be calculated based on dimension assessments
              overall_score: null, // This will be calculated based on dimension assessments
            } as AssessmentSummaryResponse;
          } catch (error) {
            console.error(`Error fetching dimension assessments for assessment ${assessment.assessment_id}:`, error);
            return {
              assessment,
              dimension_assessments: [],
              gaps_count: 0,
              recommendations_count: 0,
              overall_score: null,
            } as AssessmentSummaryResponse;
          }
        })
      );

      return submissions;
    },
    enabled: !!cooperationId && options?.enabled !== false,
  });
};
