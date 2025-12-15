import { IRecommendation } from "@/types/recommendation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditRecommendationForm } from "./EditRecommendationForm";
import { useDeleteRecommendation } from "@/hooks/recommendations/useDeleteRecommendation";
import { Badge } from "@/components/ui/badge";
import { SyncStatus } from "@/types/sync";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface RecommendationCardProps {
  recommendation: IRecommendation;
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const deleteRecommendation = useDeleteRecommendation();
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (
      window.confirm(
        t("admin.recommendations.card.deleteConfirm", {
          defaultValue:
            "Are you sure you want to delete this recommendation?",
        }),
      )
    ) {
      await deleteRecommendation.mutate(recommendation.id);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              <CardDescription className="mt-1">
                {recommendation.description?.substring(0, 100)}
                {recommendation.description &&
                recommendation.description.length > 100
                  ? "..."
                  : ""}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "ml-2",
                recommendation.syncStatus === SyncStatus.SYNCED
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800",
              )}
            >
              {recommendation.syncStatus === SyncStatus.SYNCED
                ? t("admin.recommendations.card.synced", { defaultValue: "Synced" })
                : t("admin.recommendations.card.pending", { defaultValue: "Pending" })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2 mt-auto">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {recommendation.category && (
                <span className="font-medium">{recommendation.category}</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                disabled={deleteRecommendation.isPending}
              >
                <Pencil className="h-4 w-4 mr-1" />
                {t("admin.recommendations.card.edit", { defaultValue: "Edit" })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteRecommendation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deleteRecommendation.isPending
                  ? t("admin.recommendations.card.deleting", { defaultValue: "Deleting..." })
                  : t("admin.recommendations.card.delete", { defaultValue: "Delete" })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditRecommendationForm
        recommendation={recommendation}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />
    </>
  );
}
