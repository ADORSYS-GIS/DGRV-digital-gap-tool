import { Toaster } from "@/components/ui/sonner";
import * as React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const routesWithoutNavbar = ["/login"];
  const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      {shouldShowNavbar && <Navbar />}
      <OfflineBanner />
      <main className={`flex-1 overflow-auto ${shouldShowNavbar ? "pt-16" : ""}`}>
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default MainLayout;
