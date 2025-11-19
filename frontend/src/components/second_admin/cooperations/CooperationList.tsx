import React from "react";
import { Cooperation } from "@/types/cooperation";
import { CooperationCard } from "./CooperationCard";

interface CooperationListProps {
  cooperations: Cooperation[];
  onUpdate: (cooperation: Cooperation) => void;
  onDelete: (id: string) => void;
}

export const CooperationList: React.FC<CooperationListProps> = ({
  cooperations,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cooperations.map((cooperation) => (
        <CooperationCard
          key={cooperation.id}
          cooperation={cooperation}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
