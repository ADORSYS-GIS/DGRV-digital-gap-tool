import React from "react";
import {
  Cpu,
  Users,
  GraduationCap,
  Cog,
  Shield,
  Heart,
  Database,
  Lightbulb,
  Landmark,
  DollarSign,
  Server,
  Handshake,
  HelpCircle,
} from "lucide-react";

interface DimensionIconProps {
  name: string;
  className?: string;
}

export const DimensionIcon: React.FC<DimensionIconProps> = ({
  name,
  className,
}) => {
  const getIcon = (dimensionName: string) => {
    const lowerCaseName = dimensionName.toLowerCase();
    if (lowerCaseName.includes("technology")) return Cpu;
    if (lowerCaseName.includes("digital culture")) return Users;
    if (lowerCaseName.includes("skills")) return GraduationCap;
    if (lowerCaseName.includes("processes")) return Cog;
    if (
      lowerCaseName.includes("cybersecurity") ||
      lowerCaseName.includes("security")
    )
      return Shield;
    if (lowerCaseName.includes("customer experience")) return Heart;
    if (lowerCaseName.includes("data & analytics")) return Database;
    if (lowerCaseName.includes("innovation")) return Lightbulb;
    if (lowerCaseName.includes("governance")) return Landmark;
    if (lowerCaseName.includes("financial")) return DollarSign;
    if (lowerCaseName.includes("infrastructure")) return Server;
    if (lowerCaseName.includes("human capacity")) return Users;
    if (lowerCaseName.includes("member services")) return Handshake;
    return HelpCircle;
  };

  const Icon = getIcon(name);
  return <Icon className={className} />;
};
