import { Link, useLocation } from "react-router-dom";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SimpleOrganizationCard } from "@/components/shared/organizations/SimpleOrganizationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2 } from "lucide-react";

export default function ManageUsers() {
  const { data: organizations, isLoading, error } = useOrganizations();
  const location = useLocation();
  const basePath = location.pathname.split("/").slice(0, 2).join("/");

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Manage Users
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Select an organization to view and manage its users.
          </p>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          An error occurred: {error.message}
        </div>
      )}
      {!isLoading && !error && (
        <>
          {organizations && organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Link to={`${basePath}/manage-users/${org.id}`} key={org.id}>
                  <SimpleOrganizationCard organization={org} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No organizations found"
              description="There are no organizations available to manage users for."
            />
          )}
        </>
      )}
    </div>
  );
}
