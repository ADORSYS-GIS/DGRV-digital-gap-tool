import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";

export const useAddOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newOrganization: Omit<
        Organization,
        "id" | "syncStatus" | "createdAt" | "updatedAt"
      >,
    ) => {
      // In a real app, this is where you'd send the request to the backend.
      // For our offline-first approach, we're interacting directly with the repository.
      return organizationRepository.add(newOrganization);
    },
    onMutate: async (newOrganization) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["organizations"] });

      // Snapshot the previous value
      const previousOrganizations =
        queryClient.getQueryData<Organization[]>(["organizations"]) || [];

      // Optimistically update to the new value
      queryClient.setQueryData<Organization[]>(["organizations"], (old) => [
        ...(old || []),
        { ...newOrganization, id: crypto.randomUUID(), syncStatus: "new" },
      ]);

      // Return a context object with the snapshotted value
      return { previousOrganizations };
    },
    onError: (err, newOrganization, context) => {
      // Rollback to the previous value on error
      if (context?.previousOrganizations) {
        queryClient.setQueryData(
          ["organizations"],
          context.previousOrganizations,
        );
      }
    },
    onSettled: () => {
      // Invalidate and refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
};
