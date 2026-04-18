import { useTranslation } from "react-i18next";
import { CooperationUser } from "@/types/cooperationUser";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface CooperationUserListProps {
  users: CooperationUser[];
}

/**
 * Tabular list of cooperation users with a single destructive action.
 */
export const CooperationUserList = ({ users }: CooperationUserListProps) => {
  const { t } = useTranslation();
  const { mutate: deleteUser, isPending } = useDeleteCooperationUser();

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
                {user.roles.includes("coop_user") && user.syncStatus === "synced" && (
                  <EditCooperationUserForm user={user} />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteUser(user.id)}
                  disabled={isPending}
                  className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("secondAdminCooperationUsers.list.actions.delete")}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
