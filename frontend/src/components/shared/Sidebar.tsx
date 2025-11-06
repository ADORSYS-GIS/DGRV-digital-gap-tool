import React from "react";
import { NavLink } from "react-router-dom";
import { DGRV_LOGO } from "@/constants/images";
import { LucideProps } from "lucide-react";

interface SidebarProps {
  navigation: {
    name: string;
    href: string;
    icon: React.ComponentType<LucideProps>;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ navigation }) => {
  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <img src={DGRV_LOGO} alt="DGRV Logo" className="h-8" />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ${
                isActive ? "bg-gray-700 text-white" : ""
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};