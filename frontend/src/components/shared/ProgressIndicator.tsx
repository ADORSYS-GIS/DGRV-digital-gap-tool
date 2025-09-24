/**
 * Progress indicator component that displays completion progress with percentage.
 * This component provides:
 * - Visual progress bar using the UI progress component
 * - Percentage and count display
 * - Color-coded badges based on progress state
 * - Flexible variant support for different progress states
 */
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  label,
  variant = "default",
}) => {
  const percentage = Math.round((current / total) * 100);

  const variantColors = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600",
  };

  const badgeVariants = {
    default: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge className={badgeVariants[variant]}>
          {current}/{total} ({percentage}%)
        </Badge>
      </div>
      <Progress value={percentage} className={variantColors[variant]} />
    </div>
  );
};
