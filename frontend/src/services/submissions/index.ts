import { submitAssessment as submitAssessmentApi } from '@/openapi-client/services.gen';
import type { SubmitAssessmentData, ReportResponse } from '@/openapi-client/types.gen';

export const submitAssessment = (data: SubmitAssessmentData): Promise<ReportResponse> => {
    return submitAssessmentApi({ ...data, url: '/api/submissions/submit' });
};