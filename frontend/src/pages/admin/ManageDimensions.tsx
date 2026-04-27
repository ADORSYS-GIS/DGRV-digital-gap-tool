import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddDimensionForm } from "@/components/admin/dimensions/AddDimensionForm";
import { DimensionList } from "@/components/admin/dimensions/DimensionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDimension } from "@/types/dimension";

const ALL_LANGS = ["en", "fr", "pt", "ss"];

export default function ManageDimensions() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch all languages in parallel so translation badges are accurate
  const langQueries = useQueries({
    queries: ALL_LANGS.map((lang) => ({
      queryKey: ["dimensions", lang],
      queryFn: () => dimensionRepository.getAll(lang),
      networkMode: "always" as const,
    })),
  });

  const isLoading = langQueries.some((q) => q.isLoading);
  const error = langQueries.find((q) => q.error)?.error as Error | undefined;

  // Merge all language results — DimensionList handles deduplication/grouping
  const dimensions = useMemo<IDimension[]>(
    () => langQueries.flatMap((q) => q.data ?? []),
    [langQueries],
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            {t("adminManageDimensions.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("adminManageDimensions.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 h-11 px-6 rounded-lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {t("adminManageDimensions.addBtn")}
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">{t("adminManageDimensions.error", { message: error.message })}</p>
      )}
      {dimensions && <DimensionList dimensions={dimensions} />}

      <AddDimensionForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
