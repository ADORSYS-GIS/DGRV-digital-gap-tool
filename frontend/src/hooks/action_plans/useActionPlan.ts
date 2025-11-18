import { useQuery } from "@tanstack/react-query";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";

export const useActionPlan = (assessmentId: string | undefined) => {
  return useQuery({
    queryKey: ["action_plan", assessmentId],
    queryFn: () =>
      actionPlanRepository.getActionPlanByAssessmentId(assessmentId!),
    enabled: !!assessmentId,
  });
};
