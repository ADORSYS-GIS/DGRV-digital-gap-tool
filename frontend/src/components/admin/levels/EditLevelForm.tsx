import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "./AddLevelForm";

const formSchema = z.object({
  description: z.string().optional(),
  state: z.coerce.number().min(1, "Please select a state").max(5),
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
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: level.state,
      description: level.description ?? "",
    },
  });

  const updateLevelMutation = useUpdateDigitalisationLevel();

  useEffect(() => {
    if (isOpen) {
      reset({
        state: level.state,
        description: level.description ?? "",
      });
    }
  }, [isOpen, level, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const changes = {
      score: data.state as LevelState,
      description: data.description ?? null,
      level: descriptions?.[data.state - 1] ?? `Level ${data.state}`,
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

  const descriptions =
    dimension && level.levelType === "current"
      ? currentStateDescriptions[dimension.name]
      : dimension
        ? desiredStateDescriptions[dimension.name]
        : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {level.levelType === "current" ? "Current" : "Desired"} Level
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      {descriptions
                        ? `${descriptions[state - 1]}`
                        : `State ${state}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
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
