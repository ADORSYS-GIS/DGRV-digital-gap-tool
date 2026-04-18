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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dimensions.map((dimension) => (
        <DimensionCard key={dimension.id} dimension={dimension} />
      ))}
    </div>
  );
};
