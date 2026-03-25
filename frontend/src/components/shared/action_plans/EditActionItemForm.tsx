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
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useUpdateActionItem } from "@/hooks/action_plans/useUpdateActionItem";
import { ActionItem } from "@/types/actionPlan";

interface EditActionItemFormProps {
    item: ActionItem;
    assessmentId: string;
    onSuccess?: () => void;
}

export function EditActionItemForm({
    item,
    assessmentId,
    onSuccess,
}: EditActionItemFormProps) {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description);
    const [priority, setPriority] = useState<"low" | "medium" | "high">(item.priority);
    const [dimensionAssessmentId, setDimensionAssessmentId] = useState(item.dimension_assessment_id);

    const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);
    const { data: dimensions } = useDimensions();
    const { updateItem, isUpdating } = useUpdateActionItem();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateItem(
            item.action_plan_id,
            item.action_item_id,
            {
                title,
                description,
                priority,
                dimension_assessment_id: dimensionAssessmentId,
            },
            onSuccess
        );
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
                    disabled={isUpdating}
                    className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                    {isUpdating ? "Updating..." : "Update Action Item"}
                </Button>
            </div>
        </form>
    );
}
