import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ children, requiredRole = "customer" }) => {
  const location = useLocation();

  const { isAuthenticated, user_data } = useSelector((state) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector(
    (state) => state.profile,
  );

  // Backend truth: vendor_id exists => vendor
  const isVendor = Boolean(
    user_data?.vendor_id || profileData?.user?.vendor_id,
  );
  const isStaff = Boolean(
    user_data?.is_staff ||
    profileData?.user?.is_staff ||
    user_data?.is_superuser ||
    profileData?.user?.is_superuser,
  );

  // 1️⃣ Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2️⃣ Wait for profile to finish loading before making role decisions.
  if (
    (requiredRole === "vendor" || requiredRole === "staff") &&
    profileLoading &&
    !profileData
  ) {
    return null; // render nothing briefly while profile loads
  }

  // 3️⃣ Vendor-only route
  if (requiredRole === "vendor" && !isVendor) {
    return <Navigate to="/create-vendor" replace />;
  }

  // 4️⃣ Staff-only route
  if (requiredRole === "staff" && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleProtectedRoute;
