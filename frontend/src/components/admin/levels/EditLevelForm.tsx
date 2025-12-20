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
import { useDimension } from "@/hooks/dimensions/useDimension";
import { IDigitalisationLevel, LevelState } from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
const formSchema = z.object({
  description: z.string().optional(),
  state: z
    .number()
    .min(1, "Please select a state")
    .max(5)
    .refine((state) => state !== 0, "Level ID is required"),
  levelName: z.string().min(1, "Level name is required"),
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
  const queryClient = useQueryClient();
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
    if (!data.levelName || data.levelName.trim() === "") {
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
      dimension_id: level.dimensionId,
      score: data.state as LevelState,
      description: data.description ?? null,
      level: data.levelName,
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
