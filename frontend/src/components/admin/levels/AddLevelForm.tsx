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
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  state: z
    .number()
    .min(1, "Please select a state")
    .refine((state) => state !== 0, "Level ID is required"),
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
      state:
        existingLevels.length > 0
          ? Math.max(...existingLevels.map((l) => l.state)) + 1
          : 1,
      title: "",
      description: "",
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

    const levelData = {
      dimension_id: dimensionId,
      score: data.state as LevelState,
      title: data.title,
      description: data.description,
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
          queryClient.invalidateQueries({
            queryKey: ["digitalisationLevels", dimensionId],
          });
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
                  return isStateAvailable(value) || "Level ID already exists";
                },
              }}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Level ID"
                    min={1}
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
          </>

          <div>
            <Input {...register("title")} placeholder="Level Name" />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Textarea {...register("description")} placeholder="Description" />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
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
