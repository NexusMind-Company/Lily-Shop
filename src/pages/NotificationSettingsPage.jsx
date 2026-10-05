import { useState, useEffect } from "react";
import { ChevronLeft, Volume2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AVAILABLE_TONES = [
  { id: "/sounds/light-hearted-message-tone.mp3", name: "Light Hearted" },
  { id: "/sounds/no-problem-notification-sound.mp3", name: "No Problem" },
];

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [foodTone, setFoodTone] = useState("/sounds/no-problem-notification-sound.mp3");
  const [normalTone, setNormalTone] = useState("/sounds/light-hearted-message-tone.mp3");

  useEffect(() => {
    const savedFood = localStorage.getItem("foodOrderTone");
    const savedNormal = localStorage.getItem("normalNotificationTone");
    if (savedFood) setFoodTone(savedFood);
    if (savedNormal) setNormalTone(savedNormal);
  }, []);

  const playTone = (url) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.warn(e));
  };

  const saveSettings = () => {
    localStorage.setItem("foodOrderTone", foodTone);
    localStorage.setItem("normalNotificationTone", normalTone);
    toast.success("Notification settings saved!");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="flex items-center bg-white px-4 py-3 border-b border-gray-100">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={30} className="mr-3 text-gray-700" />
        </button>
        <h2 className="font-semibold text-lg flex-1 text-center pr-8">Sound Settings</h2>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="text-lily" />
            <h3 className="font-semibold text-gray-800">Food Order Alert Tone</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Choose the sound that plays when you receive an instant food order.</p>
          <div className="space-y-3">
            {AVAILABLE_TONES.map(tone => (
              <label key={tone.id} className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <input 
                    type="radio" 
                    name="foodTone" 
                    value={tone.id}
                    checked={foodTone === tone.id}
                    onChange={() => {
                        setFoodTone(tone.id);
                        playTone(tone.id);
                    }}
                    className="accent-lily w-5 h-5"
                  />
                  <span className="font-medium text-gray-700">{tone.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Volume2 className="text-lily" />
            <h3 className="font-semibold text-gray-800">Normal Notification Tone</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Choose the sound that plays for regular messages and updates.</p>
          <div className="space-y-3">
            {AVAILABLE_TONES.map(tone => (
              <label key={tone.id} className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <input 
                    type="radio" 
                    name="normalTone" 
                    value={tone.id}
                    checked={normalTone === tone.id}
                    onChange={() => {
                        setNormalTone(tone.id);
                        playTone(tone.id);
                    }}
                    className="accent-lily w-5 h-5"
                  />
                  <span className="font-medium text-gray-700">{tone.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={saveSettings}
          className="w-full bg-lily text-white py-4 rounded-xl font-bold flex justify-center items-center space-x-2 shadow-sm"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
