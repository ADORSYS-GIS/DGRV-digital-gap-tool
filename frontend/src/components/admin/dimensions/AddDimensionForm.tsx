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
import { Layers, Type, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

const formSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("adminDimensions.validation.nameRequired")),
    description: z.string().optional(),
    language: z.string().min(1),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

interface AddDimensionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDimensionForm = ({
  isOpen,
  onClose,
}: AddDimensionFormProps) => {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      language: data.language,
      ...(data.description && { description: data.description }),
    };
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                {t("adminDimensions.form.name")}
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register("name")}
                  placeholder={t("adminDimensions.form.namePlaceholderAdd")}
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
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                {t("adminDimensions.form.description")}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  {...register("description")}
                  placeholder={t("adminDimensions.form.descPlaceholderAdd")}
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
                disabled={addDimensionMutation.isPending}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                {addDimensionMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>{" "}
                    {t("adminDimensions.form.saving")}
                  </span>
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
