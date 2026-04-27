import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, RefreshCw, Clock } from "lucide-react";
import { useOrganizationMembers } from "@/hooks/users/useOrganizationMembers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizationInvitations,
  deleteOrganizationInvitation,
  resendOrganizationInvitation,
} from "@/openapi-client/services.gen";
import { InviteUserForm } from "@/components/shared/users/InviteUserForm";
import { UserList } from "@/components/shared/users/UserList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function OrganizationUsers() {
  const { orgId } = useParams<{ orgId: string }>();
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: members, isLoading, error } = useOrganizationMembers(orgId!);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading: isLoadingInvitations } = useQuery<import("@/openapi-client/types.gen").PendingInvitation[]>({
    queryKey: ["organizationInvitations", orgId],
    queryFn: async () => {
      const result = await getOrganizationInvitations({ orgId: orgId! });
      // Handle both direct array and wrapped { data: [...] } responses
      return Array.isArray(result) ? result : ((result as any)?.data ?? []);
    },
    enabled: !!orgId,
  });

  const deleteMutation = useMutation({
    mutationFn: (invitationId: string) =>
      deleteOrganizationInvitation({ orgId: orgId!, invitationId }),
    onSuccess: () => {
      toast.success("Invitation deleted");
      queryClient.invalidateQueries({ queryKey: ["organizationInvitations", orgId] });
    },
    onError: () => toast.error("Failed to delete invitation"),
  });

  const resendMutation = useMutation({
    mutationFn: (invitationId: string) =>
      resendOrganizationInvitation({ orgId: orgId!, invitationId }),
    onSuccess: () => toast.success("Invitation resent successfully"),
    onError: () => toast.error("Failed to resend invitation"),
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            {t("sharedPages.orgUsers.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("sharedPages.orgUsers.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 h-11 px-6 rounded-lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {t("sharedPages.orgUsers.inviteUser")}
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">{t("sharedPages.orgUsers.error", { message: error.message })}</p>
      )}

      {/* Active members */}
      {!isLoading && <UserList users={members || []} />}

      {/* Pending invitations */}
      {!isLoadingInvitations && invitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Invitations
            <Badge variant="secondary">{invitations.length}</Badge>
          </h2>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-100/60">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">First name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Last name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-amber-100 last:border-0">
                    <td className="px-4 py-3 text-gray-800">{inv.email}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.first_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.last_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-300">
                        Pending
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                          disabled={resendMutation.isPending}
                          onClick={() => resendMutation.mutate(inv.id)}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(inv.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InviteUserForm
        isOpen={isInviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        orgId={orgId!}
      />
    </div>
  );
}
