/**
 * Application router component that handles all client-side routing.
 * This component sets up the React Router with the application's route configuration,
 * wraps all routes in the main layout, and provides recursive route rendering.
 */
import MainLayout from "@/layouts/MainLayout";
import { RouteConfig } from "@/types/router";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import routes from "./routes";

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map(({ path, element, children }, idx) => (
    <Route key={idx} path={path} element={element}>
      {children && renderRoutes(children)}
    </Route>
  ));
};

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>{renderRoutes(routes)}</Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
