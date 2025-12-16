import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { AssessmentSummary } from "@/types/assessment";
import { Calendar, CheckCircle, FileText, Shield } from "lucide-react";
import { DimensionAssessmentDetail } from "./DimensionAssessmentDetail";

interface SubmissionDetailProps {
  summary: AssessmentSummary | undefined;
}

export const SubmissionDetail = ({ summary }: SubmissionDetailProps) => {
  const { data: dimensions } = useDimensions();

  if (!summary || !summary.assessment) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Unable to load submission details. Please go back and try again.
      </div>
    );
  }

  const submission = summary;

  const getDimensionName = (dimensionId: string) => {
    return (
      dimensions?.find((d) => d.id === dimensionId)?.name || "Unknown Dimension"
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-border">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {submission.assessment.document_title || "Untitled assessment"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Submission overview and dimension outcomes.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-xl border border-muted/30 bg-muted/30 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-border/60">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Status
                </p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {submission.assessment.status || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-border/60">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Submitted at
                </p>
                <p className="text-sm font-medium text-foreground">
                  {submission.assessment.created_at
                    ? new Date(
                        submission.assessment.created_at,
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Dimension assessments
              </h2>
              <p className="text-sm text-muted-foreground">
                Review current vs desired states and gap analysis for each
                dimension.
              </p>
            </div>
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          {(submission.dimension_assessments || []).length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No dimension assessments available for this submission.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {(submission.dimension_assessments || []).map((da) => (
                <AccordionItem
                  key={da.dimension_assessment_id}
                  value={da.dimension_assessment_id}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-muted/40">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold text-foreground">
                        {getDimensionName(da.dimension_id)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Gap score: {da.gap_score ?? "—"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <DimensionAssessmentDetail
                      dimensionId={da.dimension_id}
                      currentStateId={da.current_state_id}
                      desiredStateId={da.desired_state_id}
                      gapScore={da.gap_score}
                      gapId={da.gap_id}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
