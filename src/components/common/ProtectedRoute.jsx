import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute Component
 * * Protects routes that require authentication.
 * Uses <Outlet /> to render child routes when used as a Layout Route.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If children are provided (direct wrapping), render them.
  // Otherwise, render <Outlet /> for Layout Route usage.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
