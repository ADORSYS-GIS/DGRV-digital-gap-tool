/**
 * Page for managing cooperations.
 * This page allows administrators to view, add, edit, and delete cooperations.
 */

import React, { useEffect } from "react";
import { AddCooperationForm } from "@/components/second_admin/cooperations/AddCooperationForm";
import { CooperationList } from "@/components/second_admin/cooperations/CooperationList";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";
import { useUpdateCooperation } from "@/hooks/cooperations/useUpdateCooperation";
import { useDeleteCooperation } from "@/hooks/cooperations/useDeleteCooperation";
import { Cooperation } from "@/types/cooperation";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { cooperationSyncService } from "@/services/sync/cooperationSyncService";
import { useTranslation } from "react-i18next";

const ManageCooperations: React.FC = () => {
  const organizationId = useOrganizationId();
  const { data: cooperations, isLoading, error } = useCooperations();
  const { mutate: addCooperation } = useAddCooperation(
    organizationId || undefined,
  );
  const { mutate: updateCooperation } = useUpdateCooperation(
    organizationId || undefined,
  );
  const { mutate: deleteCooperation } = useDeleteCooperation(
    organizationId || undefined,
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (organizationId) {
      cooperationSyncService.sync(organizationId);
    }
  }, [organizationId]);

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
          <h1 className="text-3xl font-bold">
            {t("manageCooperations.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("manageCooperations.description")}
          </p>
        </div>
        <AddCooperationForm onAdd={handleAddCooperation} />
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          {t("manageCooperations.errorMessage", {
            message: (error as any).message || String(error),
          })}
        </p>
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
