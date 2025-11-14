import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming badge can be used for traffic light colors

interface GapVisualizationProps {
  perspective: string;
  gapSeverity: number; // e.g., 0 for no gap, 1-5 for increasing severity
  recommendations: string[];
}

const getTrafficLightColor = (severity: number) => {
  if (severity === 0) return "bg-green-500";
  if (severity >= 1 && severity <= 2) return "bg-yellow-500";
  if (severity >= 3) return "bg-red-500";
  return "bg-gray-400"; // Default for unknown severity
};

const GapVisualization: React.FC<GapVisualizationProps> = ({
  perspective,
  gapSeverity,
  recommendations,
}) => {
  const trafficLightColor = getTrafficLightColor(gapSeverity);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{perspective} Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <span className="font-semibold">Gap Severity:</span>
          <Badge className={`h-6 w-6 rounded-full ${trafficLightColor}`} />
          <span>{gapSeverity === 0 ? "No Gap" : `Level ${gapSeverity}`} </span>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Recommendations:</h3>
          {recommendations.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p>No specific recommendations for this gap level.</p>
          )}
        </div>

        {/* Placeholder for a more complex chart */}
        <div className="mt-6 p-4 border rounded-md bg-gray-50 text-gray-600">
          <p>[Future Bar Chart Visualization Here]</p>
          <p className="text-sm">
            A bar chart could visually represent the current vs. to-be states
            and the calculated gap.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GapVisualization;
