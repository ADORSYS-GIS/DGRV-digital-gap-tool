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
import { useDimension } from "@/hooks/dimensions/useDimension";
import {
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
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
  const queryClient = useQueryClient();
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

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Client-side uniqueness validation for state (Level ID)
    const isDuplicateState = existingLevels.some(
      (level) => level.state === data.state,
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
      (level) =>
        level.level?.toLowerCase() === data.levelName?.toLowerCase() &&
        data.levelName?.trim() !== "",
    );
    if (isDuplicateLevelName) {
      setError("levelName", {
        type: "manual",
        message: "Level Name already exists for this dimension",
      });
      return;
    }

    const levelData = {
      dimension_id: dimensionId,
      score: data.state as LevelState,
      description: data.description ?? null,
      level: data.levelName,
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
          queryClient.invalidateQueries({
            queryKey: ["digitalisationLevels", dimensionId],
          });
          onClose();
        },
      },
    );
  };

  const availableStates = [1, 2, 3, 4, 5].filter(
    (state) => !existingLevels.some((level) => level.state === state),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add New {levelType === "current" ? "Current" : "Desired"} Level
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
                      field.onChange(isNaN(value) ? undefined : value); // Pass undefined if not a valid number
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
            <Button type="submit" disabled={addLevelMutation.isPending}>
              {addLevelMutation.isPending ? "Adding..." : "Add Level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
