import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const ChangeDOB = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">Change Date of Birth</h2>
        </div>
        <div className="mt-8 px-4">
          <label htmlFor="dob" className="text-sm">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            className="w-full bg-gray-200 rounded-3xl px-3 py-2 mb-4 mt-2"
          />
        </div>
      </div>
      <div className="px-4 pb-6">
        <button className="bg-lily text-white px-4 py-2 rounded-3xl w-full">
          Change Date of Birth
        </button>
      </div>
    </div>
  );
};

export default ChangeDOB;
