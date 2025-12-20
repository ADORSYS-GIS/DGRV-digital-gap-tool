import { useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/services/organizations/organizationRepository";
import { Organization } from "@/types/organization";
import { toast } from "sonner";

export const useAddOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: (
      newOrganization: Omit<
        Organization,
        "id" | "syncStatus" | "createdAt" | "updatedAt"
      >,
    ) => organizationRepository.add(newOrganization),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add organization: ${error.message}`);
    },
  });
};
