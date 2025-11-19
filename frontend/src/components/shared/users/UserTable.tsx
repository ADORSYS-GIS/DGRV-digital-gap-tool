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
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-600">Email</TableHead>
              <TableHead className="text-gray-600">First Name</TableHead>
              <TableHead className="text-gray-600">Last Name</TableHead>
              <TableHead className="text-gray-600">Role</TableHead>
              <TableHead className="text-gray-600">Status</TableHead>
              <TableHead className="text-gray-600">Actions</TableHead>
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
