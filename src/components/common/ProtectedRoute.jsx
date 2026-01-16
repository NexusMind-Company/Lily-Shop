import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Preserves the attempted URL for redirect after login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;