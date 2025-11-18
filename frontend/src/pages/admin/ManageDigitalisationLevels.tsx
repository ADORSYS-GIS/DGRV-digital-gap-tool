import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AddLevelForm } from "@/components/admin/levels/AddLevelForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LevelsList } from "@/components/admin/levels/LevelsList";
import { LevelType } from "@/types/digitalisationLevel";

export default function ManageDigitalisationLevels() {
  const { dimensionId } = useParams<{ dimensionId: string }>();
  const [searchParams] = useSearchParams();
  const levelType = searchParams.get("levelType") as LevelType | null;
  const [isAddLevelDialogOpen, setAddLevelDialogOpen] = useState(false);

  const {
    data: levels,
    isLoading,
    error,
  } = useDigitalisationLevels(dimensionId!);

  const filteredLevels = useMemo(() => {
    if (!levels || !levelType) return [];
    return levels.filter((l) => l.levelType === levelType);
  }, [levels, levelType]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error.message}</p>;
  if (!levelType) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold">Please select a level type</h1>
      </div>
    );
  }

  const title =
    levelType === "current" ? "Manage Current State" : "Manage Desired State";

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Digitalisation Levels
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage the digitalisation levels for the {levelType} state.
              </CardDescription>
            </div>
            <Button
              onClick={() => setAddLevelDialogOpen(true)}
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Level
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <LevelsList levels={filteredLevels} />
        </CardContent>
      </Card>

      <AddLevelForm
        isOpen={isAddLevelDialogOpen}
        onClose={() => setAddLevelDialogOpen(false)}
        dimensionId={dimensionId!}
        levelType={levelType}
        existingLevels={filteredLevels}
      />
    </div>
  );
}
