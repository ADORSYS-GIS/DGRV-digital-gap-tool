import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useOrganizationMembers } from "@/hooks/users/useOrganizationMembers";
import { useQuery } from "@tanstack/react-query";
import { OpenAPI } from "@/openapi-client/core/OpenAPI";
import { request as __request } from "@/openapi-client/core/request";
import { InviteUserForm } from "@/components/shared/users/InviteUserForm";
import { UserList } from "@/components/shared/users/UserList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { KeycloakUser } from "@/types/user";
import { SyncStatus } from "@/types/sync/index";

type PendingInvitation = { id: string; email: string; firstName?: string | null; lastName?: string | null };

const fetchOrganizationInvitations = (orgId: string): Promise<PendingInvitation[]> =>
  __request(OpenAPI, {
    method: "GET",
    url: "/admin/organizations/{org_id}/invitations",
    path: { org_id: orgId },
  });

export default function OrganizationUsers() {
  const { orgId } = useParams<{ orgId: string }>();
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: members, isLoading, error } = useOrganizationMembers(orgId!);

  const { data: invitations } = useQuery({
    queryKey: ["organizationInvitations", orgId],
    queryFn: () => fetchOrganizationInvitations(orgId!),
    enabled: !!orgId,
  });

  const memberIds = new Set((members || []).map((m) => m.id));
  const pendingUsers: KeycloakUser[] = (invitations || [])
    .filter((inv) => !memberIds.has(inv.id))
    .map((inv) => ({
      id: inv.id,
      email: inv.email,
      firstName: inv.firstName ?? "",
      lastName: inv.lastName ?? "",
      username: inv.email,
      enabled: false,
      emailVerified: false,
      orgId: orgId!,
      syncStatus: SyncStatus.PENDING,
    }));

  const allUsers = [...(members || []), ...pendingUsers];

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
      {!isLoading && <UserList users={allUsers} />}

      <InviteUserForm
        isOpen={isInviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        orgId={orgId!}
      />
    </div>
  );
}
