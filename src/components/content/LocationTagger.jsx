import { useState } from "react";
import PropTypes from "prop-types";

const LocationTagger = ({ onLocationChange }) => {
  const [autoLocation, setAutoLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleManualChange = (e) => {
    setManualLocation(e.target.value);
    if (onLocationChange) onLocationChange(e.target.value);
  };



  const handleAutoLocation = () => {
    if (navigator.geolocation) {
    setLoading(true)
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Fetch location name using OpenStreetMap Nominatim API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          // Extract state and country
          const state = data.address.state || "";
          const country = data.address.country || "";
          setLocationName(`${state}${state && country ? ", " : ""}${country}`);
        } catch (error) {
          setLocationName("Location not found");
        }
      });
    } else {
      setLocationName("Geolocation not supported");
    }
  };

  return (
    <div className="border rounded p-3 mt-4">
      <h3 className="font-semibold mb-2">Tag Location</h3>
      <div className="flex items-center gap-2 mb-2">
        <label>
          <input
            type="checkbox"
            checked={autoLocation}
            onChange={() => {
              setAutoLocation(!autoLocation);
              if (!autoLocation) handleAutoLocation();
            }}
          />
          <span className="ml-1">Auto-location (use my device location)</span>
        </label>
        {loading && <span className="text-xs text-gray-500 ml-2">Fetching...</span>}
      </div>
      <div className="mb-2">
        <label className="block mb-1">Or manually type location:</label>
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          value={manualLocation}
          onChange={handleManualChange}
          placeholder="Enter location (e.g. New York, NY)"
          disabled={autoLocation}
        />
        <button onClick={handleAutoLocation} className="mt-2">Auto-Location</button>
        {locationName && <div className=" text-gray-700">Location: {locationName}</div>}
      </div>
    </div>
  );
};

LocationTagger.propTypes = {
  onLocationChange: PropTypes.func,
};

export default LocationTagger;
