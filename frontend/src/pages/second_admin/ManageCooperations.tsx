/**
 * Page for managing cooperations.
 * This page allows administrators to view, add, edit, and delete cooperations.
 */

import React from "react";
import { AddCooperationForm } from "@/components/second_admin/cooperations/AddCooperationForm";
import { CooperationList } from "@/components/second_admin/cooperations/CooperationList";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const ManageCooperations: React.FC = () => {
  const { data: cooperations, isLoading } = useCooperations();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Cooperations</h1>
          <p className="text-muted-foreground">
            Add and manage cooperative profiles and data
          </p>
        </div>
        <AddCooperationForm />
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && cooperations && (
        <CooperationList cooperations={cooperations} />
      )}
    </div>
  );
};

export default ManageCooperations;
