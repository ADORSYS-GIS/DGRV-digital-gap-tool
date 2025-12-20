import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AddCooperationUserForm } from "@/components/second_admin/cooperationUsers/AddCooperationUserForm";
import { CooperationUserList } from "@/components/second_admin/cooperationUsers/CooperationUserList";
import { useCooperationUsers } from "@/hooks/cooperationUsers/useCooperationUsers";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useMemo } from "react";

/**
 * Detail page for managing the users of a specific cooperation.
 */
export default function ManageCooperationUsersPage() {
  const { data: users, isLoading, error } = useCooperationUsers();
  const { user: currentUser } = useAuth();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (currentUser?.roles?.includes(ROLES.ORG_ADMIN)) {
      return users.filter((user) => user.roles.includes(ROLES.COOP_ADMIN));
    }
    if (currentUser?.roles?.includes(ROLES.COOP_ADMIN)) {
      return users.filter((user) => user.roles.includes(ROLES.COOP_USER));
    }
    return users;
  }, [users, currentUser]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Manage cooperation users
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Invite new admins or members, review access, and keep your
              cooperative workspace up to date.
            </p>
          </div>
          <AddCooperationUserForm />
        </header>

        {isLoading && (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Unable to load cooperation users.</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No users added yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Start by inviting your first admin or member to this cooperation.
            </p>
            <div className="mt-4">
              <AddCooperationUserForm />
            </div>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length > 0 && (
          <section
            aria-label="Cooperation users table"
            className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <CooperationUserList users={filteredUsers} />
          </section>
        )}
      </div>
    </div>
  );
}
