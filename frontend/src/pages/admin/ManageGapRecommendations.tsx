import React from "react";
import { useTranslation } from "react-i18next";

const ManageGapRecommendations: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminManageGapRecs.title")}</h1>
      <p>{t("adminManageGapRecs.subtitle")}</p>
    </div>
  );
};

export default ManageGapRecommendations;
