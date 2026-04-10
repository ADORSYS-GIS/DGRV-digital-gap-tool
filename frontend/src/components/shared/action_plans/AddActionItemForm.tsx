import React, { useState } from "react";
import { FileText, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { actionPlanRepository } from "@/services/action_plans/actionPlanRepository";
import { toast } from "sonner";

interface AddActionItemFormProps {
  actionPlanId: string;
  assessmentId: string;
  onSuccess?: () => void;
}

export function AddActionItemForm({ actionPlanId, assessmentId, onSuccess }: AddActionItemFormProps) {
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dimensionAssessmentId, setDimensionAssessmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);
  const { data: dimensions } = useDimensions();

  const getDimensionName = (dimId: string) =>
    dimensions?.find((d) => d.id === dimId)?.name || "Unknown Dimension";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dimensionAssessmentId) {
      toast.error("Please select a dimension");
      return;
    }
    setIsSubmitting(true);
    try {
      const newActionItem = await actionPlanRepository.createActionItem(actionPlanId, {
        title: description, // use description as title since they're the same field
        description,
        priority,
        dimension_assessment_id: dimensionAssessmentId,
        recommendation_id: null,
      });
      if (newActionItem) {
        toast.success("Action item created successfully");
        onSuccess?.();
        setDescription("");
        setPriority("medium");
        setDimensionAssessmentId("");
      } else {
        toast.error("Failed to create action item");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700 font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" /> Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] rounded-lg border-gray-200 resize-none"
          placeholder="Describe the action item"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400" /> Priority
          </Label>
          <Select value={priority} onValueChange={(v: "low" | "medium" | "high") => setPriority(v)}>
            <SelectTrigger className="h-11 rounded-lg border-gray-200">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" /> Dimension
          </Label>
          <Select value={dimensionAssessmentId} onValueChange={setDimensionAssessmentId}>
            <SelectTrigger className="h-11 rounded-lg border-gray-200">
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
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-lg font-medium"
      >
        {isSubmitting ? "Adding…" : "Add Action Item"}
      </Button>
    </form>
  );
}
