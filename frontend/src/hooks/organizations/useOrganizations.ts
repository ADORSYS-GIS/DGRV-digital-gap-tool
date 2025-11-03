import { useQuery } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationRepository.getAll(),
  });
};
