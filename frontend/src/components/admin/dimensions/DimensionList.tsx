import { useMemo } from "react";
import { IDimension } from "@/types/dimension";
import { DimensionCard } from "./DimensionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

const FLAG: Record<string, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  pt: "🇧🇷",
  ss: "🇸🇿",
};

interface DimensionListProps {
  dimensions: IDimension[];
}

export const DimensionList = ({ dimensions }: DimensionListProps) => {
  const { t } = useTranslation();

  // Group by dimension_key — all language versions of the same logical dimension
  const groups = useMemo(() => {
    const map = new Map<string, IDimension[]>();
    for (const dim of dimensions) {
      const key = (dim as any).dimension_key ?? dim.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(dim);
    }
    return Array.from(map.entries());
  }, [dimensions]);

  if (dimensions.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title={t("adminDimensions.list.emptyTitle")}
        description={t("adminDimensions.list.emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([dimensionKey, group]) => {
        const hasMultiple = group.length > 1;

        if (!hasMultiple) {
          // Single language — render plain card
          return (
            <div key={dimensionKey}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DimensionCard dimension={group[0]} />
              </div>
            </div>
          );
        }

        // Multiple languages — render as a grouped block
        return (
          <div
            key={dimensionKey}
            className="rounded-2xl border border-primary/20 bg-primary/2 p-4 space-y-3"
          >
            {/* Group header */}
            <div className="flex items-center gap-2 px-1">
              <Layers className="h-4 w-4 text-primary/60" />
              <span className="text-xs font-semibold text-primary/70 uppercase tracking-wide">
                Logical Dimension — {group.length} translations
              </span>
              <div className="flex gap-1 ml-1">
                {group.map((d) => {
                  const lang = (d as any).language ?? "en";
                  return (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600"
                    >
                      {FLAG[lang] ?? "🌐"} {lang.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Cards in a row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.map((dimension) => (
                <DimensionCard key={dimension.id} dimension={dimension} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
