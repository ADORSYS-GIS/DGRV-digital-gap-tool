import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";
import { Submission } from "@/types/submission";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (submissionId: string) => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const { data: submissions, isLoading } = useSubmissions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Select a report to export</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {submissions?.map((submission: Submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{submission.assessmentName || "Unknown Assessment"}</p>
                      <p className="text-sm text-gray-500">
                        Submission: {submission.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Generated: {new Date(submission.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                    <Button onClick={() => submission.id && onExport(submission.id)}>Select</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};