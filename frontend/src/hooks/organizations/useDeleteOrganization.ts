import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return organizationRepository.delete(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });

      const previousOrganizations =
        queryClient.getQueryData<Organization[]>(["organizations"]) || [];

      queryClient.setQueryData<Organization[]>(
        ["organizations"],
        (oldQueryData) => {
          if (!oldQueryData) {
            return [];
          }
          return oldQueryData.filter((org) => org.id !== id);
        },
      );

      return { previousOrganizations };
    },
    onError: (err, id, context) => {
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
