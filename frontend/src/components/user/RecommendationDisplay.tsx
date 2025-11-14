import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationDisplayProps {
  recommendations: string[];
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({
  recommendations,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recommended Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p>No specific recommendations for this gap level.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationDisplay;
