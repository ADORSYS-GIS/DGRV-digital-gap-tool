/**
 * User dashboard page that displays assessment information and user statistics.
 * This page provides:
 * - Welcome message with user name
 * - Quick statistics overview
 * - Assessment management section
 * - Placeholder for additional content
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/shared/useAuth";
import { DashboardCard } from "@/components/shared/DashboardCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FilePenLine,
  ClipboardList,
  Inbox,
  History,
} from "lucide-react";
import { ExportReportsCard } from "@/components/shared/ExportReportsCard";
import { ExportReportModal } from "@/components/shared/ExportReportModal";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [exportType, setExportType] = React.useState<"pdf" | "docx" | null>(
    null,
  );

  const handleExport = (submissionId: string) => {
    console.log(`Exporting submission ${submissionId} as ${exportType}`);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          User Dashboard
        </h1>
        <p className="text-md sm:text-lg text-gray-600 dark:text-gray-400 mt-2">
          Welcome back,{" "}
          <span className="font-semibold">{user?.name || user?.preferred_username || "User"}</span>.
          Here are your tools to manage your assessments and action plans.
        </p>
      </div>

      {/* Management Tools Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/dashboard/answer-assessment">
          <DashboardCard
            title="Answer Assessment"
            description="Fill out and manage your assessments"
            icon={FilePenLine}
            variant="default"
          />
        </Link>
        <Link to="/dashboard/action-plan">
          <DashboardCard
            title="View Action Plan"
            description="Review and track your action plans"
            icon={ClipboardList}
            variant="success"
          />
        </Link>
        <Link to="/dashboard/submissions">
          <DashboardCard
            title="View Submissions"
            description="Browse and manage your assessment submissions"
            icon={Inbox}
            variant="warning"
          />
        </Link>
      </div>

      {/* Recent History and Export Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden h-full flex flex-col border-l-4 border-gray-500">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                  <History className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent History</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    A log of your recent activities and events.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Recent history will be displayed here.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="w-full">
          <ExportReportsCard
            onExportPDF={() => {
              setExportType("pdf");
              setIsModalOpen(true);
            }}
            onExportDOCX={() => {
              setExportType("docx");
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      <ExportReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default Dashboard;
