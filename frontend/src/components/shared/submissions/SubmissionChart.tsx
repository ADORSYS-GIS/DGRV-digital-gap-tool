import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AssessmentSummary } from "@/types/assessment";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { dimensionAssessmentRepository } from "@/services/assessments/dimensionAssessmentRepository";
import { LoadingSpinner } from "../LoadingSpinner";

interface SubmissionChartProps {
  submission: AssessmentSummary;
}

interface ChartDataItem {
  name: string;
  "Current State": number;
  "Desired State": number;
}

const SubmissionChart: React.FC<SubmissionChartProps> = ({ submission }) => {
  const { data: dimensions } = useDimensions();
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStateScores = async () => {
      if (!submission?.dimension_assessments || !dimensions) return;

      setIsLoading(true);
      try {
        const data = await Promise.all(
          submission.dimension_assessments.map(async (da) => {
            const dimension = dimensions.find((d) => d.id === da.dimension_id);
            const dimensionName = dimension?.name || "Unknown";

            try {
              // Fetch dimension with states to get scores
              const dimWithStates =
                await dimensionAssessmentRepository.getDimensionWithStates(
                  da.dimension_id,
                );

              const currentState = dimWithStates.current_states?.find(
                (s) => s.id === da.current_state_id,
              );
              const desiredState = dimWithStates.desired_states?.find(
                (s) => s.id === da.desired_state_id,
              );

              // The IDimensionState interface has a 'level' property, but the API response might map it differently.
              // Based on IDimensionState definition: level: number;
              // However, if the API returns 'score' instead of 'level', we need to handle that.
              // Let's check if we need to cast or if the property is indeed 'level'.
              // Looking at IDimensionState in frontend/src/types/dimension.ts, it has 'level'.
              // But let's be safe and check for 'score' as well if 'level' is missing, just in case of type mismatch at runtime.

              const currentLevel =
                currentState?.score ?? currentState?.level ?? 0;
              const desiredLevel =
                desiredState?.score ?? desiredState?.level ?? 0;

              return {
                name: dimensionName,
                "Current State": currentLevel,
                "Desired State": desiredLevel,
              };
            } catch (error) {
              console.error(
                `Error fetching states for dimension ${da.dimension_id}:`,
                error,
              );
              return {
                name: dimensionName,
                "Current State": 0,
                "Desired State": 0,
              };
            }
          }),
        );
        setChartData(data);
      } catch (error) {
        console.error("Error building chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStateScores();
  }, [submission, dimensions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        No data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barGap={10}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={{ stroke: "#d1d5db" }}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={{ stroke: "#d1d5db" }}
        />
        <Tooltip
          cursor={{ fill: "rgba(243, 244, 246, 0.5)" }}
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: "20px",
          }}
        />
        <Bar
          dataKey="Current State"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          background={{ fill: "#f3f4f6", radius: 4 }}
        />
        <Bar
          dataKey="Desired State"
          fill="#f97316"
          radius={[4, 4, 0, 0]}
          background={{ fill: "#f3f4f6", radius: 4 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SubmissionChart;
