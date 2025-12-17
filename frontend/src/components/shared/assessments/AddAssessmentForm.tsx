import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
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
  cooperationId: z.string().min(1, "Please select a cooperation"),
  dimensionIds: z.array(z.string()).min(1, "Select at least one dimension"),
});

type AddAssessmentFormValues = z.infer<typeof formSchema>;

interface AddAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog form used by org admins to create a new draft assessment.
 */
export function AddAssessmentForm({ isOpen, onClose }: AddAssessmentFormProps) {
  const organizationId = useOrganizationId();

  const { data: allDimensions, isLoading: isLoadingDimensions } =
    useDimensions();
  const { data: assignedDimensionIds, isLoading: isLoadingAssigned } =
    useOrganizationDimensions(organizationId || "");

  const { data: cooperations, isLoading: isLoadingCooperations } =
    useCooperations(organizationId || undefined);
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create new assessment
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Define the assessment name, select the target cooperation, and pick
            the dimensions you want to evaluate.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Assessment name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 2025 Digital Maturity Baseline"
                      {...field}
                    />
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
                  <FormLabel>
                    Cooperation <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Dimensions <span className="text-destructive">*</span>
                  </FormLabel>
                  {isLoadingDimensions || isLoadingAssigned ? (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <MultiSelect
                      options={assignedDimensions.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select dimensions"
                      maxCount={3}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Creating…" : "Create assessment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
