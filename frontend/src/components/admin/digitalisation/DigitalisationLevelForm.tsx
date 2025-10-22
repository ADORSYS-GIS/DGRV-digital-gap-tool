import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  level: z.coerce
    .number()
    .min(1, "Level is required")
    .max(3000000, "The maximum value is 3,000,000"),
  description: z.string().min(1, "Description is required"),
});

export type DigitalisationLevelFormValues = z.infer<typeof formSchema>;

interface DigitalisationLevelFormProps {
  onSubmit: SubmitHandler<DigitalisationLevelFormValues>;
  initialData?: DigitalisationLevelFormValues;
  isSubmitting: boolean;
}

export const DigitalisationLevelForm: React.FC<
  DigitalisationLevelFormProps
> = ({ onSubmit, initialData, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DigitalisationLevelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit" : "Create"} Digitalization Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-gray-700"
            >
              Level
            </label>
            <Input
              id="level"
              type="number"
              {...register("level")}
              className="mt-1 block w-full"
              aria-invalid={errors.level ? "true" : "false"}
            />
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">
                {errors.level.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <Textarea
              id="description"
              {...register("description")}
              className="mt-1 block w-full"
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
