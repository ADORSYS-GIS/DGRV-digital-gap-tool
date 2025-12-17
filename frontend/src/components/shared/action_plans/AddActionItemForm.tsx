import React, { useState } from "react";
import { Type, FileText, AlertCircle, Layers } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-700 font-medium">
            Title
          </Label>
          <div className="relative">
            <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
              placeholder="Enter action item title"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700 font-medium">
            Description
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="pl-10 min-h-[100px] rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all resize-none"
              placeholder="Describe the action item"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-gray-700 font-medium">
              Priority
            </Label>
            <Select
              value={priority}
              onValueChange={(value: "low" | "medium" | "high") =>
                setPriority(value)
              }
            >
              <div className="relative">
                <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </div>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dimension" className="text-gray-700 font-medium">
              Dimension
            </Label>
            <Select
              value={dimensionAssessmentId}
              onValueChange={setDimensionAssessmentId}
            >
              <div className="relative">
                <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <SelectTrigger className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Select dimension" />
                </SelectTrigger>
              </div>
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
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Adding...
            </span>
          ) : (
            "Add Action Item"
          )}
        </Button>
      </div>
    </form>
  );
}
