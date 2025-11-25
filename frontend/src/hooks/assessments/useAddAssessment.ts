import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { AddAssessmentPayload, Assessment } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";
import { toast } from "sonner";

type MutationContext = {
  previousAssessments: Assessment[];
  optimisticId: string;
};

export const useAddAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<Assessment, Error, AddAssessmentPayload, MutationContext>({
    networkMode: "always",
    mutationFn: (assessment: AddAssessmentPayload) =>
      assessmentRepository.add(assessment),
    onMutate: async (newAssessment) => {
      await queryClient.cancelQueries({ queryKey: ["assessments"] });
      const previousAssessments =
        queryClient.getQueryData<Assessment[]>(["assessments"]) ?? [];

      const optimisticId = `temp-${Date.now()}`;
      const optimisticAssessment: Assessment = {
        id: optimisticId,
        name: newAssessment.assessment_name,
        dimensionIds: newAssessment.dimensions_id,
        organization_id: newAssessment.organization_id,
        cooperation_id: newAssessment.cooperation_id,
        syncStatus: SyncStatus.PENDING,
        created_at: new Date().toISOString(),
        status: "Draft",
      };

      queryClient.setQueryData<Assessment[]>(["assessments"], (old = []) => [
        ...old,
        optimisticAssessment,
      ]);

      return { previousAssessments, optimisticId };
    },
    onSuccess: (data, _variables, context) => {
      toast.success("Assessment added successfully");
      queryClient.setQueryData<Assessment[]>(["assessments"], (old = []) =>
        old.map((a) => (a.id === context.optimisticId ? data : a)),
      );
    },
    onError: (error: Error, _, context) => {
      if (context?.previousAssessments) {
        queryClient.setQueryData(["assessments"], context.previousAssessments);
      }
      toast.error(`Failed to add assessment: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
};
