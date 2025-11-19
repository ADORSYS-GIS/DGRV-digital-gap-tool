import { useQuery } from "@tanstack/react-query";
import { userRepository } from "@/services/users/userRepository";
import { KeycloakUser } from "@/types/user";

export const useOrganizationMembers = (orgId: string) => {
  return useQuery<KeycloakUser[], Error>({
    queryKey: ["organizationMembers", orgId],
    queryFn: () => userRepository.getMembers(orgId),
    enabled: !!orgId,
  });
};
