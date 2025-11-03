import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DigitalisationLevel, LevelState } from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  state: z.coerce.number().min(1).max(5),
  scope: z.string().min(1, "Scope is required"),
});

type EditLevelFormProps = {
  level: DigitalisationLevel;
};

export const EditLevelForm = ({ level }: EditLevelFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateLevel, isPending } = useUpdateDigitalisationLevel();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: level.state,
      scope: level.scope,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateLevel(
      { id: level.id, level: { ...values, state: values.state as LevelState } },
      {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Digitalisation Level</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="state">State</label>
            <Select
              onValueChange={(value) => setValue("state", Number(value))}
              defaultValue={String(getValues("state"))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((state) => (
                  <SelectItem key={state} value={String(state)}>
                    State {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-red-500">{errors.state.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="scope">Scope</label>
            <Textarea id="scope" {...register("scope")} />
            {errors.scope && (
              <p className="text-red-500">{errors.scope.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Level"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
