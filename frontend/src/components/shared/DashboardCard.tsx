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
    <Card className={`border-2 ${variantStyles[variant]} h-full flex flex-col`}>
      <CardHeader className="flex-grow">
        <div className="flex items-start space-x-4">
          <Icon className={`h-8 w-8 ${iconColors[variant]}`} />
          <div>
            <CardTitle className={`text-lg font-bold ${titleClassName}`}>
              {title}
            </CardTitle>
            <CardDescription className={`text-base ${descriptionClassName}`}>
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
            className="w-full mt-4"
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
