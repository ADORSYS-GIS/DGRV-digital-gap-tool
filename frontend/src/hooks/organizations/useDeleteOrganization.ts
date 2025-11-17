import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";
import { toast } from "sonner";

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

      queryClient.setQueryData<Organization[]>(["organizations"], (old = []) =>
        old.filter((org) => org.id !== id),
      );

      return { previousOrganizations };
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(
        ["organizations"],
        context?.previousOrganizations,
      );
      toast.error(`Failed to delete organization: ${error.message}`);
    },
  });
};
