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
import { IDimensionAssessment, IDimensionState } from "@/types/dimension";
import { IDimension } from "@/types/dimension";

interface SubmissionChartProps {
  assessments: IDimensionAssessment[];
  dimensions: IDimension[];
  allDimensionStates: IDimensionState[];
  assessmentName?: string;
}

interface Payload {
  name: string;
  value: number;
  color: string;
  payload: {
    dimensionName: string;
    currentStateName: string;
    desiredStateName: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const { dimensionName, currentStateName, desiredStateName } =
      payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-lg mb-2">{dimensionName}</p>
        {payload.map((entry: Payload, index: number) => {
          const stateName =
            entry.name === "Current State"
              ? currentStateName
              : desiredStateName;
          return (
            <p
              key={`item-${index}`}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {`${entry.name}: ${entry.value}`}
              {stateName && (
                <span className="text-gray-500 ml-2">({stateName})</span>
              )}
            </p>
          );
        })}
      </div>
    );
  }

  return null;
};

export function SubmissionChart({
  assessments,
  dimensions,
  allDimensionStates,
  assessmentName,
}: SubmissionChartProps) {
  const chartData = assessments
    .map((da) => {
      const dimension = dimensions.find((d) => d.id === da.dimensionId);
      if (!dimension) return null;

      const allStates: IDimensionState[] = [
        ...allDimensionStates,
        da.currentState,
        da.desiredState,
      ];

      const currentState = allStates.find((s) => s.id === da.currentState.id);
      const desiredState = allStates.find((s) => s.id === da.desiredState.id);

      const currentStateName = currentState?.name ?? "N/A";
      const desiredStateName = desiredState?.name ?? "N/A";

      return {
        dimensionId: da.dimensionId,
        dimensionName: dimension.name,
        "Current State": currentState?.level ?? da.currentState.level,
        "Desired State": desiredState?.level ?? da.desiredState.level,
        currentStateName,
        desiredStateName,
      };
    })
    .filter(
      (
        item,
      ): item is {
        dimensionId: string;
        dimensionName: string;
        "Current State": number;
        "Desired State": number;
        currentStateName: string;
        desiredStateName: string;
      } => item !== null,
    );

  if (chartData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No assessment data to display.
      </div>
    );
  }

  return (
    <>
      {assessmentName && (
        <p className="text-xs font-medium text-muted-foreground mb-3">
          Assessment: <span className="text-foreground font-semibold">{assessmentName}</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dimensionName" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Current State" fill="#8884d8" />
        <Bar dataKey="Desired State" fill="#82ca9d" />
      </BarChart>
      </ResponsiveContainer>
    </>
  );
}
