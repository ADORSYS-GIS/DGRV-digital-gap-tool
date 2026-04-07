import React from "react";
import { Link, useParams } from "react-router-dom";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { Building2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cooperation } from "@/types/cooperation";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

// Shows submissions for a single cooperative
function CooperativeSubmissions({ cooperation }: { cooperation: Cooperation }) {
  const { data: submissions = [], isLoading } = useSubmissionsByCooperation(
    cooperation.id,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{cooperation.name}</CardTitle>
          {cooperation.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {cooperation.description}
            </p>
          )}
        </div>
        <Badge variant="secondary">
          {isLoading ? "..." : `${submissions.length} submission${submissions.length !== 1 ? "s" : ""}`}
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No submissions yet for this cooperative.
          </p>
        ) : (
          <SubmissionList
            submissions={submissions.map((s) => ({
              ...s,
              id: s.assessment.assessment_id,
              syncStatus: SyncStatus.SYNCED,
              assessment: {
                ...s.assessment,
                started_at: s.assessment.started_at || null,
                completed_at: s.assessment.completed_at || null,
                dimensions_id: s.assessment.dimensions_id as string[],
              },
              overall_score: s.overall_score ?? null,
            }))}
            basePath="/second-admin"
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function SubmissionsByCooperativePage() {
  const organizationId = useOrganizationId();
  const { data: cooperations = [], isLoading } = useCooperations(
    organizationId || undefined,
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Submissions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mt-2">
          View assessment submissions grouped by cooperative.
        </p>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && cooperations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No cooperatives found. Create cooperatives first to see their submissions.
        </div>
      )}

      <div className="space-y-6">
        {cooperations.map((coop) => (
          <CooperativeSubmissions key={coop.id} cooperation={coop} />
        ))}
      </div>
    </div>
  );
}
