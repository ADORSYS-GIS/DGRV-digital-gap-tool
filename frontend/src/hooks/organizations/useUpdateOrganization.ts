import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";
import { toast } from "sonner";

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: async (organization: Organization) => {
      return organizationRepository.update(organization.id, organization);
    },
    onMutate: async (updatedOrganization) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrganizations =
        queryClient.getQueryData<Organization[]>(["organizations"]) || [];

      queryClient.setQueryData<Organization[]>(["organizations"], (old = []) =>
        old.map((org) =>
          org.id === updatedOrganization.id
            ? { ...org, ...updatedOrganization, syncStatus: "updated" }
            : org,
        ),
      );

      return { previousOrganizations };
    },
    onSuccess: () => {
      toast.success("Organization updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(
        ["organizations"],
        context?.previousOrganizations,
      );
      toast.error(`Failed to update organization: ${error.message}`);
    },
  });
};
