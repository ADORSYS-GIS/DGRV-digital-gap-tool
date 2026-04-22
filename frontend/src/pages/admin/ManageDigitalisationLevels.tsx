import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AddLevelForm } from "@/components/admin/levels/AddLevelForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LevelsList } from "@/components/admin/levels/LevelsList";
import { LevelType } from "@/types/digitalisationLevel";
import { useTranslation } from "react-i18next";
import { AdminLangFilterBar } from "@/components/shared/AdminLangFilterBar";
import { useAdminLangFilter } from "@/hooks/useAdminLangFilter";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { useQuery } from "@tanstack/react-query";

export default function ManageDigitalisationLevels() {
  const { t } = useTranslation();
  const { dimensionId: dimensionKeyOrId } = useParams<{ dimensionId: string }>();
  const [searchParams] = useSearchParams();
  const levelType = searchParams.get("levelType") as LevelType | null;
  const [isAddLevelDialogOpen, setAddLevelDialogOpen] = useState(false);
  const { lang, setLang } = useAdminLangFilter();

  // Resolve the actual dimension_id for the selected language (needed for AddLevelForm)
  const { data: resolvedDimensionId } = useQuery({
    queryKey: ["resolveDimensionId", dimensionKeyOrId, lang],
    queryFn: async () => {
      if (!dimensionKeyOrId) return dimensionKeyOrId;
      const allDims = await dimensionRepository.getAll("all");
      const targetLang = lang === "all" ? "en" : lang;
      const match = allDims.find(
        (d) => (d as any).dimension_key === dimensionKeyOrId && (d as any).language === targetLang,
      );
      // If found by dimension_key, return the language-specific dimension_id
      if (match) return match.id;
      // If dimensionKeyOrId is already a dimension_id, return it directly
      const byId = allDims.find((d) => d.id === dimensionKeyOrId);
      return byId?.id ?? dimensionKeyOrId;
    },
    enabled: !!dimensionKeyOrId,
  });

  const {
    data: levels,
    isLoading,
    error,
  } = useDigitalisationLevels(dimensionKeyOrId!, lang);

  const filteredLevels = useMemo(() => {
    if (!levels || !levelType) return [];
    return levels.filter((l) => l.levelType === levelType);
  }, [levels, levelType]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error.message}</p>;
  if (!levelType) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold">{t("adminManageDigitalLevels.selectType")}</h1>
      </div>
    );
  }

  const title =
    levelType === "current" ? t("adminManageDigitalLevels.titleCurrent") : t("adminManageDigitalLevels.titleDesired");

  const effectiveDimensionId = resolvedDimensionId ?? dimensionKeyOrId!;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      <AdminLangFilterBar value={lang} onChange={setLang} />

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {t("adminManageDigitalLevels.cardTitle")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {t("adminManageDigitalLevels.cardSubtitle", { type: levelType })}
              </CardDescription>
            </div>
            <Button
              onClick={() => setAddLevelDialogOpen(true)}
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("adminManageDigitalLevels.addBtn")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <LevelsList levels={filteredLevels} />
        </CardContent>
      </Card>

      <AddLevelForm
        isOpen={isAddLevelDialogOpen}
        onClose={() => setAddLevelDialogOpen(false)}
        dimensionId={effectiveDimensionId}
        levelType={levelType}
        existingLevels={filteredLevels}
        defaultLanguage={lang === "all" ? "en" : lang}
      />
    </div>
  );
}
