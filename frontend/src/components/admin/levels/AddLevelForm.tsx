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
import { useAddDigitalisationLevel } from "@/hooks/digitalisationLevels/useAddDigitalisationLevel";
import {
  IDigitalisationLevel,
  LevelType,
  LevelState,
} from "@/types/digitalisationLevel";

const formSchema = z.object({
  description: z.string().optional(),
  state: z.coerce.number().min(1, "Please select a state").max(5),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 0,
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
    const levelData = {
      dimension_id: dimensionId,
      score: data.state as LevelState,
      description: data.description ?? null,
      level: `Level ${data.state}`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add New {levelType === "current" ? "Current" : "Desired"} Level
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value ? String(field.value) : ""}
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
            <Button type="submit" disabled={addLevelMutation.isPending}>
              {addLevelMutation.isPending ? "Adding..." : "Add Level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
