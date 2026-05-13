import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ children, requiredRole = "customer" }) => {
  const location = useLocation();

  const { isAuthenticated, user_data } = useSelector((state) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector(
    (state) => state.profile,
  );

  // Roles check
  const isVendor = Boolean(
    user_data?.vendor_id ||
    user_data?.user?.vendor_id ||
    profileData?.user?.vendor_id,
  );

  const isStaff = Boolean(
    user_data?.is_staff ||
    user_data?.user?.is_staff ||
    profileData?.user?.is_staff ||
    user_data?.is_superuser ||
    user_data?.user?.is_superuser ||
    profileData?.user?.is_superuser,
  );

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile to finish loading before making role decisions if we don't have flags yet
  const hasStaffFlag = isStaff || (requiredRole === "staff" && isStaff);
  const hasVendorFlag = isVendor || (requiredRole === "vendor" && isVendor);

  // If we are authenticated but don't have the profile data yet, and don't have flags from user_data, WAIT.
  if (
    (requiredRole === "vendor" || requiredRole === "staff") &&
    !profileData &&
    !isStaff &&
    !isVendor
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Vendor-only route
  if (requiredRole === "vendor" && !isVendor) {
    return <Navigate to="/create-vendor" replace />;
  }

  // Staff-only route
  if (requiredRole === "staff" && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleProtectedRoute;
