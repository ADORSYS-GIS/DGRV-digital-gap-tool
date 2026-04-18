import { ConsolidatedReport } from "@/components/shared/reports/ConsolidatedReport";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ConsolidatedReportPage = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams<{ organizationId: string }>();

  if (!organizationId) {
    return <div>{t("secondAdmin.consolidatedReportPage.orgIdNotFound")}</div>;
  }

  return (
    <div className="overflow-y-auto h-full">
      <ConsolidatedReport organizationId={organizationId} />
    </div>
  );
};

export default ConsolidatedReportPage;
