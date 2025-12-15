import React from "react";
import { useTranslation } from "react-i18next";

const ManageActionPlan: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("manageActionPlan.title")}</h1>
      <p>{t("manageActionPlan.description")}</p>
    </div>
  );
};

export default ManageActionPlan;
