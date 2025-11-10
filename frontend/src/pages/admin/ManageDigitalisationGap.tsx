/**
 * Page for managing digitalisation gaps.
 * This page allows administrators to view, add, edit, and delete digitalisation gaps.
 */

import { useMemo } from "react";
import { AddGapForm } from "@/components/admin/gaps/AddGapForm";
import { GapList } from "@/components/admin/gaps/GapList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gap } from "@/types/gap";

import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";
import { useDimensions } from "@/hooks/dimensions/useDimensions";

const ManageDigitalisationGap: React.FC = () => {
  const { data: gaps, isLoading: gapsLoading } = useDigitalisationGaps();
  const { data: dimensions, isLoading: dimensionsLoading } = useDimensions();

  const dimensionMap = useMemo(() => {
    if (!dimensions) return {};
    return dimensions.reduce((acc, dim) => {
      acc[dim.id] = dim.name;
      return acc;
    }, {} as Record<string, string>);
  }, [dimensions]);

  const groupedGaps = useMemo(() => {
    if (!gaps) return {};
    return gaps.reduce((acc, gap) => {
      const categoryName = dimensionMap[gap.category] || gap.category;
      (acc[categoryName] = acc[categoryName] || []).push(gap);
      return acc;
    }, {} as Record<string, Gap[]>);
  }, [gaps, dimensionMap]);

  const isLoading = gapsLoading || dimensionsLoading;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Digitalisation Gaps</h1>
          <p className="text-muted-foreground">
            Add and manage digitalisation gap profiles and data
          </p>
        </div>
        <AddGapForm />
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && gaps && Object.keys(groupedGaps).length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-lg">No gaps created yet.</p>
          <p>Click "Add Gap" to get started.</p>
        </div>
      )}
      {!isLoading &&
        Object.entries(groupedGaps).map(([category, categoryGaps]) => (
          <Card key={category} className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <GapList gaps={categoryGaps as Gap[]} dimensionMap={dimensionMap} />
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default ManageDigitalisationGap;
