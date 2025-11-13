import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddAssessment } from "@/hooks/assessments/useAddAssessment";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { LoadingSpinner } from "../../shared/LoadingSpinner";

const formSchema = z.object({
  name: z.string().min(1, "Assessment name is required"),
  dimensionIds: z.array(z.string()).min(1, "Select at least one dimension"),
});

type AddAssessmentFormValues = z.infer<typeof formSchema>;

interface AddAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssessmentForm({ isOpen, onClose }: AddAssessmentFormProps) {
  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const { mutate: addAssessment, isPending: isAdding } = useAddAssessment();

  const form = useForm<AddAssessmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dimensionIds: [],
    },
  });

  const onSubmit = (values: AddAssessmentFormValues) => {
    addAssessment(
      {
        name: values.name,
        dimensionIds: values.dimensionIds,
      },
      {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q4 Security Review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dimensionIds"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Dimensions</FormLabel>
                  </div>
                  {isLoadingDimensions ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {dimensions?.map((dimension) => (
                        <FormItem
                          key={dimension.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(dimension.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...(field.value ?? []),
                                    dimension.id,
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(
                                      (value) => value !== dimension.id,
                                    ),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {dimension.name}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Creating..." : "Create Assessment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}