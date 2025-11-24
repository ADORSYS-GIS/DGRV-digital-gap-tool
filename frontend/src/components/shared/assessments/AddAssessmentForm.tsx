import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddAssessment } from "@/hooks/assessments/useAddAssessment";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useOrganizationDimensions } from "@/hooks/organization_dimensions/useOrganizationDimensions";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoadingSpinner } from "../../shared/LoadingSpinner";

const formSchema = z.object({
  name: z.string().min(1, "Assessment name is required"),
  dimensionIds: z.array(z.string()).min(1, "Select at least one dimension"),
  cooperationId: z.string().min(1, "Please select a cooperation"),
});

type AddAssessmentFormValues = z.infer<typeof formSchema>;

interface AddAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAssessmentForm({ isOpen, onClose }: AddAssessmentFormProps) {
  const organizationId = useOrganizationId();

  const { data: allDimensions, isLoading: isLoadingDimensions } =
    useDimensions();
  const { data: assignedDimensionIds, isLoading: isLoadingAssigned } =
    useOrganizationDimensions(organizationId || "");

  const { data: cooperations, isLoading: isLoadingCooperations } =
    useCooperations();
  const { mutate: addAssessment, isPending: isAdding } = useAddAssessment();

  const assignedDimensions =
    allDimensions?.filter((d) => assignedDimensionIds?.includes(d.id)) || [];

  const form = useForm<AddAssessmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dimensionIds: [],
      cooperationId: "",
    },
  });

  const onSubmit = (values: AddAssessmentFormValues) => {
    if (!organizationId) return;
    addAssessment(
      {
        assessment_name: values.name,
        dimensions_id: values.dimensionIds,
        cooperation_id: values.cooperationId,
        organization_id: organizationId,
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
              name="cooperationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooperation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCooperations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cooperation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cooperations?.map((cooperation) => (
                        <SelectItem key={cooperation.id} value={cooperation.id}>
                          {cooperation.name}
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
              name="dimensionIds"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Dimensions</FormLabel>
                  </div>
                  {isLoadingDimensions || isLoadingAssigned ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {assignedDimensions.map((dimension) => (
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
