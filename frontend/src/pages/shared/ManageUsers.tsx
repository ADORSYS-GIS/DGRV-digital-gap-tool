import { Link, useLocation } from "react-router-dom";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SimpleOrganizationCard } from "@/components/shared/organizations/SimpleOrganizationCard";
import { useTranslation } from "react-i18next";

export default function ManageUsers() {
  const { data: organizations, isLoading, error } = useOrganizations();
  const location = useLocation();
  const basePath = location.pathname.split("/").slice(0, 2).join("/");
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("manageUsers.title")}
        </h1>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          {t("manageUsers.errorMessage", {
            message: (error as any).message || String(error),
          })}
        </p>
      )}
      {organizations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <Link to={`${basePath}/manage-users/${org.id}`} key={org.id}>
              <SimpleOrganizationCard organization={org} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
