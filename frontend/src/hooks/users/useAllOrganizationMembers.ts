import { useQuery } from "@tanstack/react-query";
import { userRepository } from "@/services/users/userRepository";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";

export const useAllOrganizationMembers = () => {
  const { data: organizations } = useOrganizations();

  return useQuery({
    queryKey: ["allOrganizationMembers", organizations],
    queryFn: async () => {
      if (!organizations) {
        return [];
      }

      const memberPromises = organizations.map((org) =>
        userRepository.getMembers(org.id!),
      );
      const members = await Promise.all(memberPromises);
      return members.flat();
    },
    enabled: !!organizations,
  });
};
