/**
 * Submission Detail Page for the Second Admin Dashboard.
 * This page displays the detailed information of a single assessment submission.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useActionItems } from "@/hooks/actionItems/useActionItems";
import { Submission } from "@/types/submission";
import { Assessment } from "@/types/assessment";
import { Dimension } from "@/types/dimension";
import { ActionItem } from "@/types/actionItem";
import { DigitalisationLevel } from "@/types/digitalisationLevel";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";
import * as React from "react";
import { useParams } from "react-router-dom";

const SubmissionDetailPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const { data: submissions = [], isLoading: submissionsLoading } = useSubmissions();
    const { data: assessments = [], isLoading: assessmentsLoading } = useAssessments();
    const { data: dimensions = [], isLoading: dimensionsLoading } = useDimensions();
    const { data: actionItems = [], isLoading: actionItemsLoading } = useActionItems();

    const submission = submissions.find((s: Submission) => s.id === submissionId);
    const { data: digitalisationLevels = [], isLoading: levelsLoading } = useDigitalisationLevels(submission?.dimensionId || "");

    const isLoading = submissionsLoading || assessmentsLoading || dimensionsLoading || actionItemsLoading || levelsLoading;

    const getAssessmentName = (assessmentId: string) => {
        const assessment = assessments.find((a: Assessment) => a.id === assessmentId);
        return assessment ? assessment.name : "Unknown Assessment";
    };

    const getDimensionName = (dimensionId: string) => {
        const dimension = dimensions.find((d: Dimension) => d.id === dimensionId);
        return dimension ? dimension.name : "Unknown Dimension";
    };

    const getLevelText = (level: number, type: 'current' | 'desired') => {
        const digitalisationLevel = digitalisationLevels.find((l: DigitalisationLevel) => l.state === level && l.levelType === type);
        return digitalisationLevel ? digitalisationLevel.scope : "N/A";
    };

    const getRecommendations = (assessmentId: string, dimensionId: string) => {
        return actionItems
            .filter((item: ActionItem) => item.assessmentId === assessmentId && item.dimensionId === dimensionId)
            .map((item: ActionItem) => item.recommendation);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!submission) {
        return <div>Submission not found.</div>;
    }

    const gapPercentage = (submission.gap / 4) * 100;

    return (
        <div className="space-y-8 p-4 sm:p-6 md:p-8 bg-white min-h-screen">
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
            </div>
            <Card className="shadow-md rounded-xl border">
                <CardHeader className="bg-gray-50 border-b rounded-t-xl">
                    <CardTitle className="text-xl font-bold text-gray-800">{getAssessmentName(submission.assessmentId)}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{getDimensionName(submission.dimensionId)}</h3>
                                <div className="space-y-6">
                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <h4 className="font-semibold text-md text-blue-900 mb-1">Current Level</h4>
                                        <p className="text-gray-800">{getLevelText(submission.currentLevel, 'current')}</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-green-50">
                                        <h4 className="font-semibold text-md text-green-900 mb-1">To Be Level</h4>
                                        <p className="text-gray-800">{getLevelText(submission.desiredLevel, 'desired')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Gap Analysis</h4>
                                <div className="flex items-center justify-around p-4 border rounded-lg bg-gray-50">
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-600 text-sm">Gap</p>
                                        <p className="text-3xl font-bold text-red-600">{submission.gap}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-600 text-sm">Gap Score</p>
                                        <p className="text-xl font-bold text-yellow-600">{submission.gapScore}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${gapPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Recommendations</h4>
                                <ul className="space-y-3">
                                    {getRecommendations(submission.assessmentId, submission.dimensionId).map((rec, index) => (
                                        <li key={index} className="text-gray-800 bg-gray-100 p-3 rounded-lg shadow-sm">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubmissionDetailPage;