import React from "react";
import { IDimension } from "@/types/dimension";
import { Button } from "@/components/ui/button";
import { DimensionIcon } from "./DimensionIcon";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface DimensionCardProps {
  dimension: IDimension;
  onClick: (dimensionId: string) => void;
  isSubmitted: boolean;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({
  dimension,
  onClick,
  isSubmitted,
}) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg border ${
        isSubmitted ? "border-green-500" : "border-gray-200"
      } hover:shadow-lg hover:border-blue-500 transition-all duration-300 flex flex-col items-center text-center h-full relative`}
    >
      {isSubmitted && (
        <CheckCircle2 className="h-6 w-6 text-green-500 absolute top-2 right-2" />
      )}
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
        onClick={() => onClick(dimension.id)}
      >
        {isSubmitted ? "Modify Assessment" : "Start Assessment"}{" "}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};
