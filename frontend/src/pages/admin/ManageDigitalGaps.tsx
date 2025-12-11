import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import { AddDigitalisationGapForm } from "@/components/admin/digitalisationGaps/AddDigitalisationGapForm";
import { DigitalisationGapList } from "@/components/admin/digitalisationGaps/DigitalisationGapList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";

export default function ManageDigitalGaps() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const {
    data: digitalisationGaps,
    isLoading,
    error,
  } = useDigitalisationGaps();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("manageDigitalGaps.title")}
        </h1>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("manageDigitalGaps.addDigitalisationGap")}
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          {t("manageDigitalGaps.errorMessage", { message: (error as Error).message })}
        </p>
      )}
      {digitalisationGaps && (
        <DigitalisationGapList digitalisationGaps={digitalisationGaps} />
      )}

      <AddDigitalisationGapForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
