import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
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
import { useAddAssessment } from "@/hooks/assessments/useAddAssessment";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoadingSpinner } from "../../shared/LoadingSpinner";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * i18n: schema is created inside the component to use translated messages
 */

type AddAssessmentFormValues = {
  name: string;
  cooperationId: string;
  dimensionIds: string[];
};

interface AddAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssessmentForm({ isOpen, onClose }: AddAssessmentFormProps) {
  const organizationId = useOrganizationId();

  const { t } = useTranslation();

  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("assessments.validation.nameRequired")),
        cooperationId: z
          .string()
          .min(1, t("assessments.validation.cooperationRequired")),
        dimensionIds: z
          .array(z.string())
          .min(1, t("assessments.validation.dimensionRequired")),
      }),
    [t],
  );

  const { data: allDimensions, isLoading: isLoadingDimensions } =
    useDimensions();
  const { data: assignedDimensionIds, isLoading: isLoadingAssigned } =
    useOrganizationDimensions(organizationId || "");

  const { data: cooperations, isLoading: isLoadingCooperations } =
    useCooperations();
  const { mutate: addAssessment, isPending: isAdding } = useAddAssessment();

  const assignedDimensions =
    allDimensions?.filter((d) => assignedDimensionIds?.includes(d.id)) || [];

  const form = useForm<AddAssessmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dimensionIds: [],
      cooperationId: "",
    },
  });

  const onSubmit = (values: AddAssessmentFormValues) => {
    if (!organizationId) return;
    addAssessment(
      {
        assessment_name: values.name,
        dimensions_id: values.dimensionIds,
        cooperation_id: values.cooperationId,
        organization_id: organizationId,
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
          <DialogTitle>{t("assessments.add.title")}</DialogTitle>
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
              name="cooperationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assessments.add.form.cooperationLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCooperations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "assessments.add.form.cooperationPlaceholder",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cooperations?.map((cooperation) => (
                        <SelectItem key={cooperation.id} value={cooperation.id}>
                          {cooperation.name}
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
              name="dimensionIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assessments.add.form.dimensionsLabel")}</FormLabel>
                  {isLoadingDimensions || isLoadingAssigned ? (
                    <LoadingSpinner />
                  ) : (
                    <MultiSelect
                      options={assignedDimensions.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder={t(
                        "assessments.add.form.dimensionsPlaceholder",
                      )}
                      maxCount={3}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding
                  ? t("assessments.add.creating")
                  : t("assessments.add.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
