import { useQuery } from "@tanstack/react-query";
import { assessmentRepository } from "../../services/assessments/assessmentRepository";

type UseAssessmentsOptions = {
  enabled?: boolean;
};

export const useAssessments = (options?: UseAssessmentsOptions) => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: () => assessmentRepository.getAll(),
    enabled: options?.enabled !== false,
  });
};
