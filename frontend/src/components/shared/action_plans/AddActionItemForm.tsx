import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { toast } from "sonner";

interface AddActionItemFormProps {
  actionPlanId: string;
  assessmentId: string;
  onSuccess?: () => void;
}

export function AddActionItemForm({
  actionPlanId,
  assessmentId,
  onSuccess,
}: AddActionItemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dimensionAssessmentId, setDimensionAssessmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);
  const { data: dimensions } = useDimensions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dimensionAssessmentId) {
      toast.error("Please select a dimension");
      return;
    }

    setIsSubmitting(true);
    try {
      const newActionItem = await actionPlanRepository.createActionItem(
        actionPlanId,
        {
          title,
          description,
          priority,
          dimension_assessment_id: dimensionAssessmentId,
          recommendation_id: null, // Custom action item
        },
      );

      if (newActionItem) {
        toast.success("Action item created successfully");
        if (onSuccess) {
          onSuccess();
        }
        // Reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDimensionAssessmentId("");
      } else {
        toast.error("Failed to create action item");
      }
    } catch (error) {
      console.error("Error creating action item:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDimensionName = (dimId: string) => {
    return dimensions?.find((d) => d.id === dimId)?.name || "Unknown Dimension";
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Priority
        </Label>
        <Select
          value={priority}
          onValueChange={(value: "low" | "medium" | "high") =>
            setPriority(value)
          }
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dimension" className="text-right">
          Dimension
        </Label>
        <Select
          value={dimensionAssessmentId}
          onValueChange={setDimensionAssessmentId}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select dimension" />
          </SelectTrigger>
          <SelectContent>
            {dimensionAssessments?.map((da) => (
              <SelectItem key={da.id} value={da.id}>
                {getDimensionName(da.dimensionId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Item"}
        </Button>
      </DialogFooter>
    </form>
  );
}