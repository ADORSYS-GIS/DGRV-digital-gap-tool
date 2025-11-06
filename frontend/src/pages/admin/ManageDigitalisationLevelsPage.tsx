import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";
import { AddLevelForm } from "@/components/admin/levels/AddLevelForm";
import { LevelsList } from "@/components/admin/levels/LevelsList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LevelType } from "@/types/digitalisationLevel";

export default function ManageDigitalisationLevelsPage() {
  const { dimensionId } = useParams<{ dimensionId: string }>();
  const [searchParams] = useSearchParams();
  const levelType = searchParams.get("levelType") as LevelType;

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const {
    data: levels,
    isLoading,
    error,
  } = useDigitalisationLevels(dimensionId || "");

  const filteredLevels = levels?.filter((level) => level.levelType === levelType);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Manage {levelType === "current" ? "Current" : "Desired"} Digitalisation Levels
        </h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Level
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && (
        <p className="text-red-500">An error occurred: {error.message}</p>
      )}
      {filteredLevels && <LevelsList levels={filteredLevels} />}

      <AddLevelForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        dimensionId={dimensionId || ""}
        levelType={levelType}
        existingLevels={filteredLevels || []}
      />
    </div>
  );
}