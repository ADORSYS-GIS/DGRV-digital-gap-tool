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

/**
 * Card representing a single assessment dimension with status and CTA.
 */
export const DimensionCard: React.FC<DimensionCardProps> = ({
  dimension,
  onClick,
  isSubmitted,
}) => {
  const handleClick = () => onClick(dimension.id);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex h-full w-full flex-col items-stretch rounded-xl border bg-card px-5 py-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isSubmitted ? "border-emerald-300" : "border-border"
      }`}
    >
      {isSubmitted && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Completed
        </span>
      )}
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <DimensionIcon
            name={dimension.name}
            className="h-7 w-7 text-primary"
          />
        </div>
        <h3 className="mb-2 text-sm font-semibold text-foreground sm:text-base">
          {dimension.name}
        </h3>
        <p className="mb-4 flex-grow text-xs text-muted-foreground sm:text-sm">
          {dimension.description}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-center text-sm font-medium text-primary">
        <span>{isSubmitted ? "Modify assessment" : "Start assessment"}</span>
        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};
