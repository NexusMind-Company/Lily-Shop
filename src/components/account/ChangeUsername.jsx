import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";

const ChangeUsername = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">Change Username</h2>
        </div>
        <div className="mt-8 px-4">
          <label htmlFor="old-username" className="text-sm">
            Old Username
          </label>
          <input
            id="old-username"
            type="text"
            placeholder="Enter old username"
            className="w-full bg-gray-200 rounded-3xl px-3 py-2 mb-4 mt-2"
          />
          <label htmlFor="new-username" className="text-sm">
            New Username
          </label>
          <input
            id="new-username"
            type="text"
            placeholder="Enter new username"
            className="w-full bg-gray-200 rounded-3xl px-3 py-2 mb-1 mt-2"
          />
          <p className="flex gap-1 items-center">
            <Info size={20} />
            username can only be changed every 90 days{" "}
          </p>
        </div>
      </div>
      <div className="px-4 pb-6">
        <button className="bg-lily text-white px-4 py-2 rounded-3xl w-full">Save</button>
      </div>
    </div>
  );
};

export default ChangeUsername;
