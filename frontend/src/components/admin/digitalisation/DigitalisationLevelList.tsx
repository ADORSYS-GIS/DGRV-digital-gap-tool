import * as React from "react";
import {
  DigitalisationLevel,
  DigitalisationLevelItem,
} from "./DigitalisationLevelItem";

interface DigitalisationLevelListProps {
  levels: DigitalisationLevel[];
  onEdit: (level: DigitalisationLevel) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export const DigitalisationLevelList: React.FC<
  DigitalisationLevelListProps
> = ({ levels, onEdit, onDelete, deletingId }) => {
  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <DigitalisationLevelItem
          key={level.id}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === level.id}
        />
      ))}
    </div>
  );
};
