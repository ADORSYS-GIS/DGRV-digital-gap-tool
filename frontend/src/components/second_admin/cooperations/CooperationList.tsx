import React from "react";
import { Cooperation } from "@/types/cooperation";
import { CooperationCard } from "./CooperationCard";

interface CooperationListProps {
  cooperations: Cooperation[];
}

export const CooperationList: React.FC<CooperationListProps> = ({
  cooperations,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cooperations.map((cooperation) => (
        <CooperationCard key={cooperation.id} cooperation={cooperation} />
      ))}
    </div>
  );
};
