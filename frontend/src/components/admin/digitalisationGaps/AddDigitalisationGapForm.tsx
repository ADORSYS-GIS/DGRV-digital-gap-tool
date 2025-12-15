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
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import {
  Gap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const formInputSchema = z.object({
  dimensionId: z
    .string()
    .min(1, i18n.t("validation.dimensionRequired", { defaultValue: "Dimension is required" })),
  gap_severity: z.nativeEnum(Gap),
  scope: z
    .string()
    .min(1, i18n.t("validation.scopeRequired", { defaultValue: "Scope is required" })),
});

type AddDigitalisationGapFormValues = z.infer<typeof formInputSchema>;

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
  const form = useForm<AddDigitalisationGapFormValues>({
    resolver: zodResolver(
      formInputSchema.refine(
        (data) => {
          if (digitalisationGap) {
            return true;
          }
          const existingGap = digitalisationGaps?.find(
            (gap) =>
              gap.dimensionId === data.dimensionId &&
              gap.gap_severity === data.gap_severity,
          );
          return !existingGap;
        },
        {
          message: i18n.t(
            "admin.digitalisationGaps.errors.duplicateSeverity",
            {
              defaultValue:
                "A gap with this severity already exists for this dimension.",
            },
          ),
          path: ["gap_severity"],
        },
      ),
    ),
    defaultValues: {
      dimensionId: "",
      gap_severity: Gap.MEDIUM,
      scope: "",
    },
  });

  const { data: dimensions } = useDimensions();
  const addMutation = useAddDigitalisationGap();
  const updateMutation = useUpdateDigitalisationGap();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog is closed
      form.reset({
        dimensionId: "",
        gap_severity: Gap.MEDIUM,
        scope: "",
      });
    } else if (digitalisationGap) {
      // Populate form for editing
      form.reset({
        dimensionId: digitalisationGap.dimensionId,
        gap_severity: digitalisationGap.gap_severity,
        scope: digitalisationGap.scope,
      });
    } else {
      // Reset to default for adding new gap when dialog is opened
      form.reset({
        dimensionId: "",
        gap_severity: Gap.MEDIUM,
        scope: "",
      });
    }
  }, [isOpen, digitalisationGap, form]);

  const onSubmit = (values: AddDigitalisationGapFormValues) => {
    const handleSuccess = () => {
      onClose();
    };

    if (digitalisationGap) {
      updateMutation.mutate(
        { ...values, id: digitalisationGap.id },
        { onSuccess: handleSuccess },
      );
    } else {
      addMutation.mutate(values, { onSuccess: handleSuccess });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {digitalisationGap
              ? t("admin.digitalisationGaps.dialog.editTitle", {
                  defaultValue: "Edit Digitalisation Gap",
                })
              : t("admin.digitalisationGaps.dialog.addTitle", {
                  defaultValue: "Add Digitalisation Gap",
                })}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dimensionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("common.dimension", { defaultValue: "Dimension" })}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("common.selectDimension", {
                            defaultValue: "Select a dimension",
                          })}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dimensions?.map((dim) => (
                        <SelectItem key={dim.id} value={dim.id}>
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
                  <FormLabel>
                    {t("admin.digitalisationGaps.form.gapSeverity", {
                      defaultValue: "Gap Severity",
                    })}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "admin.digitalisationGaps.form.selectSeverity",
                            { defaultValue: "Select a gap severity" },
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Gap).map((gapValue) => (
                        <SelectItem key={gapValue} value={gapValue}>
                          {
                            t(`gap.severity.${String(gapValue).toLowerCase()}`, {
                              defaultValue: String(gapValue),
                            })
                          }
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
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("common.scope", { defaultValue: "Scope" })}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "admin.digitalisationGaps.form.scopePlaceholder",
                        { defaultValue: "Describe the digital gap..." },
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {digitalisationGap
                  ? t("common.update", { defaultValue: "Update" })
                  : t("common.create", { defaultValue: "Create" })}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
