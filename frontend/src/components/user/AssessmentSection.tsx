/**
 * Assessment section component for managing user assessments.
 * This component provides:
 * - Display of current ongoing assessment
 * - Progress tracking for assessments
 * - Quick action buttons for starting/continuing assessments
 * - Integration with dashboard card styling
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { ProgressIndicator } from "@/components/shared/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Clock, Play, BarChart3 } from "lucide-react";

interface AssessmentSectionProps {
  currentAssessment: {
    title: string;
    progress: number;
    total: number;
    lastUpdated: string;
  } | null;
  onStartAssessment: () => void;
  onContinueAssessment: () => void;
}

export const AssessmentSection: React.FC<AssessmentSectionProps> = ({
  currentAssessment,
  onStartAssessment,
  onContinueAssessment,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Current Assessment Card */}
      {currentAssessment && (
        <DashboardCard
          title={t("userComponents.assessment.title")}
          description={t("userComponents.assessment.description")}
          icon={Clock}
          variant="default"
          actionText={t("userComponents.assessment.continue")}
          onAction={onContinueAssessment}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">
                {currentAssessment.title}
              </h4>
              <p className="text-sm text-gray-600">
                {t("userComponents.assessment.lastUpdated", { date: currentAssessment.lastUpdated })}
              </p>
            </div>
            <ProgressIndicator
              current={currentAssessment.progress}
              total={currentAssessment.total}
              label={t("userComponents.assessment.progressLabel")}
              variant="success"
            />
          </div>
        </DashboardCard>
      )}

      {/* Quick Actions */}
      <DashboardCard
        title={t("userComponents.actions.title")}
        description={t("userComponents.actions.description")}
        icon={Play}
        variant="success"
      >
        <div className="space-y-3">
          <Button className="w-full" onClick={onStartAssessment}>
            <Play className="h-4 w-4 mr-2" />
            {t("userComponents.actions.startNew")}
          </Button>
          <Button variant="outline" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("userComponents.actions.viewReports")}
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
};
