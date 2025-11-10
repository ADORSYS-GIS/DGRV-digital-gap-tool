/**
 * Dashboard card component for displaying structured information in dashboard layouts.
 * This reusable component provides:
 * - Consistent card styling with variant support
 * - Icon support for visual hierarchy
 * - Action buttons for user interaction
 * - Flexible content area for various dashboard elements
 */
import * as React from "react";
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

export const DashboardCard = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  variant = "default",
  children,
  titleClassName,
  descriptionClassName,
}: DashboardCardProps) => {
  const variantStyles = {
    default: "border-l-4 border-blue-500",
    success: "border-l-4 border-green-500",
    warning: "border-l-4 border-yellow-500",
    danger: "border-l-4 border-red-500",
  };

  const iconColors = {
    default: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <Card className={`bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col ${variantStyles[variant]}`}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${iconColors[variant]}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${titleClassName}`}>
              {title}
            </CardTitle>
            <CardDescription className={`text-gray-600 dark:text-gray-400 ${descriptionClassName}`}>
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {children}
        {actionText && (
          <Button
            variant="outline"
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
