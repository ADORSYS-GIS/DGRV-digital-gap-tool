import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteDimension } from "@/hooks/dimensions/useDeleteDimension";
import { IDimension } from "@/types/dimension";
import { Layers, Trash2, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SelectStateDialog } from "../levels/SelectStateDialog";
import { EditDimensionForm } from "./EditDimensionForm";

const FLAG: Record<string, string> = { en: "🇬🇧", fr: "🇫🇷", pt: "🇧🇷", ss: "🇸🇿" };

interface DimensionCardProps {
  dimension: IDimension;
  /** Other language versions of this same logical dimension */
  translations?: IDimension[];
}

export const DimensionCard = ({
  dimension,
  translations = [],
}: DimensionCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSelectStateDialogOpen, setSelectStateDialogOpen] = useState(false);
  const { mutate: deleteDimension, isPending: isDeleting } = useDeleteDimension();

  const handleDelete = () => deleteDimension(dimension.id);

  const handleStateSelect = (state: "current" | "desired") => {
    setSelectStateDialogOpen(false);
    const key = (dimension as any).dimension_key ?? dimension.id;
    navigate(`/admin/manage-levels/${key}?levelType=${state}`);
  };

  const handleViewTranslations = () => {
    const key = (dimension as any).dimension_key ?? dimension.id;
    navigate(`/admin/dimensions/${key}/translations`);
  };

  const lang = (dimension as any).language ?? "en";
  const configuredLangs = [lang, ...translations.map((tr) => (tr as any).language ?? "en")];
  const allLangs = ["en", "fr", "pt", "ss"];
  const missingCount = allLangs.filter((l) => l !== "en" && !configuredLangs.includes(l)).length;

  return (
    <>
      <Card className="group/card relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-col h-full">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 transition-all duration-500 group-hover/card:h-1.5" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 shadow-sm shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-bold text-gray-900 group-hover/card:text-primary transition-colors leading-tight">
                  {dimension.name}
                </CardTitle>
                {/* Language badge */}
                <span className="inline-flex items-center mt-1 gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {FLAG[lang] ?? "🌐"} {lang.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Translation status — top right */}
            <div className="shrink-0 flex flex-col items-end gap-1">
              {/* Configured translation flags */}
              {translations.length > 0 && (
                <div className="flex gap-0.5">
                  {translations.map((tr) => {
                    const tLang = (tr as any).language ?? "?";
                    return (
                      <span key={tr.id} title={tLang} className="text-sm leading-none">
                        {FLAG[tLang] ?? "🌐"}
                      </span>
                    );
                  })}
                </div>
              )}
              {/* Missing indicator */}
              {missingCount > 0 && (
                <span className="text-xs text-amber-500 font-medium">
                  {missingCount} missing
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow pb-3">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {dimension.description || <span className="italic text-gray-300">No description</span>}
          </p>
        </CardContent>

        <CardFooter className="flex-col items-stretch pt-0 pb-5 px-5 gap-2">
          {/* Primary action */}
          <Button
            onClick={() => setSelectStateDialogOpen(true)}
            className="w-full h-9 text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-sm border-0"
          >
            {t("adminDimensions.card.manageLevels")}
          </Button>

          {/* Secondary actions row */}
          <div className="grid grid-cols-3 gap-2">
            <EditDimensionForm dimension={dimension} />

            {/* Translations button */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-center gap-1"
              onClick={handleViewTranslations}
            >
              <Globe className="h-3.5 w-3.5" />
              {translations.length > 0 ? `${translations.length}` : "0"}
            </Button>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("adminDimensions.card.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("adminDimensions.delete.title")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("adminDimensions.delete.description")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                    {isDeleting ? t("adminDimensions.delete.deleting") : t("adminDimensions.delete.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>

      <SelectStateDialog
        isOpen={isSelectStateDialogOpen}
        onClose={() => setSelectStateDialogOpen(false)}
        onSelect={handleStateSelect}
      />
    </>
  );
};
