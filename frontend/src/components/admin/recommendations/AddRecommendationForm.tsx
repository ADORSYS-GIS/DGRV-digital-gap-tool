import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useAddRecommendation } from "@/hooks/recommendations/useAddRecommendation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useRecommendations } from "@/hooks/recommendations/useRecommendations";
import { IRecommendation } from "@/types/recommendation";

// Define the form schema with Zod
const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

type RecommendationPriority = z.infer<typeof PriorityEnum>;

type FormValues = {
  dimension_id: string;
  priority: RecommendationPriority;
  description: string;
};

const createFormSchema = (
  existingRecommendations: Array<{
    dimension_id: string;
    priority: RecommendationPriority;
  }>,
) => {
  return z
    .object({
      dimension_id: z.string().min(1, "Dimension is required"),
      priority: PriorityEnum,
      description: z.string().min(1, "Description is required"),
    })
    .refine(
      (data) => {
        // Check if there's already a recommendation with the same dimension and priority
        const exists = existingRecommendations.some(
          (rec) =>
            rec.dimension_id === data.dimension_id &&
            rec.priority === data.priority,
        );
        return !exists;
      },
      {
        message:
          "A recommendation with this priority already exists for the selected dimension.",
        path: ["priority"],
      },
    );
};

interface AddRecommendationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRecommendationForm({
  isOpen,
  onClose,
}: AddRecommendationFormProps) {
  const addRecommendation = useAddRecommendation();
  const { data: dimensions = [] } = useDimensions();
  const { data: existingRecommendations = [] } = useRecommendations();

  // Get existing dimension-priority pairs for validation
  const existingDimensionPriorities = existingRecommendations
    .filter(
      (rec): rec is IRecommendation =>
        rec.dimension_id !== undefined && rec.priority !== undefined,
    )
    .map((rec) => ({
      dimension_id: rec.dimension_id,
      priority: rec.priority as RecommendationPriority,
    }));

  const formSchema = createFormSchema(existingDimensionPriorities);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimension_id: "",
      priority: "MEDIUM",
      description: "",
    },
    mode: "onChange",
  });

  // Reset form when opening/closing the dialog
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        dimension_id: "",
        priority: "MEDIUM",
        description: "",
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await addRecommendation.mutateAsync({
        dimension_id: data.dimension_id,
        priority: data.priority,
        description: data.description,
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error("Failed to add recommendation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add New Recommendation</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new recommendation.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="dimension_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimension *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a dimension" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dimensions.map((dimension) => (
                          <SelectItem key={dimension.id} value={dimension.id}>
                            {dimension.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed description"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={addRecommendation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addRecommendation.isPending}>
                {addRecommendation.isPending
                  ? "Adding..."
                  : "Add Recommendation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
