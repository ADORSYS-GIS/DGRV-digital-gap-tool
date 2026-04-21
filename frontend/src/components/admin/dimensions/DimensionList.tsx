import { useMemo, useState } from "react";
import { IDimension } from "@/types/dimension";
import { DimensionCard } from "./DimensionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Layers, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AddTranslationForm } from "./AddTranslationForm";
import { Button } from "@/components/ui/button";

const FLAG: Record<string, string> = { en: "🇬🇧", fr: "🇫🇷", pt: "🇧🇷", ss: "🇸🇿" };
const LANG_LABEL: Record<string, string> = { en: "English", fr: "Français", pt: "Português", ss: "Siswati" };
const ALL_LANGS = ["en", "fr", "pt", "ss"];

interface DimensionListProps {
  dimensions: IDimension[];
}

export const DimensionList = ({ dimensions }: DimensionListProps) => {
  const { t } = useTranslation();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [translationTarget, setTranslationTarget] = useState<IDimension | null>(null);

  // Group by dimension_key — base (EN) + translations
  const groups = useMemo(() => {
    const map = new Map<string, IDimension[]>();
    for (const dim of dimensions) {
      const key = (dim as any).dimension_key ?? dim.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(dim);
    }
    // Sort each group so English is first
    return Array.from(map.entries()).map(([key, group]) => ({
      key,
      base: group.find((d) => (d as any).language === "en") ?? group[0],
      translations: group.filter((d) => (d as any).language !== "en"),
      allLangs: group.map((d) => (d as any).language ?? "en"),
    }));
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
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ key, base, translations, allLangs }) => {
          const isExpanded = expandedKey === key;
          const missingLangs = ALL_LANGS.filter((l) => l !== "en" && !allLangs.includes(l));

          return (
            <div key={key} className="flex flex-col">
              {/* Base English card */}
              <DimensionCard dimension={base} />

              {/* Translation status bar */}
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {/* Configured translations */}
                    {translations.map((tr) => {
                      const lang = (tr as any).language ?? "?";
                      return (
                        <span
                          key={tr.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                        >
                          {FLAG[lang] ?? "🌐"} {lang.toUpperCase()}
                        </span>
                      );
                    })}
                    {/* Missing languages */}
                    {missingLangs.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-dashed border-gray-300"
                      >
                        {FLAG[lang]} {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Add translation button */}
                    {missingLangs.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => setTranslationTarget(base)}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        Add
                      </Button>
                    )}
                    {/* Expand/collapse translations */}
                    {translations.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => setExpandedKey(isExpanded ? null : key)}
                      >
                        {isExpanded ? (
                          <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Hide</>
                        ) : (
                          <><ChevronDown className="h-3.5 w-3.5 mr-1" /> {translations.length} translation{translations.length > 1 ? "s" : ""}</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded translations */}
                {isExpanded && translations.length > 0 && (
                  <div className="mt-3 space-y-3 pl-3 border-l-2 border-indigo-100">
                    {translations.map((tr) => {
                      const lang = (tr as any).language ?? "?";
                      return (
                        <div key={tr.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800">{tr.name}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
                              {FLAG[lang] ?? "🌐"} {LANG_LABEL[lang] ?? lang}
                            </span>
                          </div>
                          {tr.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">{tr.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <DimensionCard dimension={tr} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Translation Dialog */}
      {translationTarget && (
        <AddTranslationForm
          isOpen={!!translationTarget}
          onClose={() => setTranslationTarget(null)}
          baseDimension={translationTarget}
          existingLanguages={
            groups
              .find((g) => g.key === ((translationTarget as any).dimension_key ?? translationTarget.id))
              ?.allLangs ?? ["en"]
          }
        />
      )}
    </>
  );
};
