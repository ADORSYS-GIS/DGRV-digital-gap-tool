import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAddDigitalisationLevel } from "@/hooks/digitalisationLevels/useAddDigitalisationLevel";
import { LevelType, LevelState } from "@/types/digitalisationLevel";

const formSchema = z.object({
  state: z.coerce.number().min(1).max(5),
  scope: z.string().min(1, "Scope is required"),
});

type FormValues = z.infer<typeof formSchema>;

import { toast } from "sonner";
import { DigitalisationLevel } from "@/types/digitalisationLevel";

interface AddLevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  dimensionId: string;
  levelType: LevelType;
  existingLevels: DigitalisationLevel[];
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
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 1,
      scope: "",
    },
  });

  const addLevelMutation = useAddDigitalisationLevel();

  const onSubmit = (data: FormValues) => {
    const stateExists = existingLevels.some(
      (level) => level.state === data.state,
    );

    if (stateExists) {
      toast.error("A level with this state already exists.");
      return;
    }

    addLevelMutation.mutate(
      {
        dimensionId,
        levelType,
        state: data.state as LevelState,
        scope: data.scope,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Add New Level
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="space-y-2">
            <label
              htmlFor="state"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              State
            </label>
            <select
              id="state"
              {...register("state")}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  State {s}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">
                {errors.state.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="scope"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Scope
            </label>
            <Textarea
              id="scope"
              {...register("scope")}
              placeholder="Enter the scope for this level"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            />
            {errors.scope && (
              <p className="text-red-500 text-sm mt-1">
                {errors.scope.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={addLevelMutation.isPending}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            {addLevelMutation.isPending ? "Adding..." : "Add Level"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
