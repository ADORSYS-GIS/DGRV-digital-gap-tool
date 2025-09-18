/**
 * Not found page component that handles 404 errors.
 * This component redirects users back to the home page when a route is not found.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
};

export default NotFound;
