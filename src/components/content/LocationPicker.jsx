import { useState } from "react";
import PropTypes from "prop-types";
import { MapPin, Crosshair, Loader2 } from "lucide-react";

const LocationPicker = ({ formData, setFormData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detectLocation = async () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const locationName = data.display_name || "Unknown location";

          setFormData({
            ...formData,
            location: locationName,
            coordinates: { latitude, longitude },
          });
        } catch {
          setError("Failed to fetch location details.");
        }

        setLoading(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="bg-white border border-gray-400 rounded-2xl p-5 mt-4">
      <h3 className="font-semibold  mb-3 text-center">📍 Location</h3>

      <div className="flex flex-col gap-4">
        {/* Manual Location Input */}
        <div>
          <label className="block mb-1">
            Enter or Edit Location
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="text-lily w-7 h-7" />
            <input
              type="text"
              placeholder="e.g. Ikeja, Lagos"
              className="flex-1 bg-gray-200  rounded-lg border border-gray-400 p-2 outline-none focus:ring-2 focus:ring-lily-400 focus:border-lily-400"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
        </div>

        {/* Auto Detect Button */}
        <div className="flex justify-between items-center mt-1">
          <button
            type="button"
            onClick={detectLocation}
            disabled={loading}
            className="flex items-center gap-2 bg-lily text-white px-4 py-2 rounded-lg font-medium hover:bg-lily transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" /> Detecting...
              </>
            ) : (
              <>
                <Crosshair className="w-7 h-7" /> Auto Detect
              </>
            )}
          </button>

        </div>

        {/* Error Message */}
        {error && <p className="text-red-500  mt-2">{error}</p>}
      </div>
    </div>
  );
};

LocationPicker.propTypes = {
  formData: PropTypes.shape({
    location: PropTypes.string,
    coordinates: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default LocationPicker;
