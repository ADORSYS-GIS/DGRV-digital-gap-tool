import React from "react";
import { useTranslation } from "react-i18next";

interface FeatureCardProps {
  icon: React.ReactNode;
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
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
    <div className="p-8 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{resolvedTitle}</h3>
      <p className="text-gray-600">{resolvedDescription}</p>
    </div>
  );
};
