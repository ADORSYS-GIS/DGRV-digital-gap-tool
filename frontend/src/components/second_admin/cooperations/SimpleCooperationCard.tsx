import { Cooperation } from "@/types/cooperation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Handshake } from "lucide-react";

interface SimpleCooperationCardProps {
  cooperation: Cooperation;
}

/**
 * Compact cooperation card used for selection flows (e.g. manage users).
 * Intentionally simpler than the main management cards but visually aligned.
 */
export const SimpleCooperationCard = ({
  cooperation,
}: SimpleCooperationCardProps) => {
  const initial = cooperation.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Card className="group/card relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/25 via-primary to-primary/25 opacity-90 transition-all duration-200 group-hover/card:h-1.5" />
      <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5 pt-7">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <span className="sr-only">Cooperation</span>
            <Handshake className="hidden h-5 w-5 sm:block" aria-hidden="true" />
            <span className="text-sm font-semibold sm:hidden" aria-hidden="true">
              {initial}
            </span>
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle
              className="truncate text-base font-semibold text-foreground group-hover/card:text-primary"
              title={cooperation.name}
            >
              {cooperation.name}
            </CardTitle>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {cooperation.description ||
                "No description provided for this cooperative yet."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
