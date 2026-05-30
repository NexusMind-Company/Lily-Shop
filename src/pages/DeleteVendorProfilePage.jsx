import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { deleteUserVendorProfile } from "../services/subscriptionApi";
import { clearAuthTokens } from "../services/api";
import { handleLogout } from "../redux/authSlice";

const DeleteVendorProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const { user_data } = useSelector((state) => state.auth);
  const { data: profileData } = useSelector((state) => state.profile);
  
  const isVendor = Boolean(
    user_data?.vendor_id ||
    profileData?.user?.vendor_id
  );

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    try {
      await deleteUserVendorProfile();

      // Clear tokens and redux state on successful deletion
      clearAuthTokens();
      dispatch(handleLogout());

      toast.success("Your vendor profile has been successfully deleted.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to delete vendor profile:", error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to delete vendor profile. Please try again later.";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isVendor) {
    return (
      <div className="bg-white dark:bg-background-dark min-h-screen">
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3 text-gray-800 dark:text-white" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center text-gray-800 dark:text-white">
            Delete Vendor Profile
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-center">
            You don't have a vendor profile to delete.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-lily font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-background-dark min-h-screen">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} disabled={loading}>
          <ChevronLeft size={30} className="mr-3 text-gray-800 dark:text-white" />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center text-gray-800 dark:text-white">
          Delete Vendor Profile
        </h2>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            <h3 className="font-bold text-red-800 dark:text-red-400">Warning</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
            Deleting your vendor profile is permanent and cannot be undone. All your:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-red-700 dark:text-red-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Meal plans and subscriptions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Customer data and order history
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Earnings and payout information
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Reviews and ratings
            </li>
          </ul>
          <p className="mt-4 text-red-700 dark:text-red-300 text-sm font-medium">
            will be permanently deleted.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== "DELETE"}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Deleting...
              </>
            ) : (
              "Delete Vendor Profile"
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-4 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          Need help? Contact us at{" "}
          <a href="mailto:Info.lillyshops@gmail.com" className="text-lily hover:underline">
            Info.lillyshops@gmail.com
          </a>{" "}
          or{" "}
          <a href="tel:+2349033325971" className="text-lily hover:underline">
            +2349033325971
          </a>
        </p>
      </div>
    </div>
  );
};

export default DeleteVendorProfilePage;
