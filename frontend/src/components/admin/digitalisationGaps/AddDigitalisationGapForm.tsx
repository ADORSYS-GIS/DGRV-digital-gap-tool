import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddDigitalisationGap } from "@/hooks/digitalisationGaps/useAddDigitalisationGap";
import { useUpdateDigitalisationGap } from "@/hooks/digitalisationGaps/useUpdateDigitalisationGap";
import { useLogicalDimensions } from "@/hooks/dimensions/useLogicalDimensions";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import {
  Gap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Layers, Activity, FileText } from "lucide-react";
import * as z from "zod";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

interface AddDigitalisationGapFormProps {
  isOpen: boolean;
  onClose: () => void;
  digitalisationGap?: IDigitalisationGapWithDimension;
}

export function AddDigitalisationGapForm({
  isOpen,
  onClose,
  digitalisationGap,
}: AddDigitalisationGapFormProps) {
  const { t } = useTranslation();
  const { data: digitalisationGaps } = useDigitalisationGaps();

  const formInputSchema = z.object({
    dimensionKey: z.string().min(1, t("adminGaps.validation.dimensionRequired")),
    gap_severity: z.nativeEnum(Gap),
    description: z.string().min(1, t("adminGaps.validation.descriptionRequired")),
    language: z.string().min(1),
  });

  type AddDigitalisationGapFormValues = z.infer<typeof formInputSchema>;

  const form = useForm<AddDigitalisationGapFormValues>({
    resolver: zodResolver(
      formInputSchema.refine(
        (data) => {
          if (digitalisationGap) {
            return true;
          }
          const existingGap = digitalisationGaps?.find(
            (gap) =>
              (gap as any).dimension_key === data.dimensionKey &&
              gap.gap_severity === data.gap_severity,
          );
          return !existingGap;
        },
        {
          message: t("adminGaps.validation.duplicateGap"),
          path: ["gap_severity"],
        },
      ),
    ),
    defaultValues: {
      dimensionKey: "",
      gap_severity: Gap.MEDIUM,
      description: "",
      language: "en",
    },
  });

  const { data: logicalDimensions } = useLogicalDimensions();
  const addMutation = useAddDigitalisationGap();
  const updateMutation = useUpdateDigitalisationGap();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog is closed
      form.reset({
        dimensionKey: "",
        gap_severity: Gap.MEDIUM,
        description: "",
        language: "en",
      });
    } else if (digitalisationGap) {
      form.reset({
        dimensionKey: (digitalisationGap as any).dimensionKey || (digitalisationGap as any).dimension_key || "",
        gap_severity: digitalisationGap.gap_severity,
        description: digitalisationGap.description,
        language: (digitalisationGap as any).language || "en",
      });
    } else {
      form.reset({
        dimensionKey: "",
        gap_severity: Gap.MEDIUM,
        description: "",
        language: "en",
      });
    }
  }, [isOpen, digitalisationGap, form]);

  const onSubmit = (values: AddDigitalisationGapFormValues) => {
    const handleSuccess = () => {
      onClose();
    };

    if (digitalisationGap) {
      updateMutation.mutate(
        { ...values, id: digitalisationGap.id, dimensionId: values.dimensionKey },
        { onSuccess: handleSuccess },
      );
    } else {
      addMutation.mutate({ ...values, dimensionId: values.dimensionKey }, { onSuccess: handleSuccess });
    }  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {digitalisationGap
                  ? t("adminGaps.form.titleEdit")
                  : t("adminGaps.form.titleAdd")}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {digitalisationGap
                ? t("adminGaps.form.descEdit")
                : t("adminGaps.form.descAdd")}
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="dimensionKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {t("adminGaps.form.dimension")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                            <SelectValue
                              placeholder={t("adminGaps.form.selectDimension")}
                            />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {logicalDimensions?.map((dim) => (
                          <SelectItem key={dim.dimension_key} value={dim.dimension_key}>
                            {dim.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gap_severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {t("adminGaps.form.severity")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                            <SelectValue
                              placeholder={t("adminGaps.form.selectSeverity")}
                            />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Gap).map((gapValue) => (
                          <SelectItem key={gapValue} value={gapValue}>
                            {gapValue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      {t("adminGaps.form.description")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          placeholder={t("adminGaps.form.descPlaceholder")}
                          className="pl-10 min-h-[100px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel className="text-gray-700">Language</FormLabel>
                <ContentLanguageSelector
                  value={form.watch("language")}
                  onChange={(lang) => form.setValue("language", lang)}
                  disabled={addMutation.isPending || updateMutation.isPending}
                />
              </FormItem>
              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {addMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>{" "}
                      {t("adminGaps.form.saving")}
                    </span>
                  ) : digitalisationGap ? (
                    t("adminGaps.updateBtn")
                  ) : (
                    t("adminGaps.createBtn")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
