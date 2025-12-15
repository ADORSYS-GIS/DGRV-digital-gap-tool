import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const formSchema = z.object({
  name: z
    .string()
    .min(
      1,
      i18n.t("validation.dimensionNameRequired", {
        defaultValue: "Name is required",
      }),
    ),
  description: z.string().optional(),
});

type EditDimensionFormProps = {
  dimension: IDimension;
};

export const EditDimensionForm = ({ dimension }: EditDimensionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: updateDimension } = useUpdateDimension();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: dimension.name,
      description: dimension.description ?? "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: dimension.name,
        description: dimension.description ?? "",
      });
      setIsSubmitting(false);
    }
  }, [isOpen, form, dimension]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const dimensionToUpdate: Partial<IDimension> = {
      name: values.name,
      description: values.description ?? null,
    };
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
        <Button variant="outline" className="flex-1">
          <Pencil className="mr-2 h-4 w-4" /> {t("common.edit", { defaultValue: "Edit" })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("admin.dimensions.editTitle", { defaultValue: "Edit Dimension" })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name">
              {t("common.name", { defaultValue: "Name" })}
            </label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description">
              {t("common.description", { defaultValue: "Description" })}
            </label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("common.updating", { defaultValue: "Updating..." })
              : t("admin.dimensions.updateAction", { defaultValue: "Update Dimension" })}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
