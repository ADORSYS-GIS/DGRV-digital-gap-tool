import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface ExportReportsCardProps {
  onExportPDF: () => void;
  onExportDOCX: () => void;
}

export const ExportReportsCard: React.FC<ExportReportsCardProps> = ({
  onExportPDF,
  onExportDOCX,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col border-l-4 border-red-500">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-red-500">
            <FileDown className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Export Reports
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Download your reports
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center space-y-4">
        <Button onClick={onExportPDF} className="w-full" variant="outline">
          Export as PDF
        </Button>
        <Button onClick={onExportDOCX} className="w-full" variant="outline">
          Export as DOCX
        </Button>
      </CardContent>
    </Card>
  );
};