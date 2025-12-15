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
                <span className="text-lg font-semibold text-gray-900">{dimensionName}</span>
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
                      <TableHead className="pl-6 h-12 font-medium text-gray-600">Description</TableHead>
                      <TableHead className="h-12 font-medium text-gray-600 w-[150px]">Severity</TableHead>
                      <TableHead className="pr-6 h-12 font-medium text-gray-600 text-right w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gaps.map((gap) => (
                      <TableRow key={gap.id} className="hover:bg-gray-50/30 border-b border-gray-50 last:border-0">
                        <TableCell className="pl-6 py-4 font-medium text-gray-700">
                          {gap.description}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${gap.gap_severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                              gap.gap_severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'}`}>
                            {gap.gap_severity}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(gap)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the digitalisation gap.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(gap.id)}
                                    disabled={
                                      deleteMutation.isPending &&
                                      deletingGapId === gap.id
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleteMutation.isPending &&
                                      deletingGapId === gap.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
