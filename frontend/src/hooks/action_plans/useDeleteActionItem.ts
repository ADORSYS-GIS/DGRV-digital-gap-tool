import { useState } from "react";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { toast } from "sonner";

export function useDeleteActionItem() {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteItem = async (
        actionPlanId: string,
        actionItemId: string,
        onSuccess?: () => void,
    ) => {
        setIsDeleting(true);
        try {
            const success = await actionPlanRepository.deleteActionItem(
                actionPlanId,
                actionItemId,
            );

            if (success) {
                toast.success("Action item deleted successfully");
                if (onSuccess) {
                    onSuccess();
                }
                return true;
            } else {
                toast.error("Failed to delete action item");
            }
        } catch (error) {
            console.error("Error deleting action item:", error);
            toast.error("An error occurred while deleting the action item");
        } finally {
            setIsDeleting(false);
        }
        return false;
    };

    return { deleteItem, isDeleting };
}
