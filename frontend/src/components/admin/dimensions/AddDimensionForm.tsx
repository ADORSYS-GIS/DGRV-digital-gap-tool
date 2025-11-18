import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useAddDimension } from "@/hooks/dimensions/useAddDimension";

const formSchema = z.object({
  name: z.string().min(1, "Dimension name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddDimensionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDimensionForm = ({
  isOpen,
  onClose,
}: AddDimensionFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const addDimensionMutation = useAddDimension();

  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    const payload = {
      name: data.name,
      ...(data.description && { description: data.description }),
    };
    addDimensionMutation.mutate(payload, {
      onSettled: () => {
        // This will be called regardless of success or error, online or offline.
        // We can safely close the modal and reset the state here.
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Dimension</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input {...register("name")} placeholder="Dimension Name" />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Textarea
              {...register("description")}
              placeholder="Description (optional)"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Dimension"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
