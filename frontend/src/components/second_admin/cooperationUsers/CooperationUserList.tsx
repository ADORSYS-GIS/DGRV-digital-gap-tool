import { useTranslation } from "react-i18next";
import { CooperationUser } from "@/types/cooperationUser";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { useDeleteCooperationUser } from "@/hooks/cooperationUsers/useDeleteCooperationUser";
import { EditCooperationUserForm } from "./EditCooperationUserForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { cooperationUserSyncService } from "@/services/cooperationUsers/cooperationUserSyncService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface CooperationUserListProps {
  users: CooperationUser[];
}

/**
 * Tabular list of cooperation users with a single destructive action.
 */
export const CooperationUserList = ({ users }: CooperationUserListProps) => {
  const { t } = useTranslation();
  const { mutate: deleteUser, isPending } = useDeleteCooperationUser();
  const { cooperationId } = useParams<{ cooperationId: string }>();

  const resendMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      cooperationUserSyncService.resendVerificationEmail(userId, cooperationId!),
    onSuccess: () => toast.success(t("secondAdminCooperationUsers.list.resend.success")),
    onError: () => toast.error(t("secondAdminCooperationUsers.list.resend.error")),
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[32%]">{t("secondAdminCooperationUsers.list.columns.email")}</TableHead>
          <TableHead>{t("secondAdminCooperationUsers.list.columns.firstName")}</TableHead>
          <TableHead>{t("secondAdminCooperationUsers.list.columns.lastName")}</TableHead>
          <TableHead>{t("secondAdminCooperationUsers.list.columns.verified")}</TableHead>
          <TableHead className="w-[120px] text-right">{t("secondAdminCooperationUsers.list.columns.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>{user.firstName || "—"}</TableCell>
            <TableCell>{user.lastName || "—"}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.emailVerified
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                  }`}
              >
                <span
                  className={`mr-1 h-1.5 w-1.5 rounded-full ${user.emailVerified ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                />
                {user.emailVerified
                  ? t("secondAdminCooperationUsers.list.status.verified")
                  : t("secondAdminCooperationUsers.list.status.pending")}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {!user.emailVerified && user.syncStatus === "synced" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={resendMutation.isPending}
                    className="border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                    onClick={() => resendMutation.mutate({ userId: user.id })}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("secondAdminCooperationUsers.list.actions.resend")}
                  </Button>
                )}
                {user.roles.includes("coop_user") && user.syncStatus === "synced" && (
                  <EditCooperationUserForm user={user} />
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("secondAdminCooperationUsers.list.actions.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("sharedUsers.delete.title")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("sharedUsers.delete.description")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isPending}
                      >
                        {isPending ? t("common.deleting") : t("common.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
