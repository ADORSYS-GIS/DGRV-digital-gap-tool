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
import { useUpdateActionItem } from "@/hooks/action_plans/useUpdateActionItem";
import { ActionItem } from "@/types/actionPlan";

interface EditActionItemFormProps {
  item: ActionItem;
  assessmentId: string;
  onSuccess?: () => void;
}

export function EditActionItemForm({ item, assessmentId, onSuccess }: EditActionItemFormProps) {
  const [description, setDescription] = useState(item.description);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(item.priority);
  const [dimensionAssessmentId, setDimensionAssessmentId] = useState(item.dimension_assessment_id);

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);
  const { data: dimensions } = useDimensions();
  const { updateItem, isUpdating } = useUpdateActionItem();

  const getDimensionName = (dimId: string) =>
    dimensions?.find((d) => d.id === dimId)?.name || "Unknown Dimension";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateItem(
      item.action_plan_id,
      item.action_item_id,
      { title: description, description, priority, dimension_assessment_id: dimensionAssessmentId },
      onSuccess,
    );
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

      <Button type="submit" disabled={isUpdating} className="w-full h-11 rounded-lg font-medium">
        {isUpdating ? "Updating…" : "Update Action Item"}
      </Button>
    </form>
  );
}
