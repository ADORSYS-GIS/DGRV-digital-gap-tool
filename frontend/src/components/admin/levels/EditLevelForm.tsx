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
import { useUpdateDigitalisationLevel } from "@/hooks/digitalisationLevels/useUpdateDigitalisationLevel";
import { useDimension } from "@/hooks/dimensions/useDimension";
import { IDigitalisationLevel, LevelState } from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import {
  currentStateDescriptions,
  desiredStateDescriptions,
} from "@/constants/level-descriptions";

const formSchema = z.object({
  description: z.string().optional(),
  state: z
    .number()
    .min(1, "Please select a state")
    .max(5)
    .refine((state) => state !== 0, "Level ID is required"),
  levelName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const { data: dimension } = useDimension(level.dimensionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: level.state,
      description: level.description ?? "",
      levelName: level.level ?? "",
    },
  });

  const updateLevelMutation = useUpdateDigitalisationLevel();

  useEffect(() => {
    if (isOpen) {
      reset({
        state: level.state,
        description: level.description ?? "",
        levelName: level.level ?? "",
      });
    }
  }, [isOpen, level, reset]);

  const descriptions =
    dimension && level.levelType === "current"
      ? currentStateDescriptions[dimension.name]
      : dimension
        ? desiredStateDescriptions[dimension.name]
        : undefined;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Client-side uniqueness validation for state (Level ID)
    const isDuplicateState = existingLevels.some(
      (l) => l.state === data.state && l.id !== level.id,
    );
    if (isDuplicateState) {
      setError("state", {
        type: "manual",
        message: "Level ID already exists for this dimension",
      });
      return;
    }

    // Client-side uniqueness validation for levelName (Level Name)
    if (!descriptions && (!data.levelName || data.levelName.trim() === "")) {
      setError("levelName", {
        type: "manual",
        message: "Level Name is required for custom dimensions",
      });
      return;
    }

    const isDuplicateLevelName = existingLevels.some(
      (l) =>
        l.level?.toLowerCase() === data.levelName?.toLowerCase() &&
        data.levelName?.trim() !== "" &&
        l.id !== level.id,
    );
    if (isDuplicateLevelName) {
      setError("levelName", {
        type: "manual",
        message: "Level Name already exists for this dimension",
      });
      return;
    }

    const changes = {
      score: data.state as LevelState,
      description: data.description ?? null,
      level:
        data.levelName && data.levelName.trim() !== ""
          ? data.levelName
          : (descriptions?.[data.state - 1] ?? `Level ${data.state}`),
    };

    updateLevelMutation.mutate(
      {
        dimensionId: level.dimensionId,
        levelId: level.id,
        levelType: level.levelType,
        changes,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const availableStates = [1, 2, 3, 4, 5].filter(
    (state) =>
      !existingLevels.some((l) => l.state === state && l.id !== level.id),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {level.levelType === "current" ? "Current" : "Desired"} Level
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {descriptions ? (
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={String(field.value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
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
                      return "State must be a number";
                    }
                    return (
                      availableStates.includes(value) ||
                      "Level ID already exists or is invalid"
                    );
                  },
                }}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Level ID (1-5)"
                      min={1}
                      max={5}
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
              <div>
                <Input
                  {...register("levelName")}
                  placeholder="Level Name (e.g., Initial Phase)"
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

          <Textarea {...register("description")} placeholder="Description" />

          <DialogFooter>
            <Button type="submit" disabled={updateLevelMutation.isPending}>
              {updateLevelMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
