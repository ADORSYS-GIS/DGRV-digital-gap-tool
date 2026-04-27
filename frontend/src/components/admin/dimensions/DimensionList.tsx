import { useMemo } from "react";
import { IDimension } from "@/types/dimension";
import { DimensionCard } from "./DimensionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DimensionListProps {
  dimensions: IDimension[];
}

export const DimensionList = ({ dimensions }: DimensionListProps) => {
  const { t } = useTranslation();

  // Group by dimension_key — base (EN) + translations
  const groups = useMemo(() => {
    const map = new Map<string, IDimension[]>();
    for (const dim of dimensions) {
      const key = (dim as any).dimension_key ?? dim.id;
      if (!map.has(key)) map.set(key, []);
      const existing = map.get(key)!;
      // Deduplicate: skip if we already have an entry with the same language
      const dimLang = (dim as any).language ?? (dim as any).lang ?? "en";
      const alreadyHasLang = existing.some(
        (d) => ((d as any).language ?? (d as any).lang ?? "en") === dimLang
      );
      if (!alreadyHasLang) {
        existing.push(dim);
      }
    }
    return Array.from(map.entries()).flatMap(([key, group]) => {
      if (group.length === 0) return [];
      const base = group.find((d) => ((d as any).language ?? (d as any).lang) === "en") ?? group[0];
      const translations = group.filter((d) => d.id !== base!.id);
      return [{ key, base: base!, translations }];
    });
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
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {groups.map(({ key, base, translations }) => (
        <DimensionCard
          key={key}
          dimension={base}
          translations={translations}
        />
      ))}
    </div>
  );
};
