import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle } from "lucide-react";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useAddDigitalisationGap } from "@/hooks/digitalisationGaps/useAddDigitalisationGap";
import { toast } from "sonner";
import { GapLevel } from "@/types/gap";

const formSchema = z.object({
  dimensionId: z.string().min(1, "Category is required"),
  gap: z.nativeEnum(GapLevel),
  scope: z.string().min(1, "Scope is required"),
  gapScore: z.string(),
});

type GapFormValues = z.infer<typeof formSchema>;

const getGapScoreRange = (level: GapLevel) => {
  switch (level) {
    case GapLevel.HIGH:
      return "0-50";
    case GapLevel.MEDIUM:
      return "50-75";
    case GapLevel.LOW:
      return "75-100";
    default:
      return "";
  }
};

export const AddGapForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: dimensions, isLoading: isLoadingDimensions } = useDimensions();
  const addGapMutation = useAddDigitalisationGap();

  const form = useForm<GapFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimensionId: "",
      gap: GapLevel.LOW,
      scope: "",
      gapScore: getGapScoreRange(GapLevel.LOW),
    },
  });

  const watchGap = form.watch("gap");

  useEffect(() => {
    form.setValue("gapScore", getGapScoreRange(watchGap));
  }, [watchGap, form]);

  const onSubmit = async (values: GapFormValues) => {
    try {
      const { dimensionId, ...rest } = values;
      await addGapMutation.mutateAsync({
        ...rest,
        category: dimensionId,
      });
      toast.success("Digitalisation Gap added successfully!");
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to add digitalisation gap.");
      console.error("Failed to add digitalisation gap:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Gap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Digitalisation Gap</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dimensionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingDimensions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dimensions?.map((dimension) => (
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
              name="gap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gap Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gap level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(GapLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
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
                    <Input placeholder="Enter scope" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gapScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gap Score</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={addGapMutation.isPending}>
              {addGapMutation.isPending ? "Adding..." : "Add Gap"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};