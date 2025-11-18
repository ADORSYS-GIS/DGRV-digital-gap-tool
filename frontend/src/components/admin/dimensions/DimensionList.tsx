import { Dimension } from "@/types/dimension";
import { DimensionCard } from "./DimensionCard";

interface DimensionListProps {
  dimensions: Dimension[];
}

export const DimensionList = ({ dimensions }: DimensionListProps) => {
  if (dimensions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No dimensions created yet.</p>
        <p>Click "Add Dimension" to get started.</p>
      </div>
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
