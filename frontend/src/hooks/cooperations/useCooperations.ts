import { useQuery } from "@tanstack/react-query";
import { cooperationRepository } from "@/services/cooperations/cooperationRepository";

export const useCooperations = (organizationId?: string) => {
  return useQuery({
    queryKey: ["cooperations", organizationId],
    queryFn: () => cooperationRepository.getAll(organizationId),
    enabled: !!organizationId,
  });
};
