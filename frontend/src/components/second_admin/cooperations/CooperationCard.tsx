import React from "react";
import { Cooperation } from "@/types/cooperation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditCooperationForm } from "./EditCooperationForm";
import { DeleteCooperationDialog } from "./DeleteCooperationDialog";
// import { AssignDimensionDialog } from "./AssignDimensionDialog";
import { ListTree } from "lucide-react";

interface CooperationCardProps {
  cooperation: Cooperation;
}

export const CooperationCard: React.FC<CooperationCardProps> = ({
  cooperation,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{cooperation.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          {cooperation.description}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <EditCooperationForm cooperation={cooperation} />
          {/* <DeleteCooperationDialog cooperationId={cooperation.id} /> */}
        </div>
        <Button variant="outline" size="sm" className="mt-2 w-full">
          <ListTree className="mr-2 h-4 w-4" /> Assign Dimensions
        </Button>
      </CardContent>
    </Card>
  );
};
