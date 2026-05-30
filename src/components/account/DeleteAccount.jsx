import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { deleteUserAccount, clearAuthTokens } from "../../services/api";
import { useDispatch } from "react-redux";
import { handleLogout } from "../../redux/authSlice";
import toast from "react-hot-toast";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmText = window.confirm(
      "Are you absolutely sure you want to delete your account? All your data will be permanently lost.",
    );

    if (!confirmText) return;

    setLoading(true);
    try {
      await deleteUserAccount();

      // Clear tokens and redux state on successful deletion
      clearAuthTokens();
      dispatch(handleLogout());

      toast.success("Your account has been successfully deleted.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to delete account:", error);
      const serverMessage =
        error.response?.data?.message ||
        "Failed to delete account. Please try again later.";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} disabled={loading}>
          <ChevronLeft size={30} className="mr-3" />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center">
          Delete Account
        </h2>
      </div>
      <div className="mt-8 px-4">
        <p className="mb-4 text-red-600 w-[90%] mx-auto text-center font-medium">
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-3xl w-full flex justify-center items-center h-10 hover:bg-red-700 transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            "Delete Account"
          )}
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
