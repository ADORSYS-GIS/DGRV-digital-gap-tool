import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, changePassword } from "@/openapi-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { UpdateMeData, ChangePasswordData } from "@/openapi-client";

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: () => getMe(),
    });
};

export const useUpdateMe = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (data: UpdateMeData['requestBody']) =>
            updateMe({ requestBody: data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success(t("profile.update_success"));
        },
        onError: () => {
            toast.error(t("profile.update_error"));
        },
    });
};

export const useChangePassword = () => {
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (data: ChangePasswordData['requestBody']) =>
            changePassword({ requestBody: data }),
        onSuccess: () => {
            toast.success(t("profile.password_change_success"));
        },
        onError: (error: any) => {
            if (error.status === 401) {
                toast.error(t("profile.password_change_invalid_current"));
            } else {
                toast.error(t("profile.password_change_error"));
            }
        },
    });
};
