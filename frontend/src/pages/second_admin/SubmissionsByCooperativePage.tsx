import { useState } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SubmissionList } from "@/components/shared/submissions/SubmissionList";
import { Badge } from "@/components/ui/badge";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";
import { Building2, ChevronDown, ChevronRight } from "lucide-react";

function CooperativeSubmissions({ cooperation }: { cooperation: Cooperation }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: submissions = [], isLoading } = useSubmissionsByCooperation(
    cooperation.id,
    { enabled: isOpen },
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{cooperation.name}</p>
          {cooperation.description && (
            <p className="text-xs text-muted-foreground truncate">{cooperation.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0">
          {isLoading && isOpen ? "…" : `${isOpen ? submissions.length : "?"} submission${submissions.length !== 1 ? "s" : ""}`}
        </Badge>
        {isOpen
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t border-border px-5 py-4">
          {isLoading ? (
            <div className="flex justify-center py-4"><LoadingSpinner /></div>
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
        </div>
      )}
    </div>
  );
}

export default function SubmissionsByCooperativePage() {
  const organizationId = useOrganizationId();
  const { data: cooperations = [], isLoading } = useCooperations(organizationId || undefined);

  return (
    <div className="space-y-6 overflow-y-auto h-full">
      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent px-6 py-5 border border-primary/10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View assessment submissions grouped by cooperative.
        </p>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && cooperations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No cooperatives found. Create cooperatives first to see their submissions.
        </div>
      )}

      <div className="space-y-3">
        {cooperations.map((coop) => (
          <CooperativeSubmissions key={coop.id} cooperation={coop} />
        ))}
      </div>
    </div>
  );
}
