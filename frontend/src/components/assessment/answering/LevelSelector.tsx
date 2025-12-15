import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LevelSelectorProps {
  /** The title of the level selector */
  title: string;
  /** Description text shown below the title */
  description: string;
  /** Current selected level (1-based) */
  level: number;
  /** Callback when the level changes */
  onChange: (value: number) => void;
  /** Maximum level available (default: 5) */
  maxLevel?: number;
  /** Minimum level available (default: 1) */
  minLevel?: number;
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
  maxLevel = 5,
  minLevel = 1,
  disabled = false,
  className,
  testId = "level-selector",
  levelDescription,
}: LevelSelectorProps) {
  const { t } = useTranslation();
  // Ensure level is within bounds
  useEffect(() => {
    if (level < minLevel || level > maxLevel) {
      console.warn(
        `Level ${level} is out of bounds. Clamping to [${minLevel}, ${maxLevel}]`,
      );
      onChange(Math.min(Math.max(minLevel, level), maxLevel));
    }
  }, [level, minLevel, maxLevel, onChange]);

  const levels = Array.from(
    { length: maxLevel - minLevel + 1 },
    (_, i) => minLevel + i,
  );

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

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleLevelClick(lvl);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (lvl > minLevel) handleLevelClick(lvl - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (lvl < maxLevel) handleLevelClick(lvl + 1);
          break;
        case "Home":
          e.preventDefault();
          handleLevelClick(minLevel);
          break;
        case "End":
          e.preventDefault();
          handleLevelClick(maxLevel);
          break;
      }
    },
    [disabled, handleLevelClick, minLevel, maxLevel],
  );

  // Ensure level is within bounds for rendering
  const safeLevel = Math.min(Math.max(minLevel, level), maxLevel);

  // Generate level indicators with visual representation
  const renderLevelIndicators = () => {
    return levels.map((lvl) => (
      <button
        key={lvl}
        type="button"
        role="radio"
        aria-checked={safeLevel === lvl ? "true" : "false"}
        aria-label={t("assessment.answering.levelAria", {
          level: lvl,
          defaultValue: `Level ${lvl}`,
        })}
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
          onClick={() => handleLevelClick(Math.max(minLevel, safeLevel - 1))}
          disabled={safeLevel <= minLevel || disabled}
          className={cn(
            "p-1 rounded-full hover:bg-muted",
            safeLevel <= minLevel && "opacity-50 cursor-not-allowed",
          )}
          aria-label={t("assessment.answering.previousLevel", {
            defaultValue: "Previous level",
          })}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm text-muted-foreground">
          {t("assessment.answering.levelOf", {
            current: safeLevel,
            max: maxLevel,
            defaultValue: `Level ${safeLevel} of ${maxLevel}`,
          })}
        </span>

        <button
          type="button"
          onClick={() => handleLevelClick(Math.min(maxLevel, safeLevel + 1))}
          disabled={safeLevel >= maxLevel || disabled}
          className={cn(
            "p-1 rounded-full hover:bg-muted",
            safeLevel >= maxLevel && "opacity-50 cursor-not-allowed",
          )}
          aria-label={t("assessment.answering.nextLevel", {
            defaultValue: "Next level",
          })}
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
          aria-label={t("assessment.answering.levelSelectionAria", {
            title,
            defaultValue: `${title} level selection`,
          })}
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
