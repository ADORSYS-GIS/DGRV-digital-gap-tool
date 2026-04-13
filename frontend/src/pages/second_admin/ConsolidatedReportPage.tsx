import { ConsolidatedReport } from "@/components/shared/reports/ConsolidatedReport";
import { useParams } from "react-router-dom";

const ConsolidatedReportPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();

  if (!organizationId) {
    return <div>Organization ID not found.</div>;
  }

  return (
    <div className="overflow-y-auto h-full">
      <ConsolidatedReport organizationId={organizationId} />
    </div>
  );
};

export default ConsolidatedReportPage;
