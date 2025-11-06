import { useQuery } from "@tanstack/react-query";
import { actionItemRepository } from "@/services/actionItems/actionItemRepository";

export function useActionItems(assessmentId?: string) {
  return useQuery({
    queryKey: ["actionItems", assessmentId],
    queryFn: () =>
      assessmentId
        ? actionItemRepository.getActionItemsByAssessmentId(assessmentId)
        : actionItemRepository.getAllActionItems(),
  });
}