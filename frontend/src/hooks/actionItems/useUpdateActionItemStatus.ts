import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actionItemRepository } from "@/services/actionItems/actionItemRepository";
import { ActionItemStatus } from "@/types/actionItem";

export function useUpdateActionItemStatus(assessmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionItemStatus }) =>
      actionItemRepository.updateActionItemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["actionItems", assessmentId],
      });
    },
  });
}