import { useState, useMemo } from "react";
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

  // Group recommendations by dimension_id
  const groupedRecommendations = useMemo(() => {
    return recommendations.reduce(
      (acc, rec) => {
        const dimension = dimensions.find((d) => d.id === rec.dimension_id);
        const dimensionName = dimension?.name || "Uncategorized";

        if (!acc[dimensionName]) {
          acc[dimensionName] = [];
        }
        acc[dimensionName].push(rec);
        return acc;
      },
      {} as Record<string, IRecommendation[]>,
    );
  }, [recommendations, dimensions]);

  if (recommendations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No recommendations found.</p>
        <p className="text-sm text-muted-foreground">
          Click "Add Recommendation" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recommendations</h2>
        <p className="text-sm text-muted-foreground">
          {recommendations.length} total recommendations across{" "}
          {Object.keys(groupedRecommendations).length} dimensions
        </p>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {Object.entries(groupedRecommendations).map(
          ([dimensionName, dimensionRecs]) => (
            <AccordionItem
              value={dimensionName}
              key={dimensionName}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 transition-colors hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900">
                    {dimensionName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {dimensionRecs.length}{" "}
                    {dimensionRecs.length === 1
                      ? "recommendation"
                      : "recommendations"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0 border-t border-gray-100">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                        <TableHead className="pl-6 h-12 font-medium text-gray-600 w-[120px]">
                          Priority
                        </TableHead>
                        <TableHead className="h-12 font-medium text-gray-600">
                          Description
                        </TableHead>
                        <TableHead className="pr-6 h-12 font-medium text-gray-600 w-[120px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dimensionRecs.map((recommendation) => (
                        <TableRow
                          key={recommendation.id}
                          className="hover:bg-gray-50/30 border-b border-gray-50 last:border-0"
                        >
                          <TableCell className="pl-6 py-4">
                            <Badge
                              variant={
                                recommendation.priority === "HIGH"
                                  ? "destructive"
                                  : recommendation.priority === "MEDIUM"
                                    ? "default"
                                    : "secondary"
                              }
                              className={`capitalize font-medium px-2.5 py-0.5 text-xs rounded-full shadow-none
                                ${
                                  recommendation.priority === "HIGH"
                                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                                    : recommendation.priority === "MEDIUM"
                                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                      : "bg-green-100 text-green-700 hover:bg-green-100"
                                }`}
                            >
                              {recommendation.priority?.toLowerCase() || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="max-w-[600px] text-gray-700 leading-relaxed">
                              {recommendation.description}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 py-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() =>
                                  setEditingRecommendation(recommendation)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this recommendation?",
                                    )
                                  ) {
                                    await deleteRecommendation.mutate(
                                      recommendation.id,
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
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
