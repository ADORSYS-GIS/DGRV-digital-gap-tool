import React from "react";
import { IDimension } from "@/types/dimension";
import { DimensionIcon } from "./DimensionIcon";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";

interface DimensionCardProps {
  dimension: IDimension;
  onClick: (dimensionId: string) => void;
  isSubmitted: boolean;
  isLocked?: boolean;
}

/**
 * Card representing a single assessment dimension with status and CTA.
 * When `isLocked` is true the card is visible but non-interactive (read-only).
 */
export const DimensionCard: React.FC<DimensionCardProps> = ({
  dimension,
  onClick,
  isSubmitted,
  isLocked = false,
}) => {
  const handleClick = () => {
    if (!isLocked) onClick(dimension.id);
  };

  return (
    <div
      role={isLocked ? undefined : "button"}
      tabIndex={isLocked ? undefined : 0}
      onClick={handleClick}
      onKeyDown={isLocked ? undefined : (e) => e.key === "Enter" && handleClick()}
      className={`group relative flex h-full w-full flex-col items-stretch rounded-xl border bg-card px-5 py-6 text-left shadow-sm transition-all duration-200 ${
        isLocked
          ? "cursor-not-allowed opacity-70 border-muted"
          : "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      } ${isSubmitted && !isLocked ? "border-emerald-300" : isLocked ? "border-muted" : "border-border"}`}
    >
      {/* Status badge */}
      {isLocked ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Assigned
        </span>
      ) : isSubmitted ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Completed
        </span>
      ) : null}

      <div className="flex flex-1 flex-col items-center text-center">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isLocked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          <DimensionIcon
            name={dimension.name}
            className={`h-7 w-7 ${isLocked ? "text-muted-foreground" : "text-primary"}`}
          />
        </div>
        <h3 className="mb-2 text-sm font-semibold text-foreground sm:text-base">
          {dimension.name}
        </h3>
        <p className="mb-4 flex-grow text-xs text-muted-foreground sm:text-sm">
          {dimension.description}
        </p>
      </div>

      {!isLocked && (
        <div className="mt-2 flex items-center justify-center text-sm font-medium text-primary">
          <span>{isSubmitted ? "Modify assessment" : "Start assessment"}</span>
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}

      {isLocked && (
        <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground">
          Assigned to a cooperative user
        </div>
      )}
    </div>
  );
};
