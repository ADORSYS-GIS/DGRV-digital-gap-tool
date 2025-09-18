/**
 * Loading spinner components for various UI states.
 * This file provides:
 * - Main LoadingSpinner component with configurable sizes and variants
 * - FullPageLoader for full-screen loading states
 * - InlineLoader for small loading indicators
 */
import React from "react";
import { cn } from "@/utils/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
  className?: string;
  text?: string;
}

/**
 * Consistent loading spinner component with multiple sizes and variants
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "primary",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const variantClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    white: "text-white",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          variantClasses[variant],
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p
          className={cn(
            "mt-2 text-sm",
            variant === "white" ? "text-white" : "text-gray-600",
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Full-page loading component with centered spinner
 */
export const FullPageLoader: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <LoadingSpinner size="lg" {...props} />
    </div>
  );
};

/**
 * Inline loading component for small loading states
 */
export const InlineLoader: React.FC<LoadingSpinnerProps> = (props) => {
  return <LoadingSpinner size="sm" {...props} />;
};
