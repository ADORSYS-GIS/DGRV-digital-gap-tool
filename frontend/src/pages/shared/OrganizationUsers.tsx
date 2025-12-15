import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useOrganizationMembers } from "@/hooks/users/useOrganizationMembers";
import { InviteUserForm } from "@/components/shared/users/InviteUserForm";
import { UserList } from "@/components/shared/users/UserList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function OrganizationUsers() {
  const { orgId } = useParams<{ orgId: string }>();
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: members, isLoading, error } = useOrganizationMembers(orgId!);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Manage Organization Users
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            View and manage users for this organization.
          </p>
        </div>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 h-11 px-6 rounded-lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Invite User
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {members && <UserList users={members} />}

      <InviteUserForm
        isOpen={isInviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        orgId={orgId!}
      />
    </div>
  );
}
