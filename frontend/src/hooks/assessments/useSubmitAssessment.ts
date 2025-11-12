import { useMutation } from '@tanstack/react-query';
import { submitAssessment } from '@/services/assessmentService';
import { AssessmentInput, SubmitAssessmentResponse } from '@/types/assessment';
import { toast } from 'sonner';

export const useSubmitAssessment = () => {
  return useMutation<SubmitAssessmentResponse, Error, AssessmentInput[]>({
    mutationFn: submitAssessment,
    onSuccess: (data) => {
      toast.success(data.message || 'Assessment submitted successfully!');
      // Optionally, invalidate queries or update UI based on successful submission
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit assessment.');
    },
  });
};