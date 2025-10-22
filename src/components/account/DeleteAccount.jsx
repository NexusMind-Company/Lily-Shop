import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const DeleteAccount = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={30} className="mr-3" />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center">Delete Account</h2>
      </div>
      <div className="mt-8 px-4">
        <p className="mb-4 text-red-600 w-[90%] mx-auto">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <button className="bg-red-600 text-white px-4 py-2 rounded-3xl w-full">Delete Account</button>
      </div>
    </div>
  );
};

export default DeleteAccount;
