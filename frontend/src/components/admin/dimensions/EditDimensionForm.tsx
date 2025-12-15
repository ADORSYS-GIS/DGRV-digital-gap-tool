import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Type, FileText } from "lucide-react";
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
        <Button
          variant="outline"
          className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors"
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent p-6 border-b border-blue-100">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Pencil className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Edit Dimension
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              Update the details of this dimension.
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                Dimension Name
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  {...form.register("name")}
                  className="pl-10 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="description"
                  {...form.register("description")}
                  className="pl-10 min-h-[100px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Updating...
                  </span>
                ) : (
                  "Update Dimension"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
