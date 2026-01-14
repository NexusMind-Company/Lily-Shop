import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">Change Password</h2>
        </div>
        <div className="mt-8 px-4">
          <label htmlFor="old-password" className="text-sm pb-2">
            Old Password
          </label>
          <input
            id="old-password"
            type="password"
            placeholder="Enter old password"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4 mt-2"
          />
          <label htmlFor="new-password" className="text-sm pb-2">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4 mt-2"
          />
          <label htmlFor="re-enter-new-password" className="text-sm pb-2">
            Re-enter New Password
          </label>
          <input
            id="re-enter-new-password"
            type="password"
            placeholder="Re-enter new password"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4 mt-2"
          />
        </div>
      </div>
      <div className="px-4 pb-6">
        <button className="bg-lily text-white px-4 py-2 rounded-3xl w-full">Save</button>
      </div>
    </div>
  );
};

export default ChangePassword;
