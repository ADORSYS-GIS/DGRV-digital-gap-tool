/**
 * Application router component that handles all client-side routing.
 * This component sets up the React Router with the application's route configuration,
 * wraps all routes in the main layout, and provides recursive route rendering.
 */
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import MainLayout from "@/layouts/MainLayout";
import { RouteConfig } from "@/types/router";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import routes from "./routes";
import { useAuth } from "@/hooks/useAuth";

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map(({ path, element, children }, idx) => (
    <Route key={idx} path={path} element={element}>
      {children && renderRoutes(children)}
    </Route>
  ));
};

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <MainLayout>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>{renderRoutes(routes)}</Routes>
        </React.Suspense>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
