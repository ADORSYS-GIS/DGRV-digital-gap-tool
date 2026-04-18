import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { KeycloakUser } from "@/types/user";
import { UserTableRow } from "@/components/shared/users/UserTableRow";
import { Card, CardContent } from "@/components/ui/card";

interface UserTableProps {
  users: KeycloakUser[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const { t } = useTranslation();
  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200">
              <TableHead className="text-gray-600 font-semibold h-12">
                {t("sharedUsers.table.email")}
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                {t("sharedUsers.table.firstName")}
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                {t("sharedUsers.table.lastName")}
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                {t("sharedUsers.table.role")}
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                {t("sharedUsers.table.status")}
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                {t("sharedUsers.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserTableRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
