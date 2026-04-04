import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ children, requiredRole = "customer" }) => {
  const location = useLocation();

  const { isAuthenticated, user_data } = useSelector((state) => state.auth);
  const { data: profileData, loading: profileLoading } = useSelector((state) => state.profile);

  // Backend truth: vendor_id exists => vendor
  const isVendor = Boolean(
    user_data?.vendor_id ||
    profileData?.user?.vendor_id
  );

  // 1️⃣ Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2️⃣ Wait for profile to finish loading before making role decisions.
  // This prevents a race condition on refresh where profileData is null
  // (async fetch not complete yet) causing vendors to be wrongly redirected.
  if (requiredRole === "vendor" && profileLoading && !profileData) {
    return null; // render nothing briefly while profile loads
  }

  // 3️⃣ Vendor-only route — only redirect once we know the profile
  if (requiredRole === "vendor" && !isVendor) {
    return <Navigate to="/create-vendor" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleProtectedRoute;