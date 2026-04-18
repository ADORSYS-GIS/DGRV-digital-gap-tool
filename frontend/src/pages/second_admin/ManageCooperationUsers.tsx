import { Link, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SimpleCooperationCard } from "@/components/second_admin/cooperations/SimpleCooperationCard";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";

/**
 * Entry screen for selecting which cooperative's users to manage.
 * Org admins see a grid of cooperatives, while coop admins are redirected
 * directly to their own cooperative user list.
 */
export default function ManageCooperationUsers() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const organizationId = useOrganizationId();
  const {
    data: cooperations,
    isLoading,
    error,
  } = useCooperations(organizationId || undefined);
  const location = useLocation();
  const basePath = location.pathname.split("/").slice(0, 2).join("/");
  const isCoopAdmin = user?.roles?.includes(ROLES.COOP_ADMIN);
  const {
    cooperationId: coopIdFromPath,
    isLoading: isLoadingCoopFromPath,
    error: coopFromPathError,
  } = useCooperationIdFromPath();

  if (isCoopAdmin) {
    if (isLoading || isLoadingCoopFromPath) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    // Prefer the resolved ID from the token path if available
    const targetCooperationId = coopIdFromPath || cooperations?.[0]?.id;

    if (targetCooperationId) {
      return (
        <Navigate
          to={`${basePath}/manage-cooperation-users/${targetCooperationId}`}
          replace
        />
      );
    }

    if (coopFromPathError) {
      return (
        <div className="overflow-y-auto h-full bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("secondAdmin.manageCoopUsers.error.resolveTitle")}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("secondAdmin.manageCoopUsers.error.resolveDescription")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-y-auto h-full bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("secondAdmin.manageCoopUsers.error.noCoopTitle")}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("secondAdmin.manageCoopUsers.error.noCoopDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("secondAdmin.manageCoopUsers.title")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("secondAdmin.manageCoopUsers.description")}
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
            <p className="font-medium">{t("secondAdmin.manageCoopUsers.error.load")}</p>
            <p className="mt-1 opacity-90">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && cooperations && cooperations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {t("secondAdmin.manageCoopUsers.empty.title")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("secondAdmin.manageCoopUsers.empty.description")}
            </p>
          </div>
        )}

        {!isLoading && !error && cooperations && cooperations.length > 0 && (
          <section aria-label={t("secondAdmin.manageCoopUsers.sectionLabel")}>
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
