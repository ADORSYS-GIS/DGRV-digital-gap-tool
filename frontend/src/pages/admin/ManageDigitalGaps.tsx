import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import { AddDigitalisationGapForm } from "@/components/admin/digitalisationGaps/AddDigitalisationGapForm";
import { DigitalisationGapList } from "@/components/admin/digitalisationGaps/DigitalisationGapList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ManageDigitalGaps() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const {
    data: digitalisationGaps,
    isLoading,
    error,
  } = useDigitalisationGaps();

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-10 border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Manage Digitalisation Gaps
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Define and manage potential gaps in digitalisation across different dimensions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 h-11 px-6 rounded-lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Digitalisation Gap
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">
          An error occurred: {(error as Error).message}
        </p>
      )}
      {digitalisationGaps && (
        <DigitalisationGapList digitalisationGaps={digitalisationGaps} />
      )}

      <AddDigitalisationGapForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
