/**
 * Navigation bar component that provides site navigation and user authentication.
 * This component includes:
 * - Responsive design with mobile sidebar
 * - User authentication status display
 * - Role-based navigation routing
 * - Mobile-friendly hamburger menu
 * - Logo and branding elements
 */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES } from "@/constants/roles";
import { useAuth } from "@/context/AuthContext";
import { Home, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();

  const roles =
    isAuthenticated && user
      ? [...(user.roles || []), ...(user.realm_access?.roles || [])].map((r) =>
        r.toLowerCase(),
      )
      : [];

  const hasAdminRole = roles.includes(ROLES.ADMIN);

  // Helper to get user display name
  const getUserDisplay = () => {
    if (!user) return "Profile";
    return user.name || user.preferred_username || user.email || "Profile";
  };

  // Helper to determine the appropriate home route based on user role
  const getHomeRoute = () => {
    if (!isAuthenticated || !user) {
      return "/";
    }

    const roles = [
      ...(user.roles || []),
      ...(user.realm_access?.roles || []),
    ].map((r) => r.toLowerCase());

    if (roles.includes(ROLES.ADMIN)) {
      return "/admin/dashboard";
    }
    if (roles.includes(ROLES.ORG_ADMIN)) {
      return "/second-admin/dashboard";
    }
    if (roles.includes(ROLES.COOP_ADMIN)) {
      return "/third-admin/dashboard";
    }
    if (roles.includes(ROLES.COOP_USER)) {
      return "/user/dashboard";
    }

    // Fallback for any other authenticated user
    return "/";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate(getHomeRoute())}
              >
                <div className="w-28 h-12 relative flex items-center justify-start">
                  <img
                    src="/dgrv.jpg"
                    alt="DGRV Logo"
                    className="h-full object-contain"
                  />
                </div>
              </div>

              {/* Desktop Home Button */}
              <div className="hidden md:flex items-center border-l border-gray-200 pl-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary hover:bg-primary/5 font-medium transition-all"
                  onClick={() => navigate(getHomeRoute())}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth/Profile */}
              <div className="hidden md:block">
                {!isAuthenticated ? (
                  <Button
                    onClick={login}
                    className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Sign In
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 pl-2 pr-4 py-1.5 h-auto hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-full transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-sm">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start text-sm">
                          <span className="font-semibold text-gray-700 leading-none mb-0.5">
                            {getUserDisplay()}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                            {roles[0] || 'User'}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2">
                      <div className="px-2 py-1.5 mb-1 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.name || user?.preferred_username || "User Profile"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <DropdownMenuItem
                        onClick={logout}
                        className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-md mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-blue-50 to-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/dgrv.jpg"
                  alt="DGRV Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dgrv-blue">DGRV</h2>
                <p className="text-xs text-gray-600">DGAT</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="p-2 hover:bg-blue-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Navigation Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Navigation
              </h3>

              {/* Home Button */}
              <Button
                variant="ghost"
                size="lg"
                className="w-full justify-start items-center space-x-4 h-12 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg"
                onClick={() => {
                  navigate(getHomeRoute());
                  closeSidebar();
                }}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Button>
            </div>

            {/* Auth Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Account
              </h3>

              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    login();
                    closeSidebar();
                  }}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-lg font-medium"
                >
                  <User className="w-5 h-5 mr-2" />
                  Login
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-800">
                          {user?.name ||
                            user?.preferred_username ||
                            user?.email ||
                            "Profile"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user?.email || "No data"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      logout();
                      closeSidebar();
                    }}
                    className="w-full h-12 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 rounded-lg font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="mt-auto pt-6 border-t border-blue-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  DGRV Sustainability Platform
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
