import React from "react";
import { Lightbulb, Layers, AlertCircle, FileText } from "lucide-react";
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Add New Recommendation</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground pl-12">
              Fill in the details below to create a new recommendation.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5">
                <FormField
                  control={form.control}
                  name="dimension_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Dimension *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select a dimension" />
                            </SelectTrigger>
                          </div>
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
                      <FormLabel className="text-gray-700">Priority *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </div>
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
                      <FormLabel className="text-gray-700">Description *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            placeholder="Enter detailed description"
                            className="pl-10 min-h-[120px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={addRecommendation.isPending}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addRecommendation.isPending}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {addRecommendation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Adding...
                    </span>
                  ) : (
                    "Add Recommendation"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
