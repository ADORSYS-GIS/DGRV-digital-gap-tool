/**
 * Dashboard card component for displaying structured information in dashboard layouts.
 * This reusable component provides:
 * - Consistent card styling with variant support
 * - Icon support for visual hierarchy
 * - Action buttons for user interaction
 * - Flexible content area for various dashboard elements
 */
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  variant?: "default" | "success" | "warning" | "danger";
  children?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  variant = "default",
  children,
  titleClassName,
  descriptionClassName,
}) => {
  const variantStyles = {
    default: "border-blue-200 bg-blue-50",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    danger: "border-red-200 bg-red-50",
  };

  const iconColors = {
    default: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  return (
    <Card
      className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg border shadow-sm group/card overflow-hidden relative ${variant === "default" ? "bg-white" : variantStyles[variant]
        }`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${variant === "default"
            ? "bg-gradient-to-r from-primary/40 to-primary/80 group-hover/card:from-primary group-hover/card:to-primary"
            : "bg-transparent"
          }`}
      />
      <CardHeader className="flex-grow pb-2 pt-6">
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-xl transition-colors duration-300 ${variant === "default"
                ? "bg-primary/5 group-hover/card:bg-primary/10"
                : "bg-white/50"
              }`}
          >
            <Icon
              className={`h-6 w-6 ${variant === "default" ? "text-primary" : iconColors[variant]
                }`}
            />
          </div>
          <div className="space-y-1">
            <CardTitle
              className={`text-lg font-semibold tracking-tight ${titleClassName}`}
            >
              {title}
            </CardTitle>
            <CardDescription
              className={`text-sm text-muted-foreground leading-relaxed ${descriptionClassName}`}
            >
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
        {actionText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="w-full mt-4 hover:bg-primary/5 group"
          >
            {actionText}
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
