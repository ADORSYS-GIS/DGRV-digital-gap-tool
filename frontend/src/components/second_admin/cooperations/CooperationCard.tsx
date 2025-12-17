import React from "react";
import { Cooperation } from "@/types/cooperation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Handshake } from "lucide-react";
import { EditCooperationForm } from "./EditCooperationForm";
import { DeleteCooperationDialog } from "./DeleteCooperationDialog";

interface CooperationCardProps {
  /**
   * Cooperation entity to display.
   */
  cooperation: Cooperation;
  /**
   * Callback fired when the cooperation is updated from the edit form.
   */
  onUpdate: (cooperation: Cooperation) => void;
  /**
   * Callback fired when the cooperation is deleted.
   */
  onDelete: (id: string) => void;
}

/**
 * Presentational card for a single cooperation.
 * Follows the global UI/UX gold standard with a soft card, clear hierarchy
 * and a dedicated action area for edit/delete flows.
 */
export const CooperationCard: React.FC<CooperationCardProps> = ({
  cooperation,
  onUpdate,
  onDelete,
}) => {
  const initial = cooperation.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Card className="group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50/70 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-lg">
      {/* Accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 transition-all duration-300 group-hover/card:h-1.5" />

      <CardContent className="flex flex-1 flex-col justify-between gap-6 p-6 pt-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 shadow-sm transition-all duration-300 group-hover/card:from-primary/20 group-hover/card:to-primary/10 group-hover/card:ring-primary/20">
            <span className="sr-only">Cooperation</span>
            <Handshake className="hidden h-5 w-5 sm:block" aria-hidden="true" />
            <span
              className="text-base font-semibold sm:hidden"
              aria-hidden="true"
            >
              {initial}
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle
                className="truncate text-xl font-semibold tracking-tight text-foreground transition-colors group-hover/card:text-primary"
                title={cooperation.name}
              >
                {cooperation.name}
              </CardTitle>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Cooperative profile
            </p>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {cooperation.description ||
            "No description provided for this cooperative yet."}
        </p>

        <div className="mt-2 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
          <EditCooperationForm cooperation={cooperation} onUpdate={onUpdate} />
          <DeleteCooperationDialog
            cooperationId={cooperation.id}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
};
