import { useState } from "react";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { UpdateActionItemRequest } from "@/openapi-client/types.gen";
import { toast } from "sonner";

export function useUpdateActionItem() {
    const [isUpdating, setIsUpdating] = useState(false);

    const updateItem = async (
        actionPlanId: string,
        actionItemId: string,
        requestBody: UpdateActionItemRequest,
        onSuccess?: () => void,
    ) => {
        setIsUpdating(true);
        try {
            const updatedItem = await actionPlanRepository.updateActionItem(
                actionPlanId,
                actionItemId,
                requestBody,
            );

            if (updatedItem) {
                toast.success("Action item updated successfully");
                if (onSuccess) {
                    onSuccess();
                }
                return updatedItem;
            } else {
                toast.error("Failed to update action item");
            }
        } catch (error) {
            console.error("Error updating action item:", error);
            toast.error("An error occurred while updating the action item");
        } finally {
            setIsUpdating(false);
        }
        return undefined;
    };

    return { updateItem, isUpdating };
}
