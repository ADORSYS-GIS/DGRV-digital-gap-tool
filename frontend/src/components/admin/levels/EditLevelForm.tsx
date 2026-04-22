import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDigitalisationLevel } from "@/hooks/digitalisationLevels/useUpdateDigitalisationLevel";
import { IDigitalisationLevel, LevelState } from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { ContentLanguageSelector } from "@/components/shared/ContentLanguageSelector";

const formSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("adminLevels.validation.titleRequired")),
    description: z.string().min(1, t("adminLevels.validation.descRequired")),
    state: z
      .number()
      .min(1, t("adminLevels.validation.stateRequired"))
      .refine((state) => state !== 0, t("adminLevels.validation.idRequired")),
    language: z.string().min(1),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

interface EditLevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  level: IDigitalisationLevel;
  existingLevels: IDigitalisationLevel[];
}

export const EditLevelForm = ({
  isOpen,
  onClose,
  level,
  existingLevels,
}: EditLevelFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      state: level.state,
      title: level.title ?? "",
      description: level.description ?? "",
      language: (level as any).language ?? "en",
    },
  });

  const updateLevelMutation = useUpdateDigitalisationLevel();

  useEffect(() => {
    if (isOpen) {
      reset({
        state: level.state,
        title: level.title ?? "",
        description: level.description ?? "",
        language: (level as any).language ?? "en",
      });
    }
  }, [isOpen, level, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Only block duplicate if same score AND same language (excluding current level)
    const isDuplicateState = existingLevels.some(
      (l) =>
        l.state === data.state &&
        l.id !== level.id &&
        ((l as any).language ?? "en") === data.language,
    );
    if (isDuplicateState) {
      setError("state", {
        type: "manual",
        message: t("adminLevels.validation.stateExists"),
      });
      return;
    }

    const changes = {
      dimension_id: level.dimensionId,
      score: data.state as LevelState,
      title: data.title,
      description: data.description,
      language: data.language,
    };

    updateLevelMutation.mutate(
      {
        dimensionId: level.dimensionId,
        levelId: level.id,
        changes,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["digitalisationLevels", level.dimensionId],
          });
          onClose();
        },
      },
    );
  };

  const isStateAvailable = (value: number) =>
    !existingLevels.some((l) => l.state === value && l.id !== level.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("adminLevels.form.titleEdit")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <>
            <Controller
              name="state"
              control={control}
              rules={{
                validate: (value) => {
                  if (typeof value !== "number" || isNaN(value)) {
                    return t("adminLevels.validation.stateNumber");
                  }
                  return (
                    isStateAvailable(value) ||
                    t("adminLevels.validation.stateExists")
                  );
                },
              }}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    type="number"
                    placeholder={t("adminLevels.form.levelId")}
                    min={1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      field.onChange(isNaN(value) ? undefined : value);
                    }}
                    value={field.value ?? ""}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              )}
            />
          </>
          <div>
            <Input
              {...register("title")}
              placeholder={t("adminLevels.form.levelName")}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Textarea
              {...register("description")}
              placeholder={t("adminLevels.form.description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Language
            </label>
            <ContentLanguageSelector
              value={watch("language")}
              onChange={(lang) => setValue("language", lang)}
              disabled={updateLevelMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateLevelMutation.isPending}>
              {updateLevelMutation.isPending
                ? t("adminLevels.form.updating")
                : t("adminLevels.updateBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
