import { IDigitalisationLevel } from "@/types/digitalisationLevel";
import { LevelCard } from "./LevelCard";

interface LevelsListProps {
  levels: IDigitalisationLevel[];
}

export const LevelsList = ({ levels }: LevelsListProps) => {
  if (levels.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No levels found for this state.</p>
        <p>Click "Add Level" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      {levels
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => a.state - b.state)
        .map((level) => (
          <LevelCard key={level.id} level={level} existingLevels={levels} />
        ))}
    </div>
  );
};
