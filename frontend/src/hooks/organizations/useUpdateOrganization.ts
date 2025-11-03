import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organization: Organization) => {
      return organizationRepository.update(organization.id, organization);
    },
    onMutate: async (updatedOrganization) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });

      const previousOrganizations =
        queryClient.getQueryData<Organization[]>(["organizations"]) || [];

      queryClient.setQueryData<Organization[]>(
        ["organizations"],
        (oldQueryData) => {
          if (!oldQueryData) {
            return [];
          }
          return oldQueryData.map((org) =>
            org.id === updatedOrganization.id ? updatedOrganization : org,
          );
        },
      );

      return { previousOrganizations };
    },
    onError: (err, updatedOrganization, context) => {
      if (context?.previousOrganizations) {
        queryClient.setQueryData(
          ["organizations"],
          context.previousOrganizations,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
};
