import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

const ChangePhone = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    // You can add validation or API call here if needed
    navigate("/confirm-phone");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">Change Phone Number</h2>
        </div>
        <div className="mt-8 px-4">
          <label htmlFor="phone" className="block text-sm pb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter new phone number"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-4"
          />
        </div>
      </div>
      <div className="px-4 pb-6">
        <button
          className="bg-lily text-white px-4 py-2 rounded-3xl w-full"
          onClick={handleSave}
          disabled={!phone.trim()}>
          Change Phone Number
        </button>
      </div>
    </div>
  );
};

export default ChangePhone;
