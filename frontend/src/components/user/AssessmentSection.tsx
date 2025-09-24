/**
 * Assessment section component for managing user assessments.
 * This component provides:
 * - Display of current ongoing assessment
 * - Progress tracking for assessments
 * - Quick action buttons for starting/continuing assessments
 * - Integration with dashboard card styling
 */
import React from "react";
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
  return (
    <div className="space-y-6">
      {/* Current Assessment Card */}
      {currentAssessment && (
        <DashboardCard
          title="Current Assessment"
          description="Continue your ongoing digital gap assessment"
          icon={Clock}
          variant="default"
          actionText="Continue"
          onAction={onContinueAssessment}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">
                {currentAssessment.title}
              </h4>
              <p className="text-sm text-gray-600">
                Last updated: {currentAssessment.lastUpdated}
              </p>
            </div>
            <ProgressIndicator
              current={currentAssessment.progress}
              total={currentAssessment.total}
              label="Assessment Progress"
              variant="success"
            />
          </div>
        </DashboardCard>
      )}

      {/* Quick Actions */}
      <DashboardCard
        title="Quick Actions"
        description="Start a new assessment or view your progress"
        icon={Play}
        variant="success"
      >
        <div className="space-y-3">
          <Button className="w-full" onClick={onStartAssessment}>
            <Play className="h-4 w-4 mr-2" />
            Start New Assessment
          </Button>
          <Button variant="outline" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Progress Reports
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
};
