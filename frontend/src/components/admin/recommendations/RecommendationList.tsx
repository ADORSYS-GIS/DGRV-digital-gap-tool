import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IRecommendation } from "@/types/recommendation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { EditRecommendationForm } from "./EditRecommendationForm";
import { useDeleteRecommendation } from "@/hooks/recommendations/useDeleteRecommendation";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDimensions } from "@/hooks/dimensions/useDimensions";

interface RecommendationListProps {
  recommendations: IRecommendation[];
}

export function RecommendationList({
  recommendations,
}: RecommendationListProps) {
  const [editingRecommendation, setEditingRecommendation] =
    useState<IRecommendation | null>(null);
  const deleteRecommendation = useDeleteRecommendation();
  const { data: dimensions = [] } = useDimensions();
  const { t } = useTranslation();

  // Group recommendations by dimension_id
  const groupedRecommendations = useMemo(() => {
    return recommendations.reduce(
      (acc, rec) => {
        const dimension = dimensions.find((d) => d.id === rec.dimension_id);
        const dimensionName =
          dimension?.name ||
          t("admin.recommendations.list.uncategorized", {
            defaultValue: "Uncategorized",
          });

        if (!acc[dimensionName]) {
          acc[dimensionName] = [];
        }
        acc[dimensionName].push(rec);
        return acc;
      },
      {} as Record<string, IRecommendation[]>,
    );
  }, [recommendations, dimensions, t]);

  if (recommendations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>
          {t("admin.recommendations.list.empty.title", {
            defaultValue: "No recommendations found.",
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("admin.recommendations.list.empty.subtitle", {
            defaultValue: 'Click "Add Recommendation" to create one.',
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("admin.recommendations.list.title", {
            defaultValue: "Recommendations",
          })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("admin.recommendations.list.total", {
            count: recommendations.length,
            dimensionCount: Object.keys(groupedRecommendations).length,
            defaultValue:
              "{{count}} total recommendations across {{dimensionCount}} dimensions",
          })}
        </p>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {Object.entries(groupedRecommendations).map(
          ([dimensionName, dimensionRecs]) => (
            <AccordionItem
              value={dimensionName}
              key={dimensionName}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-800">{dimensionName}</span>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {dimensionRecs.length}{" "}
                    {t("admin.recommendations.table.recommendation", {
                      count: dimensionRecs.length,
                      defaultValue:
                        "{{count}} recommendation",
                    })}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white">
                <div className="border-t border-slate-100">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[120px]">
                          {t("admin.recommendations.table.priority", {
                            defaultValue: "Priority",
                          })}
                        </TableHead>
                        <TableHead>
                          {t("admin.recommendations.table.description", {
                            defaultValue: "Description",
                          })}
                        </TableHead>
                        <TableHead className="w-[120px] text-right">
                          {t("admin.recommendations.table.actions", {
                            defaultValue: "Actions",
                          })}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {dimensionRecs.map((recommendation) => (
                        <TableRow
                          key={recommendation.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <TableCell className="py-3">
                            <Badge
                              variant={
                                recommendation.priority === "HIGH"
                                  ? "destructive"
                                  : recommendation.priority === "MEDIUM"
                                    ? "default"
                                    : "success"
                              }
                              className="capitalize font-medium px-2 py-1 text-xs"
                            >
                              {recommendation.priority?.toLowerCase() || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="max-w-[500px] line-clamp-2 text-slate-700">
                              {recommendation.description}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                onClick={() =>
                                  setEditingRecommendation(recommendation)
                                }
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  {t("admin.recommendations.card.edit", {
                                    defaultValue: "Edit",
                                  })}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      t(
                                        "admin.recommendations.card.deleteConfirm",
                                        {
                                          defaultValue:
                                            "Are you sure you want to delete this recommendation?",
                                        },
                                      ),
                                    )
                                  ) {
                                    await deleteRecommendation.mutate(
                                      recommendation.id,
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  {t("admin.recommendations.card.delete", {
                                    defaultValue: "Delete",
                                  })}
                                </span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ),
        )}
      </Accordion>

      <EditRecommendationForm
        isOpen={!!editingRecommendation}
        onClose={() => setEditingRecommendation(null)}
        recommendation={editingRecommendation}
      />
    </div>
  );
}
