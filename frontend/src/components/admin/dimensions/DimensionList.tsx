import { Dimension } from "@/types/dimension";
import { DimensionCard } from "./DimensionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Layers } from "lucide-react";

interface DimensionListProps {
  dimensions: Dimension[];
}

export const DimensionList = ({ dimensions }: DimensionListProps) => {
  if (dimensions.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No dimensions created yet"
        description="Click 'Add Dimension' to get started."
        action={
          <div className="mt-4">
            {/* The button in the parent component handles the action */}
          </div>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dimensions.map((dimension) => (
        <DimensionCard key={dimension.id} dimension={dimension} />
      ))}
    </div>
  );
};
