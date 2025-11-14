import { useState } from "react";
import { Button } from "../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddAssessmentForm } from "../../components/second_admin/assessments/AddAssessmentForm";
import { AssessmentList } from "../../components/second_admin/assessments/AssessmentList";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { useAssessments } from "../../hooks/assessments/useAssessments";

export default function ManageAssessments() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { data: assessments, isLoading, error } = useAssessments();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Assessments
        </h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {assessments && <AssessmentList assessments={assessments} />}

      <AddAssessmentForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
