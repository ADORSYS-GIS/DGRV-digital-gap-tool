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
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  variant = "default",
  children,
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
    <Card className={`border-2 ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {actionText && (
          <Button variant="ghost" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs mb-2">
          {description}
        </CardDescription>
        {children}
      </CardContent>
    </Card>
  );
};
