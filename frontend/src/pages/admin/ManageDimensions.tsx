import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { AddDimensionForm } from "@/components/admin/dimensions/AddDimensionForm";
import { DimensionList } from "@/components/admin/dimensions/DimensionList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";

export default function ManageDimensions() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { data: dimensions, isLoading, error } = useDimensions();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("manageDimensions.title")}</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("manageDimensions.addDimension")}
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">{t("manageDimensions.errorMessage", { message: error.message })}</p>
      )}
      {dimensions && <DimensionList dimensions={dimensions} />}

      <AddDimensionForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
