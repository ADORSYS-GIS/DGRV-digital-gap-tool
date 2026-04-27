import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Trash2, Plus } from "lucide-react";
import { useDeleteDimension } from "@/hooks/dimensions/useDeleteDimension";
import { AddTranslationForm } from "@/components/admin/dimensions/AddTranslationForm";
import { EditDimensionForm } from "@/components/admin/dimensions/EditDimensionForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDimension } from "@/types/dimension";
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

const FLAG: Record<string, string> = { en: "🇬🇧", fr: "🇫🇷", pt: "🇧🇷", ss: "🇸🇿" };
const LANG_LABEL: Record<string, string> = { en: "English", fr: "Français", pt: "Português", ss: "Siswati" };
const ALL_LANGS = ["en", "fr", "pt", "ss"];

export default function DimensionTranslationsPage() {
  const { dimensionKey } = useParams<{ dimensionKey: string }>();
  const navigate = useNavigate();
  const [isAddTranslationOpen, setAddTranslationOpen] = useState(false);
  const { mutate: deleteDimension, isPending: isDeleting } = useDeleteDimension();

  // Fetch all languages in parallel so we always see every translation
  const langQueries = useQueries({
    queries: ALL_LANGS.map((lang) => ({
      queryKey: ["dimensions", lang],
      queryFn: () => dimensionRepository.getAll(lang),
      networkMode: "always" as const,
    })),
  });

  const isLoading = langQueries.some((q) => q.isLoading);

  // Merge all language results and find the ones matching this dimensionKey
  const group = useMemo(() => {
    const allDimensions: IDimension[] = langQueries.flatMap((q) => q.data ?? []);
    const matching = allDimensions.filter(
      (d) => ((d as any).dimension_key ?? d.id) === dimensionKey,
    );
    // Deduplicate by language — keep the first occurrence of each language
    const seen = new Set<string>();
    return matching.filter((d) => {
      const lang = (d as any).language ?? (d as any).lang ?? "en";
      if (seen.has(lang)) return false;
      seen.add(lang);
      return true;
    });
  }, [langQueries, dimensionKey]);

  const base = group.find((d) => ((d as any).language ?? (d as any).lang) === "en") ?? group[0];
  const configuredLangs = group.map((d) => (d as any).language ?? (d as any).lang ?? "en");
  const missingLangs = ALL_LANGS.filter((l) => !configuredLangs.includes(l));

  if (isLoading) return <LoadingSpinner />;
  if (!base) return <p className="text-red-500 p-8">Dimension not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{base.name}</h1>
          <p className="text-sm text-muted-foreground">Manage translations for this dimension</p>
        </div>
      </div>

      {/* Translation progress */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <Globe className="h-5 w-5 text-gray-400 shrink-0" />
        <div className="flex flex-wrap gap-2 flex-1">
          {ALL_LANGS.map((lang) => {
            const exists = configuredLangs.includes(lang);
            return (
              <span
                key={lang}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  exists
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-gray-400 border-dashed border-gray-300"
                }`}
              >
                {FLAG[lang]} {LANG_LABEL[lang]}
                {exists && <span className="text-green-500">✓</span>}
              </span>
            );
          })}
        </div>
        {missingLangs.length > 0 && (
          <Button
            size="sm"
            onClick={() => setAddTranslationOpen(true)}
            className="shrink-0 h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Translation
          </Button>
        )}
      </div>

      {/* Language version cards */}
      <div className="space-y-4">
        {group
          .sort((a, b) => {
            const order = ["en", "fr", "pt", "ss"];
            return order.indexOf((a as any).language ?? (a as any).lang ?? "en") - order.indexOf((b as any).language ?? (b as any).lang ?? "en");
          })
          .map((dim) => {
            const lang = (dim as any).language ?? (dim as any).lang ?? "en";
            const isBase = lang === "en";
            return (
              <div
                key={dim.id}
                className={`rounded-xl border p-5 bg-white ${
                  isBase ? "border-primary/30 ring-1 ring-primary/10" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{FLAG[lang] ?? "🌐"}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{dim.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isBase ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {LANG_LABEL[lang] ?? lang}
                          {isBase && " (base)"}
                        </span>
                      </div>
                      {dim.description && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{dim.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <EditDimensionForm dimension={dim} />
                    {!isBase && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2 border-red-200 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this translation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the {LANG_LABEL[lang]} version of "{base.name}". The other language versions will remain.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDimension(dim.id)}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Translation Dialog */}
      {base && (
        <AddTranslationForm
          isOpen={isAddTranslationOpen}
          onClose={() => setAddTranslationOpen(false)}
          baseDimension={base}
          existingLanguages={configuredLangs}
        />
      )}
    </div>
  );
}
