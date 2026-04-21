import React from "react";
import { Pencil, Layers, AlertCircle, FileText } from "lucide-react";
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
import { useUpdateRecommendation } from "@/hooks/recommendations/useUpdateRecommendation";
import {
  IRecommendation,
  IUpdateRecommendationRequest,
} from "@/types/recommendation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useRecommendations } from "@/hooks/recommendations/useRecommendations";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

// Define the form schema with Zod
const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

type RecommendationPriority = z.infer<typeof PriorityEnum>;

type FormValues = {
  dimension_id: string;
  priority: RecommendationPriority;
  description: string;
  language: string;
};

const createFormSchema = (
  existingRecommendations: Array<{
    dimension_id: string;
    priority: RecommendationPriority;
    id?: string; // For excluding the current recommendation when editing
  }>,
  t: TFunction,
  currentRecommendationId?: string,
) => {
  return z
    .object({
      dimension_id: z.string().min(1, t("adminRecommendations.validation.dimensionRequired")),
      priority: PriorityEnum,
      description: z.string().min(1, t("adminRecommendations.validation.descriptionRequired")),
      language: z.string().min(1),
    })
    .refine(
      (data) => {
        // Check if there's already a recommendation with the same dimension and priority
        // but exclude the current recommendation being edited
        const exists = existingRecommendations.some(
          (rec) =>
            rec.id !== currentRecommendationId &&
            rec.dimension_id === data.dimension_id &&
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

interface EditRecommendationFormProps {
  recommendation: IRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRecommendationForm({
  recommendation,
  isOpen,
  onClose,
}: EditRecommendationFormProps) {
  const { t } = useTranslation();
  const updateRecommendation = useUpdateRecommendation();
  const { data: dimensions = [] } = useDimensions();
  const { data: existingRecommendations = [] } = useRecommendations();

  // Get existing dimension-priority pairs for validation, excluding the current recommendation
  const existingDimensionPriorities = existingRecommendations
    .filter(
      (rec): rec is IRecommendation =>
        rec.dimension_id !== undefined && rec.priority !== undefined,
    )
    .map((rec) => ({
      id: rec.id,
      dimension_id: rec.dimension_id,
      priority: rec.priority as RecommendationPriority,
    }));

  const formSchema = createFormSchema(
    existingDimensionPriorities,
    t,
    recommendation?.id,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimension_id: recommendation?.dimension_id || "",
      priority: (recommendation?.priority as RecommendationPriority) || "MEDIUM",
      description: recommendation?.description || "",
      language: (recommendation as any)?.language || "en",
    },
    mode: "onChange",
  });

  // Reset form when recommendation changes or when opening the dialog
  React.useEffect(() => {
    if (recommendation) {
      form.reset({
        dimension_id: recommendation.dimension_id,
        priority: recommendation.priority as RecommendationPriority,
        description: recommendation.description,
        language: (recommendation as any).language || "en",
      });
    }
  }, [recommendation, form, isOpen]);

  const onSubmit = async (data: FormValues) => {
    if (!recommendation) return;

    const updateData: IUpdateRecommendationRequest = {
      id: recommendation.id,
      ...data,
    };
    try {
      await updateRecommendation.mutateAsync(updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update recommendation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent p-6 border-b border-blue-100">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Pencil className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t("adminRecommendations.form.titleEdit")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pl-12">
              {t("adminRecommendations.form.descEdit")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5">
                <FormField
                  control={form.control}
                  name="dimension_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        {t("adminRecommendations.form.dimension")} *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={updateRecommendation.isPending}
                      >
                        <FormControl>
                          <div className="relative">
                            <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all">
                              <SelectValue placeholder={t("adminRecommendations.form.dimPlaceholder")} />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {dimensions.map((dimension) => (
                            <SelectItem key={dimension.id} value={dimension.id}>
                              {dimension.name}
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
                        disabled={updateRecommendation.isPending}
                      >
                        <FormControl>
                          <div className="relative">
                            <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all">
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
                            className="pl-10 min-h-[120px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all resize-none"
                            disabled={updateRecommendation.isPending}
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
                    disabled={updateRecommendation.isPending}
                  />
                </FormItem>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updateRecommendation.isPending}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={updateRecommendation.isPending}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {updateRecommendation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> {t("adminRecommendations.form.updating")}
                    </span>
                  ) : (
                    t("adminRecommendations.updateBtn")
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
