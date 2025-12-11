import React from "react";
import { useTranslation } from "react-i18next";

const ViewReports: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("viewReports.title")}</h1>
      <p>{t("viewReports.description")}</p>
    </div>
  );
};

export default ViewReports;
