import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "../../services/assessments/assessmentRepository";
import { Assessment } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: "always",
    mutationFn: (id: string) => assessmentRepository.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["assessments"] });
      const previousAssessments =
        queryClient.getQueryData<Assessment[]>(["assessments"]) ?? [];

      queryClient.setQueryData<Assessment[]>(["assessments"], (old = []) =>
        old.map((a) =>
          a.id === id ? { ...a, syncStatus: SyncStatus.DELETED } : a,
        ),
      );

      return { previousAssessments };
    },
    onSuccess: () => {
      toast.success("Assessment deleted successfully");
    },
    onError: (error: Error, _, context) => {
      if (context?.previousAssessments) {
        queryClient.setQueryData(["assessments"], context.previousAssessments);
      }
      toast.error(`Failed to delete assessment: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}
