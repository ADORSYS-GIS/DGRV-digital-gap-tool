import { CooperationUser } from "@/types/cooperationUser";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteCooperationUser } from "@/hooks/cooperationUsers/useDeleteCooperationUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface CooperationUserListProps {
  users: CooperationUser[];
}

export const CooperationUserList = ({ users }: CooperationUserListProps) => {
  const { mutate: deleteUser, isPending } = useDeleteCooperationUser();
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {t("secondAdmin.cooperationUsers.table.email", {
              defaultValue: "Email",
            })}
          </TableHead>
          <TableHead>
            {t("secondAdmin.cooperationUsers.table.firstName", {
              defaultValue: "First Name",
            })}
          </TableHead>
          <TableHead>
            {t("secondAdmin.cooperationUsers.table.lastName", {
              defaultValue: "Last Name",
            })}
          </TableHead>
          <TableHead>
            {t("secondAdmin.cooperationUsers.table.emailVerified", {
              defaultValue: "Email Verified",
            })}
          </TableHead>
          <TableHead>
            {t("common.actions", { defaultValue: "Actions" })}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.firstName}</TableCell>
            <TableCell>{user.lastName}</TableCell>
            <TableCell>
              {user.emailVerified
                ? t("common.yes", { defaultValue: "Yes" })
                : t("common.no", { defaultValue: "No" })}
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteUser(user.id)}
                disabled={isPending}
                aria-label={t("common.delete", { defaultValue: "Delete" })}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete", { defaultValue: "Delete" })}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
