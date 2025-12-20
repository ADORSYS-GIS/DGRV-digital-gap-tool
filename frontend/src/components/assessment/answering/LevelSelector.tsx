import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LevelSelectorProps {
  /** The title of the level selector */
  title: string;
  /** Description text shown below the title */
  description: string;
  /** Current selected level (1-based) */
  level: number;
  /** Callback when the level changes */
  onChange: (value: number) => void;
  /** The available levels to select from */
  availableLevels: number[];
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** ID for testing */
  testId?: string;
  levelDescription?: string | undefined;
}

/**
 * A component that allows selecting a level from a range, with both button and slider inputs.
 * Supports keyboard navigation and is fully accessible.
 */
export function LevelSelector({
  title,
  description,
  level,
  onChange,
  availableLevels,
  disabled = false,
  className,
  testId = "level-selector",
  levelDescription,
}: LevelSelectorProps) {
  const levels = useMemo(
    () => availableLevels.sort((a, b) => a - b),
    [availableLevels],
  );
  const minLevel = levels[0] ?? 1;
  const maxLevel = levels[levels.length - 1] ?? 1;

  // Ensure level is within bounds
  useEffect(() => {
    if (levels.length > 0 && !levels.includes(level)) {
      console.warn(
        `Level ${level} is not in the available levels. Clamping to the first available level.`,
      );
      const firstLevel = levels[0];
      if (firstLevel !== undefined) {
        onChange(firstLevel);
      }
    }
  }, [level, levels, onChange]);

  const handleLevelClick = useCallback(
    (lvl: number) => {
      if (!disabled) {
        onChange(lvl);
      }
    },
    [disabled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, lvl: number) => {
      if (disabled) return;

      const currentIndex = levels.indexOf(lvl);

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleLevelClick(lvl);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            const prevLevel = levels[currentIndex - 1];
            if (prevLevel !== undefined) {
              handleLevelClick(prevLevel);
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            if (nextLevel !== undefined) {
              handleLevelClick(nextLevel);
            }
          }
          break;
        case "Home":
          e.preventDefault();
          if (levels.length > 0) {
            const firstLevel = levels[0];
            if (firstLevel !== undefined) {
              handleLevelClick(firstLevel);
            }
          }
          break;
        case "End":
          e.preventDefault();
          if (levels.length > 0) {
            const lastLevel = levels[levels.length - 1];
            if (lastLevel !== undefined) {
              handleLevelClick(lastLevel);
            }
          }
          break;
      }
    },
    [disabled, handleLevelClick, levels],
  );

  // Ensure level is within bounds for rendering
  const safeLevel = levels.includes(level) ? level : minLevel;

  // Generate level indicators with visual representation
  const renderLevelIndicators = () => {
    return levels.map((lvl) => (
      <button
        key={lvl}
        type="button"
        role="radio"
        aria-checked={safeLevel === lvl ? "true" : "false"}
        aria-label={`Level ${lvl}`}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          safeLevel === lvl
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted hover:bg-muted/80",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
        onClick={() => handleLevelClick(lvl)}
        onKeyDown={(e) => handleKeyDown(e, lvl)}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-testid={`level-${lvl}`}
      >
        {lvl}
      </button>
    ));
  };

  // Navigation buttons for better accessibility
  const renderNavigationButtons = () => {
    if (disabled) return null;

    return (
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={() => {
            const currentIndex = levels.indexOf(safeLevel);
            if (currentIndex > 0) {
              const prevLevel = levels[currentIndex - 1];
              if (prevLevel !== undefined) {
                handleLevelClick(prevLevel);
              }
            }
          }}
          disabled={safeLevel === minLevel || disabled}
          className={cn(
            "p-1 rounded-full hover:bg-muted",
            safeLevel <= minLevel && "opacity-50 cursor-not-allowed",
          )}
          aria-label="Previous level"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm text-muted-foreground">
          Level {safeLevel} of {maxLevel}
        </span>

        <button
          type="button"
          onClick={() => {
            const currentIndex = levels.indexOf(safeLevel);
            if (currentIndex < levels.length - 1) {
              const nextLevel = levels[currentIndex + 1];
              if (nextLevel !== undefined) {
                handleLevelClick(nextLevel);
              }
            }
          }}
          disabled={safeLevel === maxLevel || disabled}
          className={cn(
            "p-1 rounded-full hover:bg-muted",
            safeLevel >= maxLevel && "opacity-50 cursor-not-allowed",
          )}
          aria-label="Next level"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <Card
      className={cn("w-full", disabled && "opacity-70", className)}
      data-testid={testId}
      aria-disabled={disabled}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex justify-between"
          role="radiogroup"
          aria-label={`${title} level selection`}
        >
          {renderLevelIndicators()}
        </div>
        {renderNavigationButtons()}
        {levelDescription && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">{levelDescription}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
