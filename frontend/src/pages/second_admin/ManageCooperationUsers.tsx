import { Link, useLocation, Navigate } from "react-router-dom";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SimpleCooperationCard } from "@/components/second_admin/cooperations/SimpleCooperationCard";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";

/**
 * Entry screen for selecting which cooperation's users to manage.
 * Org admins see a grid of cooperations, while coop admins are redirected
 * directly to their own cooperation user list.
 */
export default function ManageCooperationUsers() {
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const {
    data: cooperations,
    isLoading,
    error,
  } = useCooperations(organizationId || undefined);
  const location = useLocation();
  const basePath = location.pathname.split("/").slice(0, 2).join("/");
  const cooperationId = useCooperationId();

  const isCoopAdmin = user?.roles?.includes(ROLES.COOP_ADMIN);

  if (isCoopAdmin) {
    if (cooperationId) {
      return (
        <Navigate
          to={`${basePath}/manage-cooperation-users/${cooperationId}`}
          replace
        />
      );
    }
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Select a cooperation to manage users
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Choose a cooperation to view and manage its admins and members.
              You can invite new users or clean up access when people leave.
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Unable to load cooperations.</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && cooperations && cooperations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No cooperations available yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Once cooperations have been created for this organization, you&apos;ll
              be able to select one here and manage its users.
            </p>
          </div>
        )}

        {!isLoading && !error && cooperations && cooperations.length > 0 && (
          <section aria-label="Cooperation selection">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cooperations.map((coop) => (
                <Link
                  to={`${basePath}/manage-cooperation-users/${coop.id}`}
                  key={coop.id}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <SimpleCooperationCard cooperation={coop} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
