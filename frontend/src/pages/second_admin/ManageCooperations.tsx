/**
 * Page for managing cooperations.
 * This page allows administrators to view, add, edit, and delete cooperations.
 */

import { AddCooperationForm } from "@/components/second_admin/cooperations/AddCooperationForm";
import { CooperationList } from "@/components/second_admin/cooperations/CooperationList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useDeleteCooperation } from "@/hooks/cooperations/useDeleteCooperation";
import { useUpdateCooperation } from "@/hooks/cooperations/useUpdateCooperation";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { Cooperation } from "@/types/cooperation";
import React from "react";

const ManageCooperations: React.FC = () => {
  const organizationId = useOrganizationId();
  const { data: cooperations, isLoading, error } = useCooperations(
    organizationId || undefined,
  );
  const { mutate: addCooperation } = useAddCooperation(
    organizationId || undefined,
  );
  const { mutate: updateCooperation } = useUpdateCooperation(
    organizationId || undefined,
  );
  const { mutate: deleteCooperation } = useDeleteCooperation(
    organizationId || undefined,
  );


  const handleAddCooperation = (
    cooperation: Omit<Cooperation, "id" | "syncStatus">,
  ) => {
    addCooperation(cooperation);
  };

  const handleUpdateCooperation = (cooperation: Cooperation) => {
    updateCooperation(cooperation);
  };

  const handleDeleteCooperation = (id: string) => {
    deleteCooperation(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Cooperations</h1>
          <p className="text-muted-foreground">
            Add and manage cooperative profiles and data
          </p>
        </div>
        <AddCooperationForm onAdd={handleAddCooperation} />
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {cooperations && (
        <CooperationList
          cooperations={cooperations}
          onUpdate={handleUpdateCooperation}
          onDelete={handleDeleteCooperation}
        />
      )}
    </div>
  );
};

export default ManageCooperations;
