import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { Assessment } from "@/types/assessment";
import { useQuery } from "@tanstack/react-query";

export const useAssessment = (assessmentId: string) => {
  return useQuery<Assessment | undefined, Error>({
    queryKey: ["assessment", assessmentId],
    queryFn: () => assessmentRepository.getById(assessmentId),
  });
};
