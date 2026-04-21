import React from "react";
import { Lightbulb, Layers, AlertCircle, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useAddRecommendation } from "@/hooks/recommendations/useAddRecommendation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogicalDimensions } from "@/hooks/dimensions/useLogicalDimensions";
import { useRecommendations } from "@/hooks/recommendations/useRecommendations";
import { IRecommendation } from "@/types/recommendation";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

// Define the form schema with Zod
const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

type RecommendationPriority = z.infer<typeof PriorityEnum>;

type FormValues = {
  dimension_key: string;
  priority: RecommendationPriority;
  description: string;
  language: string;
};

const createFormSchema = (
  existingRecommendations: Array<{
    dimension_key: string;
    priority: RecommendationPriority;
  }>,
  t: TFunction,
) => {
  return z
    .object({
      dimension_key: z.string().min(1, t("adminRecommendations.validation.dimensionRequired")),
      priority: PriorityEnum,
      description: z.string().min(1, t("adminRecommendations.validation.descriptionRequired")),
      language: z.string().min(1),
    })
    .refine(
      (data) => {
        const exists = existingRecommendations.some(
          (rec) =>
            rec.dimension_key === data.dimension_key &&
            rec.priority === data.priority,
        );
        return !exists;
      },
      {
        message: t("adminRecommendations.validation.alreadyExists"),
        path: ["priority"],
      },
    );
};

interface AddRecommendationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRecommendationForm({
  isOpen,
  onClose,
}: AddRecommendationFormProps) {
  const { t } = useTranslation();
  const addRecommendation = useAddRecommendation();
  const { data: logicalDimensions = [] } = useLogicalDimensions();
  const { data: existingRecommendations = [] } = useRecommendations();

  // Get existing dimension_key-priority pairs for validation
  const existingDimensionPriorities = existingRecommendations
    .filter(
      (rec): rec is IRecommendation =>
        rec.dimension_id !== undefined && rec.priority !== undefined,
    )
    .map((rec) => ({
      dimension_key: (rec as any).dimension_key ?? rec.dimension_id,
      priority: rec.priority as RecommendationPriority,
    }));

  const formSchema = createFormSchema(existingDimensionPriorities, t);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimension_key: "",
      priority: "MEDIUM",
      description: "",
      language: "en",
    },
    mode: "onChange",
  });

  // Reset form when opening/closing the dialog
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        dimension_key: "",
        priority: "MEDIUM",
        description: "",
        language: "en",
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await addRecommendation.mutateAsync({
        dimension_key: data.dimension_key,
        priority: data.priority,
        description: data.description,
        language: data.language,
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to add recommendation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t("adminRecommendations.form.titleAdd")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pl-12">
              {t("adminRecommendations.form.descAdd")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5">
                <FormField
                  control={form.control}
                  name="dimension_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        {t("adminRecommendations.form.dimension")} *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                              <SelectValue placeholder={t("adminRecommendations.form.dimPlaceholder")} />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {logicalDimensions.map((dim) => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        {t("adminRecommendations.form.priority")} *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                              <SelectValue placeholder={t("adminRecommendations.form.prioPlaceholder")} />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">{t("adminRecommendations.priorities.low")}</SelectItem>
                          <SelectItem value="MEDIUM">{t("adminRecommendations.priorities.medium")}</SelectItem>
                          <SelectItem value="HIGH">{t("adminRecommendations.priorities.high")}</SelectItem>
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
                        {t("adminRecommendations.form.description")} *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            placeholder={t("adminRecommendations.form.descPlaceholder")}
                            className="pl-10 min-h-[120px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-gray-700">Language *</FormLabel>
                  <ContentLanguageSelector
                    value={form.watch("language")}
                    onChange={(lang) => form.setValue("language", lang)}
                    disabled={addRecommendation.isPending}
                  />
                </FormItem>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={addRecommendation.isPending}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={addRecommendation.isPending}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {addRecommendation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> {t("adminRecommendations.form.adding")}
                    </span>
                  ) : (
                    t("adminRecommendations.addBtn")
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
