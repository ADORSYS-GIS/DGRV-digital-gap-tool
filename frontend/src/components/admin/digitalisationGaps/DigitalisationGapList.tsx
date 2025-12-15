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
          <AccordionItem value={dimensionName} key={dimensionName}>
            <AccordionTrigger className="rounded-lg border bg-slate-50 px-4 py-3 text-lg font-semibold shadow-sm hover:bg-slate-100">
              {dimensionName}
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="rounded-lg border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("admin.digitalisationGaps.table.description", {
                          defaultValue: "Description",
                        })}
                      </TableHead>
                      <TableHead>
                        {t("admin.digitalisationGaps.table.severity", {
                          defaultValue: "Severity",
                        })}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("admin.digitalisationGaps.table.actions", {
                          defaultValue: "Actions",
                        })}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gaps.map((gap) => (
                      <TableRow key={gap.id}>
                        <TableCell className="max-w-xs truncate">
                          {gap.scope}
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
