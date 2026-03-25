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
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  state: z
    .number()
    .min(1, "Please select a state")
    .refine((state) => state !== 0, "Level ID is required"),
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
      title: level.title ?? "",
      description: level.description ?? "",
    },
  });

  const updateLevelMutation = useUpdateDigitalisationLevel();

  useEffect(() => {
    if (isOpen) {
      reset({
        state: level.state,
        title: level.title ?? "",
        description: level.description ?? "",
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

    const changes = {
      dimension_id: level.dimensionId,
      score: data.state as LevelState,
      title: data.title,
      description: data.description,
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
            <Button type="submit" disabled={updateLevelMutation.isPending}>
              {updateLevelMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
