import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDimension } from "@/hooks/dimensions/useUpdateDimension";
import { IDimension } from "@/types/dimension";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type EditDimensionFormProps = {
  dimension: IDimension;
};

export const EditDimensionForm = ({ dimension }: EditDimensionFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: updateDimension } = useUpdateDimension();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: dimension.name,
      description: dimension.description ?? "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: dimension.name,
        description: dimension.description ?? "",
      });
      setIsSubmitting(false);
    }
  }, [isOpen, form, dimension]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const dimensionToUpdate: Partial<IDimension> = {
      name: values.name,
      description: values.description ?? null,
    };
    updateDimension(
      { id: dimension.id, dimension: dimensionToUpdate },
      {
        onSettled: () => {
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Dimension</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name">Name</label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Dimension"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
