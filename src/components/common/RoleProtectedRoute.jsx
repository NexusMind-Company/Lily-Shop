import { useState, useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleProtectedRoute = ({ children, requiredRole = "customer" }) => {
  const location = useLocation();

  const { isAuthenticated, user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);

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

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let timer;
    if (
      (requiredRole === "vendor" || requiredRole === "staff") &&
      !profileData &&
      !isStaff &&
      !isVendor
    ) {
      timer = setTimeout(() => {
        setTimedOut(true);
      }, 8000); // 8 second timeout
    }
    return () => clearTimeout(timer);
  }, [profileData, isStaff, isVendor, requiredRole]);

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we are authenticated but don't have the profile data yet, and don't have flags from user_data, WAIT.
  if (
    (requiredRole === "vendor" || requiredRole === "staff") &&
    !profileData &&
    !isStaff &&
    !isVendor
  ) {
    if (timedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <p className="text-gray-600 font-medium mb-4">
            Taking longer than expected to verify your account...
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-lily text-white rounded-full font-bold shadow-lg"
          >
            Retry
          </button>
        </div>
      );
    }
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
