import { useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Gap,
  scoreRanges,
  IDigitalisationGap,
  IDigitalisationGapWithDimension,
} from "@/types/digitalisationGap";
import { useAddDigitalisationGap } from "@/hooks/digitalisationGaps/useAddDigitalisationGap";
import { useUpdateDigitalisationGap } from "@/hooks/digitalisationGaps/useUpdateDigitalisationGap";
import { useDimensions } from "@/hooks/dimensions/useDimensions";

const formSchema = z.object({
  dimensionId: z.string().min(1, "Dimension is required"),
  gap: z.nativeEnum(Gap),
  scope: z.string().min(1, "Scope is required"),
});

type AddDigitalisationGapFormValues = z.infer<typeof formSchema>;

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
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimensionId: "",
      gap: Gap.MEDIUM,
      scope: "",
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
      });
    } else {
      form.reset({
        dimensionId: "",
        gap: Gap.MEDIUM,
        scope: "",
      });
    }
  }, [digitalisationGap, form]);

  const selectedGap = form.watch("gap");
  const scoreRange = scoreRanges[selectedGap];

  const onSubmit = (values: AddDigitalisationGapFormValues) => {
    if (digitalisationGap) {
      updateMutation.mutate({ ...values, id: digitalisationGap.id });
    } else {
      addMutation.mutate(values);
    }
    onClose();
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
            <FormItem>
              <FormLabel>Score Range</FormLabel>
              <FormControl>
                <Input value={scoreRange} disabled />
              </FormControl>
            </FormItem>
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
