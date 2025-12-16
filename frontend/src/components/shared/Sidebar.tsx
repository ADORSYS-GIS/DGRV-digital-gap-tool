import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  to: string;
  icon: React.ElementType;
  text: string;
}

interface SidebarProps {
  navLinks: NavLink[];
  panelName: string;
  panelAbbreviation: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navLinks,
  panelName,
  panelAbbreviation,
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-slate-900 text-white shadow-lg h-screen sticky top-0 transition-all duration-300",
        isOpen ? "w-72" : "w-20",
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-white/10 relative">
        <div
          className={cn(
            "h-9 w-9 rounded-lg bg-primary/30 flex items-center justify-center text-base font-bold text-white",
            !isOpen && "w-full",
          )}
        >
          {panelAbbreviation}
        </div>
        {isOpen && (
          <span className="ml-4 text-base font-semibold tracking-tight">
            {panelName}
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-1"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", !isOpen && "rotate-180")}
          />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white",
                !isOpen && "justify-center",
              )}
            >
              <link.icon className="h-5 w-5" />
              {isOpen && <span>{link.text}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};