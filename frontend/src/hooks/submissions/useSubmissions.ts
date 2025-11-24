import { useQuery } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";

/**
 * A simple wrapper hook that returns all submissions from the local database.
 * For role-based filtering, use useSubmissionsByOrganization or useSubmissionsByCooperation.
 */
export const useSubmissions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: () => assessmentRepository.getAll(),
    enabled: options?.enabled !== false,
  });
};
