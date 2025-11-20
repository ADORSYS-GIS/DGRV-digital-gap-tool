import { Link, useLocation } from "react-router-dom";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SimpleCooperationCard } from "@/components/second_admin/cooperations/SimpleCooperationCard";

export default function ManageCooperationUsers() {
  const { data: cooperations, isLoading, error } = useCooperations();
  const location = useLocation();
  const basePath = location.pathname.split("/").slice(0, 2).join("/");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Select a Cooperation to Manage Users
        </h1>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {cooperations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cooperations.map((coop) => (
            <Link
              to={`${basePath}/manage-cooperation-users/${coop.id}`}
              key={coop.id}
            >
              <SimpleCooperationCard cooperation={coop} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
