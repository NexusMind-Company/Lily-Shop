import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { changeUserPassword } from "../../services/api";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await changeUserPassword(formData.oldPassword, formData.newPassword);
      toast.success("Password changed successfully!");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      navigate(-1);
    } catch (error) {
      console.error("Failed to change password:", error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to change password. Please check your old password and try again.";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} disabled={loading}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">
            Change Password
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 px-4">
          <label htmlFor="oldPassword" className="text-sm pb-2 block">
            Old Password
          </label>
          <input
            id="oldPassword"
            type="password"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Enter old password"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4 mt-2"
            disabled={loading}
          />
          <label htmlFor="newPassword" className="text-sm pb-2 block">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4 mt-2"
            disabled={loading}
          />
          <label htmlFor="confirmPassword" className="text-sm pb-2 block">
            Re-enter New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4 mt-2"
            disabled={loading}
          />
        </form>
      </div>
      <div className="px-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-lily text-white px-4 py-2 rounded-3xl w-full flex justify-center items-center h-10 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
