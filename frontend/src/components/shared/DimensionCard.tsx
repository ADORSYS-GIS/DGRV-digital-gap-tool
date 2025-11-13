import React from "react";
import { IDimension } from "@/types/dimension";
import { Button } from "@/components/ui/button";
import { DimensionIcon } from "./DimensionIcon";
import { ArrowRight } from "lucide-react";

interface DimensionCardProps {
  dimension: IDimension;
  onStart: (dimensionId: string) => void;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({
  dimension,
  onStart,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300 flex flex-col items-center text-center h-full">
      <DimensionIcon
        name={dimension.name}
        className="h-12 w-12 text-blue-500 mb-4"
      />
      <h3 className="text-lg font-bold mb-2">{dimension.name}</h3>
      <p className="text-gray-500 text-sm mb-4 flex-grow">
        {dimension.description}
      </p>
      <Button
        variant="link"
        className="text-blue-500 font-semibold"
        onClick={() => onStart(dimension.id)}
      >
        Start Assessment <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};