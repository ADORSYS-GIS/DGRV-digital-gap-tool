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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddDigitalisationGap } from "@/hooks/digitalisationGaps/useAddDigitalisationGap";
import { useUpdateDigitalisationGap } from "@/hooks/digitalisationGaps/useUpdateDigitalisationGap";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import {
  Gap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, Layers, Activity, FileText } from "lucide-react";
import * as z from "zod";

const formInputSchema = z.object({
  dimensionId: z.string().min(1, "Dimension is required"),
  gap_severity: z.nativeEnum(Gap),
  description: z.string().min(1, "Description is required"),
});

type AddDigitalisationGapFormValues = z.infer<typeof formInputSchema>;

interface AddDigitalisationGapFormProps {
  isOpen: boolean;
  onClose: () => void;
  digitalisationGap?: IDigitalisationGapWithDimension;
}

export function AddDigitalisationGapForm({
  isOpen,
  onClose,
  digitalisationGap,
}: AddDigitalisationGapFormProps) {
  const { data: digitalisationGaps } = useDigitalisationGaps();
  const form = useForm<AddDigitalisationGapFormValues>({
    resolver: zodResolver(
      formInputSchema.refine(
        (data) => {
          if (digitalisationGap) {
            return true;
          }
          const existingGap = digitalisationGaps?.find(
            (gap) =>
              gap.dimensionId === data.dimensionId &&
              gap.gap_severity === data.gap_severity,
          );
          return !existingGap;
        },
        {
          message:
            "A gap with this severity already exists for this dimension.",
          path: ["gap_severity"],
        },
      ),
    ),
    defaultValues: {
      dimensionId: "",
      gap_severity: Gap.MEDIUM,
      description: "",
    },
  });

  const { data: dimensions } = useDimensions();
  const addMutation = useAddDigitalisationGap();
  const updateMutation = useUpdateDigitalisationGap();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog is closed
      form.reset({
        dimensionId: "",
        gap_severity: Gap.MEDIUM,
        scope: "",
      });
    } else if (digitalisationGap) {
      // Populate form for editing
      form.reset({
        dimensionId: digitalisationGap.dimensionId,
        gap_severity: digitalisationGap.gap_severity,
        description: digitalisationGap.description,
      });
    } else {
      // Reset to default for adding new gap when dialog is opened
      form.reset({
        dimensionId: "",
        gap_severity: Gap.MEDIUM,
        description: "",
      });
    }
  }, [isOpen, digitalisationGap, form]);

  const onSubmit = (values: AddDigitalisationGapFormValues) => {
    const handleSuccess = () => {
      onClose();
    };

    if (digitalisationGap) {
      updateMutation.mutate(
        { ...values, id: digitalisationGap.id },
        { onSuccess: handleSuccess },
      );
    } else {
      addMutation.mutate(values, { onSuccess: handleSuccess });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {digitalisationGap ? "Edit" : "Add"} Digitalisation Gap
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground pl-12">
              {digitalisationGap
                ? "Update the details of this digitalisation gap."
                : "Define a new potential gap for assessment."}
            </p>
          </DialogHeader>
        </div>
        <div className="p-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="dimensionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Dimension</FormLabel>
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
                        {dimensions?.map((dim) => (
                          <SelectItem key={dim.id} value={dim.id}>
                            {dim.name}
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
                name="gap_severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Gap Severity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Select a gap severity" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Gap).map((gapValue) => (
                          <SelectItem key={gapValue} value={gapValue}>
                            {gapValue}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Description</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          placeholder="Describe the digital gap..."
                          className="pl-10 min-h-[100px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {(addMutation.isPending || updateMutation.isPending) ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Saving...
                    </span>
                  ) : (
                    digitalisationGap ? "Update Gap" : "Create Gap"
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
