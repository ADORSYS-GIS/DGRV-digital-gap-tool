import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useOrganizationMembers } from "@/hooks/users/useOrganizationMembers";
import { InviteUserForm } from "@/components/shared/users/InviteUserForm";
import { UserList } from "@/components/shared/users/UserList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";

export default function OrganizationUsers() {
  const { orgId } = useParams<{ orgId: string }>();
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { data: members, isLoading, error } = useOrganizationMembers(orgId!);
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("organizationUsers.title")}
        </h1>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("organizationUsers.inviteUser")}
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          {t("organizationUsers.errorMessage", {
            message: (error as any).message || String(error),
          })}
        </p>
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
