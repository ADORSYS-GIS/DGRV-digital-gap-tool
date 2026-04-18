import { useState, useEffect } from "react";
import { AssessmentSummary } from "@/types/assessment";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Leaf, Trash2, Building2 } from "lucide-react";
import { useDeleteAssessment } from "@/hooks/assessments/useDeleteAssessment";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/constants/roles";
import { db } from "@/services/db";
import { getGroup } from "@/openapi-client/services.gen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

// Resolve cooperation name — first from IndexedDB, then from API
function useCooperationName(cooperationId?: string | null): string | null {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (!cooperationId) return;
    let cancelled = false;
    (async () => {
      const coop = await db.cooperations.get(cooperationId);
      if (coop?.name) {
        if (!cancelled) setName(coop.name);
        return;
      }
      try {
        const response = await getGroup({ groupId: cooperationId });
        if (!cancelled && response?.name) setName(response.name);
      } catch {
        // silently ignore
      }
    })();
    return () => { cancelled = true; };
  }, [cooperationId]);
  return name;
}

interface SubmissionListProps {
  submissions: AssessmentSummary[];
  limit?: number;
  basePath: string;
  showOrganization?: boolean;
  onSubmissionSelect?: (submissionId: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "reviewed": return "success";
    case "under review": return "warning";
    case "draft": return "outline";
    case "completed": return "default";
    default: return "secondary";
  }
};

interface SubmissionItemData {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  status: string;
  overall_score: number | null;
  gaps_count: number;
}

const CooperationBadge = ({ cooperationId }: { cooperationId?: string | null | undefined }) => {
  const name = useCooperationName(cooperationId);
  if (!name) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Building2 className="h-3 w-3" />
      {name}
    </span>
  );
};

export const SubmissionList = ({
  submissions,
  limit,
  basePath,
  showOrganization = false,
  onSubmissionSelect,
}: SubmissionListProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const deleteAssessment = useDeleteAssessment();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<AssessmentSummary | null>(null);

  const userRoles = (user?.roles || []).map((role) => role.toLowerCase());
  const canDelete =
    userRoles.includes(ROLES.ORG_ADMIN.toLowerCase()) ||
    userRoles.includes(ROLES.COOP_ADMIN.toLowerCase());

  const items = limit ? submissions.slice(0, limit) : submissions;

  const handleSubmissionClick = (submissionId: string) => {
    if (onSubmissionSelect) onSubmissionSelect(submissionId);
  };

  const handleDeleteClick = (e: React.MouseEvent, submission: AssessmentSummary) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (submissionToDelete?.assessment?.assessment_id) {
      deleteAssessment.mutate(submissionToDelete.assessment.assessment_id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSubmissionToDelete(null);
        },
      });
    }
  };

  const getSubmissionData = (submission: AssessmentSummary): SubmissionItemData | null => {
    if (!submission || !submission.assessment) return null;
    return {
      id: submission.assessment.assessment_id || "unknown-id",
      name: submission.assessment.document_title || "Unnamed Assessment",
      organization_id: submission.assessment.organization_id || "",
      created_at: submission.assessment.created_at || new Date().toISOString(),
      status: submission.assessment.status || "draft",
      overall_score: submission.overall_score ?? null,
      gaps_count: submission.gaps_count ?? 0,
    };
  };

  if (items.length === 0) {
    return <div className="text-center py-8"><p className="text-gray-500">{t("sharedSubmissions.list.notFound")}</p></div>;
  }

  const validItems = items
    .map((submission) => ({ submission, data: getSubmissionData(submission) }))
    .filter((item) => item.data !== null) as Array<{ submission: AssessmentSummary; data: SubmissionItemData }>;

  if (validItems.length === 0) {
    return <div className="text-center py-8"><p className="text-gray-500">{t("sharedSubmissions.list.noValidFound")}</p></div>;
  }

  const renderContent = (submission: AssessmentSummary, submissionData: SubmissionItemData) => (
    <div className="flex-1 space-y-1">
      <div className="flex items-center space-x-2.5">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {submissionData.name}
        </h3>
        <Badge variant={getStatusVariant(submissionData.status)} className="text-xs font-medium px-2 py-0.5">
          {t(`sharedSubmissions.status.${submissionData.status.toLowerCase()}`, { defaultValue: submissionData.status })}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("sharedSubmissions.list.submittedOn")}{" "}
        {new Date(submissionData.created_at).toLocaleDateString(undefined, {
          year: "numeric", month: "long", day: "numeric",
        })}
      </p>
      <div className="pt-1 flex items-center gap-3 text-sm">
        <CooperationBadge cooperationId={submission.assessment?.cooperation_id} />
      </div>
      {submissionData.overall_score !== null && (
        <div className="pt-2 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <span className="font-semibold text-foreground">{submissionData.overall_score.toFixed(1)}%</span>
            <span className="ml-1.5 text-muted-foreground">{t("sharedSubmissions.list.overallScore")}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {validItems.map(({ submission, data: submissionData }) =>
        onSubmissionSelect ? (
          <button
            key={submissionData.id}
            onClick={() => handleSubmissionClick(submissionData.id)}
            className="w-full text-left border rounded-xl p-4 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-primary/10 rounded-full mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                {renderContent(submission, submissionData)}
              </div>
              <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center">
                {t("sharedSubmissions.list.viewDetails")}<span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </button>
        ) : (
          <div key={submissionData.id} className="border rounded-xl p-4 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group bg-card">
            <Link to={`${basePath}/submissions/${submissionData.id}`} className="block">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-primary/10 rounded-full mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  {renderContent(submission, submissionData)}
                </div>
                <div className="flex items-center gap-2">
                  {canDelete && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteClick(e, submission); }}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                      aria-label="Delete submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center">
                    {t("sharedSubmissions.list.viewDetails")}<span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ),
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sharedSubmissions.list.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sharedSubmissions.list.deleteDescription")}{" "}
              <span className="font-medium">
                {submissionToDelete?.assessment?.document_title || t("sharedSubmissions.list.thisSubmission")}
              </span>
              ? {t("sharedSubmissions.list.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssessment.isPending ? t("sharedSubmissions.list.deleting") : t("sharedSubmissions.list.deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
