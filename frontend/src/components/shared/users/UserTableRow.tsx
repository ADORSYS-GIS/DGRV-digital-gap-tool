import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeycloakUser } from "@/types/user";
import { Trash2 } from "lucide-react";
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
import { useDeleteUser } from "@/hooks/users/useDeleteUser";
import { useParams } from "react-router-dom";

interface UserTableRowProps {
  user: KeycloakUser;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user }) => {
  const { orgId } = useParams<{ orgId: string }>();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteUserMutation = useDeleteUser(orgId!);

  const getStatusInfo = () => {
    if (user.syncStatus === "pending" || user.emailVerified === false) {
      return { label: "Pending", variant: "secondary" as const };
    }
    return user.enabled
      ? { label: "Active", variant: "success" as const }
      : { label: "Inactive", variant: "destructive" as const };
  };

  const status = getStatusInfo();

  const handleDelete = () => {
    if (user.id) {
      deleteUserMutation.mutate(user.id!, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
        },
      });
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{user.firstName}</TableCell>
      <TableCell>{user.lastName}</TableCell>
      <TableCell>Org Admin</TableCell>
      <TableCell>
        <Badge variant={status.variant}>
          {status.label}
        </Badge>
      </TableCell>
      <TableCell>
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};
