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
import { useTranslation } from "react-i18next";

interface AddActionItemFormProps {
  actionPlanId: string;
  assessmentId: string;
  onSuccess?: () => void;
}

export function AddActionItemForm({ actionPlanId, assessmentId, onSuccess }: AddActionItemFormProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dimensionAssessmentId, setDimensionAssessmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: dimensionAssessments } = useDimensionAssessments(assessmentId);
  const { data: dimensions } = useDimensions("all");

  const getDimensionName = (dimId: string) => {
    const byId = dimensions?.find((d) => d.id === dimId);
    if (byId) return byId.name;
    const byKey = dimensions?.find((d) => (d as any).dimension_key === dimId);
    return byKey?.name || t("shared.actionPlans.unknownDimension");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dimensionAssessmentId) {
      toast.error(t("shared.actionPlans.selectDimError"));
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
        toast.success(t("shared.actionPlans.createSuccess"));
        onSuccess?.();
        setDescription("");
        setPriority("medium");
        setDimensionAssessmentId("");
      } else {
        toast.error(t("shared.actionPlans.createFailed"));
      }
    } catch {
      toast.error(t("shared.actionPlans.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700 font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" /> {t("shared.actionPlans.description")}
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] rounded-lg border-gray-200 resize-none"
          placeholder={t("shared.actionPlans.descPlaceholder")}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400" /> {t("shared.actionPlans.priority")}
          </Label>
          <Select value={priority} onValueChange={(v: "low" | "medium" | "high") => setPriority(v)}>
            <SelectTrigger className="h-11 rounded-lg border-gray-200">
              <SelectValue placeholder={t("shared.actionPlans.selectPriority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t("shared.actionPlans.priorityLow")}</SelectItem>
              <SelectItem value="medium">{t("shared.actionPlans.priorityMedium")}</SelectItem>
              <SelectItem value="high">{t("shared.actionPlans.priorityHigh")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" /> {t("shared.actionPlans.dimension")}
          </Label>
          <Select value={dimensionAssessmentId} onValueChange={setDimensionAssessmentId}>
            <SelectTrigger className="h-11 rounded-lg border-gray-200">
              <SelectValue placeholder={t("shared.actionPlans.selectDimension")} />
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
        {isSubmitting ? t("shared.actionPlans.adding") : t("shared.actionPlans.addBtn")}
      </Button>
    </form>
  );
}
