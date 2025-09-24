/**
 * Main layout component that provides consistent structure for all pages.
 * This layout includes:
 * - Global navigation bar
 * - Toast notifications
 * - Conditional navbar display based on route
 * - Consistent page structure
 */
import { Toaster } from "@/components/ui/sonner";
import * as React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Routes that should not show the navbar (like login page if you have one)
  const routesWithoutNavbar = ["/login"];
  const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? "pt-16" : ""}>{children}</main>
      <Toaster />
    </div>
  );
};

export default MainLayout;
