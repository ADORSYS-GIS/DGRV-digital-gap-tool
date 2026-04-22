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
import { useAddDigitalisationLevel } from "@/hooks/digitalisationLevels/useAddDigitalisationLevel";
import {
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
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

interface AddLevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  dimensionId: string;
  levelType: LevelType;
  existingLevels: IDigitalisationLevel[];
  defaultLanguage?: string;
}

export const AddLevelForm = ({
  isOpen,
  onClose,
  dimensionId,
  levelType,
  existingLevels,
  defaultLanguage = "en",
}: AddLevelFormProps) => {
  const { t } = useTranslation();
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
      state:
        existingLevels.length > 0
          ? Math.max(...existingLevels.map((l) => l.state)) + 1
          : 1,
      title: "",
      description: "",
      language: defaultLanguage,
    },
  });

  const addLevelMutation = useAddDigitalisationLevel();

  useEffect(() => {
    if (!isOpen) {
      reset({
        state: existingLevels.length > 0 ? Math.max(...existingLevels.map((l) => l.state)) + 1 : 1,
        title: "",
        description: "",
        language: defaultLanguage,
      });
    }
  }, [isOpen, reset, defaultLanguage]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Only block duplicate if same score AND same language
    const isDuplicateState = existingLevels.some(
      (level) =>
        level.state === data.state &&
        ((level as any).language ?? "en") === data.language,
    );
    if (isDuplicateState) {
      setError("state", {
        type: "manual",
        message: t("adminLevels.validation.stateExists"),
      });
      return;
    }

    const levelData = {
      dimension_id: dimensionId,
      score: data.state as LevelState,
      title: data.title,
      description: data.description,
      language: data.language,
      level: data.title,
      levelType: levelType,
      dimensionId: dimensionId,
    };

    addLevelMutation.mutate(
      {
        dimensionId,
        levelType,
        levelData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const isStateAvailable = (value: number) =>
    !existingLevels.some((level) => level.state === value);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {levelType === "current"
              ? t("adminLevels.form.titleAddCurrent")
              : t("adminLevels.form.titleAddDesired")}
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
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={t("adminLevels.form.levelId")}
                    className="pr-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.onChange(undefined);
                      } else {
                        const num = parseInt(val, 10);
                        field.onChange(isNaN(num) ? undefined : num);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                  {/* Increment/decrement buttons */}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => field.onChange((field.value ?? 0) + 1)}
                      className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange(Math.max(1, (field.value ?? 1) - 1))}
                      className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      ▼
                    </button>
                  </div>
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
              disabled={addLevelMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addLevelMutation.isPending}>
              {addLevelMutation.isPending
                ? t("adminLevels.form.saving")
                : t("adminLevels.addBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
