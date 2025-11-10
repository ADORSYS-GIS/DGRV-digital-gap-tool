import { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDigitalisationLevel } from "@/hooks/digitalisationLevels/useUpdateDigitalisationLevel";
import { IDigitalisationLevel, LevelState } from "@/types/digitalisationLevel";

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
      level: `Level ${data.state}`,
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
                      State {state}
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
