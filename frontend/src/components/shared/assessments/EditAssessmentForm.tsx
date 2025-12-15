import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateAssessment } from "@/hooks/assessments/useUpdateAssessment";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { Assessment } from "@/types/assessment";
import { LoadingSpinner } from "../../shared/LoadingSpinner";
import React from "react";
import { useTranslation } from "react-i18next";

/** form schema is defined inside the component to use translated messages */

type EditAssessmentFormValues = {
  name: string;
  dimensionIds: string[];
};

interface EditAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment;
}

export function EditAssessmentForm({
  isOpen,
  onClose,
  assessment,
}: EditAssessmentFormProps) {
  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const { mutate: updateAssessment, isPending: isUpdating } =
    useUpdateAssessment();

  const { t } = useTranslation();

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("assessments.validation.nameRequired")),
        dimensionIds: z
          .array(z.string())
          .min(1, t("assessments.validation.dimensionRequired")),
      }),
    [t],
  );

  const form = useForm<EditAssessmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: assessment.name,
      dimensionIds: [], // Add logic to get the dimensions of the assessment
    },
  });

  const onSubmit = (values: EditAssessmentFormValues) => {
    updateAssessment(
      {
        id: assessment.id,
        assessment: {
          name: values.name,
        },
      },
      {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("assessments.edit.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assessments.add.form.nameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("assessments.add.form.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dimensionIds"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>{t("assessments.add.form.dimensionsLabel")}</FormLabel>
                  </div>
                  {isLoadingDimensions ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dimensions?.map((dimension) => (
                        <FormItem
                          key={dimension.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(dimension.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...(field.value ?? []),
                                    dimension.id,
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(
                                      (value) => value !== dimension.id,
                                    ),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {dimension.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? t("assessments.edit.saving") : t("assessments.edit.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
