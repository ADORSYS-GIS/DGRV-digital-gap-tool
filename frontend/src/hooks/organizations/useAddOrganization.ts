import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";
import { toast } from "sonner";

export const useAddOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newOrganization: Omit<
        Organization,
        "id" | "syncStatus" | "createdAt" | "updatedAt"
      >,
    ) => {
      return organizationRepository.add(newOrganization);
    },
    onMutate: async (newOrganization) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrganizations =
        queryClient.getQueryData<Organization[]>(["organizations"]) || [];

      const optimisticOrganization: Organization = {
        id: `temp-${Date.now()}`,
        ...newOrganization,
        syncStatus: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Organization[]>(["organizations"], (old = []) => [
        ...old,
        optimisticOrganization,
      ]);

      return { previousOrganizations, optimisticOrganization };
    },
    onSuccess: (data, _, context) => {
      queryClient.setQueryData<Organization[]>(["organizations"], (old = []) =>
        old.map((org) =>
          org.id === context?.optimisticOrganization.id ? data : org,
        ),
      );
      toast.success("Organization added successfully");
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(
        ["organizations"],
        context?.previousOrganizations,
      );
      toast.error(`Failed to add organization: ${error.message}`);
    },
  });
};
