import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddDimension } from "@/hooks/dimensions/useAddDimension";
import { Globe, Type, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContentLanguageSelector, CONTENT_LANGUAGES } from "@/components/shared/ContentLanguageSelector";
import { IDimension } from "@/types/dimension";

const LANG_FLAGS: Record<string, string> = { en: "🇬🇧", fr: "🇫🇷", pt: "🇧🇷", ss: "🇸🇿" };

const formSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("adminDimensions.validation.nameRequired")),
    description: z.string().optional(),
    language: z.string().min(1),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

interface AddTranslationFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** The English base dimension being translated */
  baseDimension: IDimension;
  /** Languages already configured for this dimension_key */
  existingLanguages: string[];
}

export const AddTranslationForm = ({
  isOpen,
  onClose,
  baseDimension,
  existingLanguages,
}: AddTranslationFormProps) => {
  const { t } = useTranslation();
  const addDimensionMutation = useAddDimension();

  // Available languages = all except English (base) and already configured ones
  const availableLanguages = CONTENT_LANGUAGES.filter(
    (l) => l.code !== "en" && !existingLanguages.includes(l.code),
  );

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: { name: "", description: "", language: availableLanguages[0]?.code ?? "fr" },
  });

  useEffect(() => {
    if (!isOpen) reset();
    else if (availableLanguages.length > 0) {
      setValue("language", availableLanguages[0].code);
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    addDimensionMutation.mutate(
      {
        name: data.name,
        language: data.language,
        dimension_key: (baseDimension as any).dimension_key ?? baseDimension.id,
        ...(data.description && { description: data.description }),
      } as any,
      { onSettled: onClose },
    );
  };

  if (availableLanguages.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>All translations configured</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-4">
            This dimension already has translations in all available languages.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/50 to-transparent p-6 border-b border-indigo-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <Globe className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Add Translation
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              Translating: <span className="font-semibold text-gray-700">{baseDimension.name}</span>
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          {/* Existing languages indicator */}
          <div className="flex flex-wrap gap-2 mb-5">
            {existingLanguages.map((lang) => (
              <span key={lang} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                {LANG_FLAGS[lang] ?? "🌐"} {lang.toUpperCase()} ✓
              </span>
            ))}
            {availableLanguages.map((lang) => (
              <span key={lang.code} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-dashed border-gray-300">
                {lang.flag} {lang.code.toUpperCase()} missing
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <ContentLanguageSelector
                value={watch("language")}
                onChange={(lang) => setValue("language", lang)}
                disabled={addDimensionMutation.isPending}
                filterOut={["en", ...existingLanguages.filter(l => l !== "en")]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("adminDimensions.form.name")}
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register("name")}
                  placeholder="Translated name"
                  className="pl-10 h-11 rounded-lg border-gray-200"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("adminDimensions.form.description")}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  {...register("description")}
                  placeholder="Translated description"
                  className="pl-10 min-h-[100px] rounded-lg border-gray-200 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-lg">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addDimensionMutation.isPending}
                className="flex-1 h-11 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium"
              >
                {addDimensionMutation.isPending ? "Saving..." : "Save Translation"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
