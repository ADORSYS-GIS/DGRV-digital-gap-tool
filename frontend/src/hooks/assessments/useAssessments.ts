import { useQuery } from "@tanstack/react-query";
import { assessmentRepository } from "../../services/assessments/assessmentRepository";

export const useAssessments = () => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: () => assessmentRepository.getAll(),
  });
};
