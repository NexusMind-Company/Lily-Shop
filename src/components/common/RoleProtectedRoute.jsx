import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ children, requiredRole = "customer" }) => {
  const location = useLocation();

  const { isAuthenticated, user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);

  // Backend truth: vendor_id exists => vendor
  const isVendor = Boolean(
    user_data?.vendor_id ||
    profileData?.user?.vendor_id
  );

  // 1️⃣ Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2️⃣ Vendor-only route
  if (requiredRole === "vendor" && !isVendor) {
    return <Navigate to="/vendor-dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleProtectedRoute;
