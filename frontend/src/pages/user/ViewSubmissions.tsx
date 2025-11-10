/**
 * View Submissions page for the Second Admin Dashboard.
 * This page displays a list of assessment submissions.
 */
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import * as React from "react";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { useActionItems } from "@/hooks/actionItems/useActionItems";
import { Submission } from "@/types/submission";
import { Assessment } from "@/types/assessment";
import { Dimension } from "@/types/dimension";
import { ActionItem } from "@/types/actionItem";

import { Link } from "react-router-dom";

const ViewSubmissions: React.FC = () => {
    const { data: submissions = [], isLoading: submissionsLoading } = useSubmissions();
    const { data: assessments = [], isLoading: assessmentsLoading } = useAssessments();
    const { data: dimensions = [], isLoading: dimensionsLoading } = useDimensions();

    const isLoading = submissionsLoading || assessmentsLoading || dimensionsLoading;

    const getDimensionName = (dimensionId: string) => {
        const dimension = dimensions.find((d: Dimension) => d.id === dimensionId);
        return dimension ? dimension.name : "Unknown Dimension";
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8">
            <div>
                <h1 className="text-3xl font-bold">View Submissions</h1>
                <p className="text-gray-600">A list of all your assessment submissions.</p>
            </div>

            {submissions.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Submissions Found</CardTitle>
                        <CardDescription>
                            You have not submitted any assessments yet.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {submissions.map((submission: Submission) => (
                        <Link to={`/dashboard/submissions/${submission.id}`} key={submission.id}>
                            <Card className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <CardTitle>{submission.assessmentName || "Unknown Assessment"}</CardTitle>
                                    <CardDescription>{getDimensionName(submission.dimensionId)}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewSubmissions;