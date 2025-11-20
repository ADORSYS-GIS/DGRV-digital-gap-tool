import { Cooperation } from "@/types/cooperation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleCooperationCardProps {
  cooperation: Cooperation;
}

export const SimpleCooperationCard = ({
  cooperation,
}: SimpleCooperationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cooperation.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{cooperation.description}</p>
      </CardContent>
    </Card>
  );
};
