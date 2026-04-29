import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { useCooperationIdFromPath } from "@/hooks/cooperations/useCooperationIdFromPath";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useSubmissionsByCooperation } from "@/hooks/submissions/useSubmissionsByCooperation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { AssessmentSummary } from "@/types/assessment";
import { Cooperation } from "@/types/cooperation";
import { SyncStatus } from "@/types/sync";
import { Building2, ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

// ── Coop section (org admin view) ──────────────────────────────────────────
function CoopActionPlanSection({
  cooperation,
  basePath,
}: {
  cooperation: Cooperation;
  basePath: string;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: submissions = [], isLoading } = useSubmissionsByCooperation(
    cooperation.id,
    { enabled: isOpen },
  );

  const mapped: AssessmentSummary[] = submissions.map((s) => ({
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
  }));

  const completed = mapped.filter(
    (s) => s.assessment.status === "Completed" || s.assessment.status === "completed",
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
        {isOpen && !isLoading && (
          <Badge variant="secondary" className="shrink-0">
            {completed.length} {completed.length !== 1 ? t("sharedPages.actionPlans.list.plans", { defaultValue: "plans" }) : t("sharedPages.actionPlans.list.plan", { defaultValue: "plan" })}
          </Badge>
        )}
        {isOpen
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {isOpen && (
        <div className="border-t border-border">
          {isLoading ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : completed.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-4">
              {t("sharedPages.actionPlans.list.noCompletedSubmissions", { defaultValue: "No completed submissions for this cooperative yet." })}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {completed.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`${basePath}/action-plans/${s.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {s.assessment.document_title}
                      </p>
                      {s.assessment.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          {t("sharedPages.actionPlans.list.submitted", { defaultValue: "Submitted" })} {new Date(s.assessment.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Coop/user flat list (coop admin / coop user view) ──────────────────────
function CoopUserActionPlans({
  cooperationId,
  basePath,
}: {
  cooperationId: string;
  basePath: string;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: submissions = [], isLoading } = useSubmissionsByCooperation(cooperationId);

  const mapped: AssessmentSummary[] = submissions.map((s) => ({
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
  }));

  const completed = mapped.filter(
    (s) => s.assessment.status === "Completed" || s.assessment.status === "completed",
  );

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

  if (completed.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 text-sm text-muted-foreground">
        {t("sharedPages.actionPlans.list.noCompletedSubmissions", { defaultValue: "No completed submissions yet." })}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <ul className="divide-y divide-border">
        {completed.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => navigate(`${basePath}/action-plans/${s.id}`)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
            >
              <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {s.assessment.document_title}
                </p>
                {s.assessment.completed_at && (
                  <p className="text-xs text-muted-foreground">
                    {t("sharedPages.actionPlans.list.submitted", { defaultValue: "Submitted" })} {new Date(s.assessment.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ActionPlansListPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const organizationId = useOrganizationId();
  const cooperationIdFromRoute = useCooperationId();
  const { cooperationId: cooperationIdFromPath, isLoading: isLoadingCoopFromPath } =
    useCooperationIdFromPath();
  const cooperationId = cooperationIdFromRoute || cooperationIdFromPath || null;

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const isOrgAdmin = userRoles.includes(ROLES.ORG_ADMIN.toLowerCase());
  const isCoopAdmin = userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());
  const isCoopUser =
    userRoles.includes(ROLES.COOP_USER.toLowerCase()) ||
    isCoopAdmin;

  const { data: cooperations = [], isLoading: isLoadingCoops } = useCooperations(
    isOrgAdmin ? organizationId || undefined : undefined,
  );

  const location = useLocation();
  const isUserPath = location.pathname.startsWith("/user");
  const basePath = isOrgAdmin ? "/second-admin" : (isUserPath ? "/user" : "/third-admin");

  if (!isOrgAdmin && !isCoopUser) {
    return (
      <div className="rounded-xl border-l-4 border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        {t("sharedPages.actionPlans.list.noPermission", { defaultValue: "You don't have permission to view action plans." })}
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto h-full">
      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent px-6 py-5 border border-primary/10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("sharedPages.actionPlans.list.title", { defaultValue: "Action plans" })}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isOrgAdmin
            ? t("sharedPages.actionPlans.list.expandCoopDesc", { defaultValue: "Expand a cooperative to view and manage its action plans." })
            : t("sharedPages.actionPlans.list.selectSubmissionDesc", { defaultValue: "Select a completed submission to view its action plan." })}
        </p>
      </div>

      {/* Org admin: collapsible cooperatives */}
      {isOrgAdmin && (
        <>
          {isLoadingCoops && <LoadingSpinner />}
          {!isLoadingCoops && cooperations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("sharedPages.actionPlans.list.noCoops", { defaultValue: "No cooperatives found." })}
            </p>
          )}
          <div className="space-y-3">
            {cooperations.map((coop) => (
              <CoopActionPlanSection key={coop.id} cooperation={coop} basePath={basePath} />
            ))}
          </div>
        </>
      )}

      {/* Coop admin / coop user: flat list */}
      {isCoopUser && (
        <>
          {isLoadingCoopFromPath && <LoadingSpinner />}
          {!isLoadingCoopFromPath && !cooperationId && (
            <p className="text-sm text-destructive">
              {t("sharedPages.actionPlans.list.noCoopForAccount", { defaultValue: "No cooperative found for your account. Contact your administrator." })}
            </p>
          )}
          {cooperationId && (
            <CoopUserActionPlans cooperationId={cooperationId} basePath={basePath} />
          )}
        </>
      )}
    </div>
  );
}
