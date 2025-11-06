import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actionItemRepository } from "@/services/actionItems/actionItemRepository";
import { ActionItem } from "@/types/actionItem";

export function useAddActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<ActionItem, "id" | "status" | "createdAt">) =>
      actionItemRepository.addActionItem(item),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["actionItems", data.assessmentId],
      });
    },
  });
}