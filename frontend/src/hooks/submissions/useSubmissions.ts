import { useQuery } from "@tanstack/react-query";
import { submissionRepository } from "@/services/assessments/submissionRepository";

export const useSubmissions = () => {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: () => submissionRepository.getSubmissions(),
  });
};
