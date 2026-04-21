import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import { AddDigitalisationGapForm } from "@/components/admin/digitalisationGaps/AddDigitalisationGapForm";
import { DigitalisationGapList } from "@/components/admin/digitalisationGaps/DigitalisationGapList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { AdminLangFilterBar } from "@/components/shared/AdminLangFilterBar";
import { useAdminLangFilter } from "@/hooks/useAdminLangFilter";

export default function ManageDigitalGaps() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { lang, setLang } = useAdminLangFilter();
  const {
    data: digitalisationGaps,
    isLoading,
    error,
  } = useDigitalisationGaps(lang);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            {t("adminManageDigitalGaps.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("adminManageDigitalGaps.subtitle")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 h-11 px-6 rounded-lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {t("adminManageDigitalGaps.addBtn")}
          </Button>
        </div>
      </div>

      <AdminLangFilterBar value={lang} onChange={setLang} />

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          {t("adminManageDigitalGaps.error", { message: (error as Error).message })}
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
