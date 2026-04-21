import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddDimension } from "@/hooks/dimensions/useAddDimension";
import { useLogicalDimensions } from "@/hooks/dimensions/useLogicalDimensions";
import { Layers, Type, FileText, Globe, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

const formSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("adminDimensions.validation.nameRequired")),
    description: z.string().optional(),
    language: z.string().min(1),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;
type Mode = "new" | "translation";

interface AddDimensionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDimensionForm = ({
  isOpen,
  onClose,
}: AddDimensionFormProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("new");
  const [selectedDimensionKey, setSelectedDimensionKey] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: { name: "", description: "", language: "en" },
  });

  const addDimensionMutation = useAddDimension();
  const { data: logicalDimensions = [] } = useLogicalDimensions();

  useEffect(() => {
    if (!isOpen) {
      reset();
      setMode("new");
      setSelectedDimensionKey("");
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    const payload: any = {
      name: data.name,
      language: data.language,
      ...(data.description && { description: data.description }),
    };

    // If adding a translation, pass the existing dimension_key so the backend
    // links this row to the same logical dimension
    if (mode === "translation" && selectedDimensionKey) {
      payload.dimension_key = selectedDimensionKey;
    }

    addDimensionMutation.mutate(payload, {
      onSettled: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t("adminDimensions.form.titleAdd")}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {t("adminDimensions.form.descAdd")}
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                mode === "new"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              New Dimension
            </button>
            <button
              type="button"
              onClick={() => setMode("translation")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                mode === "translation"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Globe className="h-4 w-4" />
              Add Translation
            </button>
          </div>

          {/* Translation mode: pick which dimension to translate */}
          {mode === "translation" && (
            <div className="space-y-2 mb-5">
              <label className="text-sm font-medium text-gray-700">
                Translate which dimension?
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={selectedDimensionKey}
                  onValueChange={setSelectedDimensionKey}
                >
                  <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select a dimension to translate" />
                  </SelectTrigger>
                  <SelectContent>
                    {logicalDimensions.map((dim) => (
                      <SelectItem key={dim.dimension_key} value={dim.dimension_key}>
                        {dim.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {mode === "translation" && !selectedDimensionKey && (
                <p className="text-amber-600 text-xs">
                  Select the dimension you want to add a translation for.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700">
                {t("adminDimensions.form.name")}
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register("name")}
                  placeholder={
                    mode === "translation"
                      ? "Translated name"
                      : t("adminDimensions.form.namePlaceholderAdd")
                  }
                  className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700">
                {t("adminDimensions.form.description")}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  {...register("description")}
                  placeholder={
                    mode === "translation"
                      ? "Translated description"
                      : t("adminDimensions.form.descPlaceholderAdd")
                  }
                  className="pl-10 min-h-[100px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700">
                Language
              </label>
              <ContentLanguageSelector
                value={watch("language")}
                onChange={(lang) => setValue("language", lang)}
                disabled={addDimensionMutation.isPending}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={
                  addDimensionMutation.isPending ||
                  (mode === "translation" && !selectedDimensionKey)
                }
                className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                {addDimensionMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>{" "}
                    {t("adminDimensions.form.saving")}
                  </span>
                ) : mode === "translation" ? (
                  "Save Translation"
                ) : (
                  t("adminDimensions.createBtn")
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
