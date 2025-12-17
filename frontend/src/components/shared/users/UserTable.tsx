import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { KeycloakUser } from "@/types/user";
import { UserTableRow } from "@/components/shared/users/UserTableRow";

interface UserTableProps {
  users: KeycloakUser[];
}

import { Card, CardContent } from "@/components/ui/card";

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200">
              <TableHead className="text-gray-600 font-semibold h-12">
                Email
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                First Name
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                Last Name
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                Role
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                Status
              </TableHead>
              <TableHead className="text-gray-600 font-semibold h-12">
                Actions
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
