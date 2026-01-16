import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IDigitalisationGapWithDimension } from "@/types/digitalisationGap";
import { useDeleteDigitalisationGap } from "@/hooks/digitalisationGaps/useDeleteDigitalisationGap";
import { AddDigitalisationGapForm } from "./AddDigitalisationGapForm";
import { useTranslation } from "react-i18next";

interface DigitalisationGapListProps {
  digitalisationGaps: IDigitalisationGapWithDimension[];
}

export function DigitalisationGapList({
  digitalisationGaps,
}: DigitalisationGapListProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<
    IDigitalisationGapWithDimension | undefined
  >(undefined);
  const [deletingGapId, setDeletingGapId] = useState<string | null>(null);
  const deleteMutation = useDeleteDigitalisationGap();
  const { t } = useTranslation();

  const groupedGaps = useMemo(() => {
    return digitalisationGaps.reduce(
      (acc, gap) => {
        const { dimensionName } = gap;
        if (!acc[dimensionName]) {
          acc[dimensionName] = [];
        }
        acc[dimensionName].push(gap);
        return acc;
      },
      {} as Record<string, IDigitalisationGapWithDimension[]>,
    );
  }, [digitalisationGaps]);

  const handleEdit = (gap: IDigitalisationGapWithDimension) => {
    setSelectedGap(gap);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingGapId(id);
    deleteMutation.mutate(id, {
      onSettled: () => {
        setDeletingGapId(null);
      },
    });
  };

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {Object.entries(groupedGaps).map(([dimensionName, gaps]) => (
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
                  {gaps.length} gaps
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0 border-t border-gray-100">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                      <TableHead className="pl-6 h-12 font-medium text-gray-600">
                        
                        {t("admin.digitalisationGaps.table.description", {
                          defaultValue: "Description",
                        })}
                      
                      </TableHead>
                      <TableHead className="h-12 font-medium text-gray-600 w-[150px]">
                        
                        {t("admin.digitalisationGaps.table.severity", {
                          defaultValue: "Severity",
                        })}
                      
                      </TableHead>
                      <TableHead className="pr-6 h-12 font-medium text-gray-600 text-right w-[120px]">
                        
                        {t("admin.digitalisationGaps.table.actions", {
                          defaultValue: "Actions",
                        })}
                      
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gaps.map((gap) => (
                      <TableRow
                        key={gap.id}
                        className="hover:bg-gray-50/30 border-b border-gray-50 last:border-0"
                      >
                        <TableCell className="pl-6 py-4 font-medium text-gray-700">
                          {gap.description}
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              gap.gap_severity === "HIGH"
                                ? "bg-red-100 text-red-700"
                                : gap.gap_severity === "MEDIUM"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {gap.gap_severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {t(`gap.severity.${String(gap.gap_severity).toLowerCase()}`, {
                            defaultValue: gap.gap_severity,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(gap)}
                            aria-label={t("common.edit", { defaultValue: "Edit" })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                aria-label={t("common.delete", { defaultValue: "Delete" })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("common.confirmTitle", {
                                    defaultValue: "Are you sure?",
                                  })}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    "admin.digitalisationGaps.deleteConfirm",
                                    {
                                      defaultValue:
                                        "This action cannot be undone. This will permanently delete the digitalisation gap.",
                                    },
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel", { defaultValue: "Cancel" })}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(gap.id)}
                                  disabled={
                                    deleteMutation.isPending &&
                                    deletingGapId === gap.id
                                  }
                                >
                                  {deleteMutation.isPending &&
                                  deletingGapId === gap.id
                                    ? t("common.deleting", {
                                        defaultValue: "Deleting...",
                                      })
                                    : t("common.delete", {
                                        defaultValue: "Delete",
                                      })}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {selectedGap && (
        <AddDigitalisationGapForm
          isOpen={isEditDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedGap(undefined);
          }}
          digitalisationGap={selectedGap}
        />
      )}
    </>
  );
}
