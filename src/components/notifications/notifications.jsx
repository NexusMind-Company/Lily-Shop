import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const Notifications = () => {
  const [enabled, setEnabled] = useState(true);
  const navigate = useNavigate();
  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="flex items-center px-4 py-3">
        <ChevronLeft
          size={22}
          onClick={() => {
            navigate(-1);
          }}
          className="mr-3"
        />
        <h2 className="font-semibold text-lg flex-1 text-center">Notifications</h2>
      </div>

      <div className="flex justify-between items-center px-4 py-4">
        <span className="font-medium">Push notifications</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-lily"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
        </label>
      </div>
    </div>
  );
};

export default Notifications;
