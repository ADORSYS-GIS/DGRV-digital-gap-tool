import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddDigitalisationLevel } from "@/hooks/digitalisationLevels/useAddDigitalisationLevel";
import { useDimension } from "@/hooks/dimensions/useDimension";
import {
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import {
  currentStateDescriptions,
  desiredStateDescriptions,
} from "@/constants/level-descriptions";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const formSchema = z.object({
  description: z.string().optional(),
  state: z
    .number()
    .min(
      1,
      i18n.t("validation.selectState", {
        defaultValue: "Please select a state",
      }),
    )
    .max(5),
  levelName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  dimensionId: string;
  levelType: LevelType;
  existingLevels: IDigitalisationLevel[];
}

export const AddLevelForm = ({
  isOpen,
  onClose,
  dimensionId,
  levelType,
  existingLevels,
}: AddLevelFormProps) => {
  const { data: dimension } = useDimension(dimensionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 0,
      description: "",
      levelName: "",
    },
  });

  const addLevelMutation = useAddDigitalisationLevel();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!descriptions && (!data.levelName || data.levelName.trim() === "")) {
      setError("levelName", {
        type: "manual",
        message: i18n.t("validation.levelNameRequiredForCustom", {
          defaultValue: "Level Name is required for custom dimensions",
        }),
      });
      return;
    }

    const levelData = {
      dimension_id: dimensionId,
      score: data.state as LevelState,
      description: data.description ?? null,
      level:
        data.levelName && data.levelName.trim() !== ""
          ? data.levelName
          : (descriptions?.[data.state - 1] ?? `Level ${data.state}`),
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

  const availableStates = [1, 2, 3, 4, 5].filter(
    (state) => !existingLevels.some((level) => level.state === state),
  );

  const descriptions =
    dimension && levelType === "current"
      ? currentStateDescriptions[dimension.name]
      : dimension
        ? desiredStateDescriptions[dimension.name]
        : undefined;

  const handleStateChange = (value: string) => {
    const state = parseInt(value, 10);
    setValue("state", state);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("admin.levels.addTitle", {
              defaultValue: "Add New {{type}} Level",
              type: t(
                levelType === "current" ? "admin.levels.current" : "admin.levels.desired",
                {
                  defaultValue:
                    levelType === "current" ? "Current" : "Desired",
                },
              ),
            })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {descriptions && availableStates.length > 0 ? (
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={handleStateChange}
                  defaultValue={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("admin.levels.selectStatePlaceholder", {
                        defaultValue: "Select a state",
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={String(state)}>
                        {descriptions[state - 1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <>
              <Controller
                name="state"
                control={control}
                rules={{
                  validate: (value) => {
                    if (typeof value !== "number" || isNaN(value)) {
                      return i18n.t("validation.stateMustBeNumber", {
                        defaultValue: "State must be a number",
                      });
                    }
                    return (
                      availableStates.includes(value) ||
                      i18n.t("validation.stateExistsOrInvalid", {
                        defaultValue:
                          "State already exists or is invalid",
                      })
                    );
                  },
                }}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      placeholder={t(
                        "admin.levels.stateNumberPlaceholder",
                        { defaultValue: "State Number (1-5)" },
                      )}
                      min={1}
                      max={5}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(
                          isNaN(value) ? undefined : value,
                        ); // Pass undefined if not a valid number
                      }}
                      value={field.value ?? ""} // Use nullish coalescing for controlled component
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <div>
                <Input
                  {...register("levelName")}
                  placeholder={t(
                    "admin.levels.levelNamePlaceholder",
                    { defaultValue: "Level Name (e.g., Initial Phase)" },
                  )}
                  className="mb-2"
                />
                {errors.levelName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.levelName.message}
                  </p>
                )}
              </div>
            </>
          )}

          <Textarea
            {...register("description")}
            placeholder={t("common.description", {
              defaultValue: "Description",
            })}
          />

          <DialogFooter>
            <Button type="submit" disabled={addLevelMutation.isPending}>
              {addLevelMutation.isPending
                ? t("common.adding", { defaultValue: "Adding..." })
                : t("admin.levels.addAction", { defaultValue: "Add Level" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
