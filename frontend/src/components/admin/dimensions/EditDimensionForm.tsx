import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Type, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDimension } from "@/hooks/dimensions/useUpdateDimension";
import { IDimension } from "@/types/dimension";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

const formSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("adminDimensions.validation.nameRequired")),
    description: z.string().optional(),
    language: z.string().min(1),
  });

type EditDimensionFormProps = {
  dimension: IDimension;
};

export const EditDimensionForm = ({ dimension }: EditDimensionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { mutate: updateDimension } = useUpdateDimension();

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      name: dimension.name,
      description: dimension.description ?? "",
      language: (dimension as any).language ?? "en",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: dimension.name,
        description: dimension.description ?? "",
        language: (dimension as any).language ?? "en",
      });
      setIsSubmitting(false);
    }
  }, [isOpen, form, dimension]);

  const onSubmit = (values: z.infer<ReturnType<typeof formSchema>>) => {
    setIsSubmitting(true);
    const dimensionToUpdate: Partial<IDimension> = {
      name: values.name,
      description: values.description ?? null,
      language: values.language,
    } as any;
    updateDimension(
      { id: dimension.id, dimension: dimensionToUpdate },
      {
        onSettled: () => {
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors"
        >
          <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent p-6 border-b border-blue-100">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Pencil className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t("adminDimensions.form.titleEdit")}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {t("adminDimensions.form.descEdit")}
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                {t("adminDimensions.form.name")}
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  {...form.register("name")}
                  className="pl-10 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                {t("adminDimensions.form.description")}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="description"
                  {...form.register("description")}
                  className="pl-10 min-h-[100px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700">
                Language
              </label>
              <ContentLanguageSelector
                value={form.watch("language")}
                onChange={(lang) => form.setValue("language", lang)}
                disabled={isSubmitting}
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>{" "}
                    {t("adminDimensions.form.updating")}
                  </span>
                ) : (
                  t("adminDimensions.updateBtn")
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
