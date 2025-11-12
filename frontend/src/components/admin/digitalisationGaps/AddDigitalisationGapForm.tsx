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
import {
  Gap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formInputSchema = z.object({
  dimensionId: z.string().min(1, "Dimension is required"),
  gap: z.nativeEnum(Gap),
  scope: z.string().min(1, "Scope is required"),
  min_score: z.string().min(1, "Min score is required"),
  max_score: z.string().min(1, "Max score is required"),
  gap_size: z.string().min(1, "Gap size is required"),
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
  const form = useForm<AddDigitalisationGapFormValues>({
    resolver: zodResolver(formInputSchema),
    defaultValues: {
      dimensionId: "",
      gap: Gap.MEDIUM,
      scope: "",
      min_score: "50",
      max_score: "75",
      gap_size: "0",
    },
  });

  const { data: dimensions } = useDimensions();
  const addMutation = useAddDigitalisationGap();
  const updateMutation = useUpdateDigitalisationGap();

  useEffect(() => {
    if (digitalisationGap) {
      form.reset({
        dimensionId: digitalisationGap.dimensionId,
        gap: digitalisationGap.gap,
        scope: digitalisationGap.scope,
        min_score: String(digitalisationGap.min_score),
        max_score: String(digitalisationGap.max_score),
        gap_size: String(digitalisationGap.gap_size),
      });
    } else {
      form.reset({
        dimensionId: "",
        gap: Gap.MEDIUM,
        scope: "",
        min_score: "50",
        max_score: "75",
        gap_size: "0",
      });
    }
  }, [digitalisationGap, form]);

  const onSubmit = (values: AddDigitalisationGapFormValues) => {
    const handleSuccess = () => {
      onClose();
    };

    const transformedValues = {
      ...values,
      min_score: parseInt(values.min_score, 10),
      max_score: parseInt(values.max_score, 10),
      gap_size: parseInt(values.gap_size, 10),
    };

    if (digitalisationGap) {
      updateMutation.mutate(
        { ...transformedValues, id: digitalisationGap.id },
        { onSuccess: handleSuccess },
      );
    } else {
      addMutation.mutate(transformedValues, { onSuccess: handleSuccess });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {digitalisationGap ? "Edit" : "Add"} Digitalisation Gap
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dimensionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimension</FormLabel>
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
              name="gap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gap</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a gap level" />
                      </SelectTrigger>
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
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the digital gap..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gap_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gap Size</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {digitalisationGap ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
