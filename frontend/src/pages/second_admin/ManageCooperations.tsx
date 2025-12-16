/**
 * Page for managing cooperations.
 * This page allows administrators to view, add, edit, and delete cooperations.
 */

import { AddCooperationForm } from "@/components/second_admin/cooperations/AddCooperationForm";
import { CooperationList } from "@/components/second_admin/cooperations/CooperationList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useDeleteCooperation } from "@/hooks/cooperations/useDeleteCooperation";
import { useUpdateCooperation } from "@/hooks/cooperations/useUpdateCooperation";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { Cooperation } from "@/types/cooperation";
import React from "react";

const ManageCooperations: React.FC = () => {
  const organizationId = useOrganizationId();
  const {
    data: cooperations,
    isLoading,
    error,
  } = useCooperations(organizationId || undefined);
  const { mutate: updateCooperation } = useUpdateCooperation(
    organizationId || undefined,
  );
  const { mutate: deleteCooperation } = useDeleteCooperation(
    organizationId || undefined,
  );

  const handleUpdateCooperation = (cooperation: Cooperation) => {
    updateCooperation(cooperation);
  };

  const handleDeleteCooperation = (id: string) => {
    deleteCooperation(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Manage Cooperations
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add and manage cooperative profiles and data
            </p>
          </div>
          <AddCooperationForm />
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[200px] rounded-xl border bg-card text-card-foreground shadow-sm animate-pulse bg-muted/20"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">An error occurred</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && cooperations && cooperations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold">No cooperations found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
              Get started by creating a new cooperative profile.
            </p>
            <AddCooperationForm />
          </div>
        )}

        {!isLoading && !error && cooperations && cooperations.length > 0 && (
          <CooperationList
            cooperations={cooperations}
            onUpdate={handleUpdateCooperation}
            onDelete={handleDeleteCooperation}
          />
        )}
      </div>
    </div>
  );
};

export default ManageCooperations;
