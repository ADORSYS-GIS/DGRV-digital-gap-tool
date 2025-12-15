import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddDimension } from "@/hooks/dimensions/useAddDimension";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const formSchema = z.object({
  name: z
    .string()
    .min(
      1,
      i18n.t("validation.dimensionNameRequired", {
        defaultValue: "Dimension name is required",
      }),
    ),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddDimensionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDimensionForm = ({
  isOpen,
  onClose,
}: AddDimensionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const addDimensionMutation = useAddDimension();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.dimensions.addTitle", { defaultValue: "Add New Dimension" })}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name")}
              placeholder={t("admin.dimensions.form.namePlaceholder", {
                defaultValue: "Dimension Name",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Textarea
              {...register("description")}
              placeholder={t("common.descriptionOptional", {
                defaultValue: "Description (optional)",
              })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addDimensionMutation.isPending}>
              {addDimensionMutation.isPending
                ? t("common.adding", { defaultValue: "Adding..." })
                : t("admin.dimensions.addAction", { defaultValue: "Add Dimension" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
