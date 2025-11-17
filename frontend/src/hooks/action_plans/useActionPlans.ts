import { useQuery } from "@tanstack/react-query";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";

export const useActionPlans = () => {
  return useQuery({
    queryKey: ["action_plans"],
    queryFn: () => actionPlanRepository.getActionPlans(),
  });
};
