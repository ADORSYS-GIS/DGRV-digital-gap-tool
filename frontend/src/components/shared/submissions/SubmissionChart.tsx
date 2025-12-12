// @ts-nocheck
import React from "react";
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
import type { AssessmentSummaryResponse } from "@/openapi-client";

interface SubmissionChartProps {
  submission: AssessmentSummaryResponse;
}

const SubmissionChart: React.FC<SubmissionChartProps> = ({ submission }) => {
  const chartData = submission.dimension_assessments.map((da) => ({
    name: da.dimension.dimension_name,
    "Current State": da.current_state.level,
    "Desired State": da.desired_state.level,
  }));

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
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Current State" fill="#8884d8" />
        <Bar dataKey="Desired State" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SubmissionChart;