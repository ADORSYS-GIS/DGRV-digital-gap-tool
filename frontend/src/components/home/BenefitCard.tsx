import React from "react";
import { useTranslation } from "react-i18next";

interface BenefitCardProps {
  icon: React.ReactNode;
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  description,
  titleKey,
  descriptionKey,
}) => {
  const { t } = useTranslation();

  const resolvedTitle =
    titleKey ? t(titleKey, { defaultValue: title ?? "" }) : title ?? "";
  const resolvedDescription =
    descriptionKey
      ? t(descriptionKey, { defaultValue: description ?? "" })
      : description ?? "";

  return (
    <div className="text-center p-6">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {resolvedTitle}
      </h3>
      <p className="text-gray-600">{resolvedDescription}</p>
    </div>
  );
};
