import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// --- Fixed Import Path ---
import { fetchPickupLocations } from "../api/checkoutApi.js"; // Added .js extension
import { ChevronLeft, Circle, CheckCircle2, Loader2, X } from "lucide-react";

const ChoosePickupPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["pickupLocations"],
    queryFn: fetchPickupLocations,
  });

  const [selectedPickupId, setSelectedPickupId] = useState(null); // Initialize to null

  // --- Effect to set default selection once data loads ---
  useEffect(() => {
    if (data && data.length > 0 && selectedPickupId === null) {
      const defaultLocation = data.find(loc => loc.isDefault);
      const firstLocation = data[0];
      setSelectedPickupId(defaultLocation?.id || firstLocation?.id || null);
    }
  }, [data, selectedPickupId]); // Rerun when data loads or selection changes unnecessarily


  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/cart")} // Assuming '/cart' is the correct path
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">
          Choose pickup address
        </h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <Loader2 size={32} className="text-lily animate-spin" />
          <p className="text-gray-500 mt-3">Loading locations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <X size={32} className="text-red-500" />
          <p className="text-gray-500 mt-3">Failed to load locations.</p>
          {/* Optionally add a retry button */}
        </div>
      )}

      {/* Data Loaded State */}
      {data && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {data.length === 0 ? (
             <p className="text-center text-gray-500 mt-8">No pickup locations found.</p>
          ) : (
             data.map((loc) => (
                <div
                key={loc.id}
                onClick={() => setSelectedPickupId(loc.id)}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer ${selectedPickupId === loc.id ? 'border-lily ring-1 ring-lily' : 'border-gray-200'}`} // Highlight selected
                >
                {selectedPickupId === loc.id ? (
                    <CheckCircle2
                    size={24}
                    className="text-lily flex-shrink-0 mt-0.5"
                    />
                ) : (
                    <Circle
                    size={24}
                    className="text-gray-300 flex-shrink-0 mt-0.5"
                    />
                )}
                <div>
                    <p className="font-semibold">
                    {loc.name}{" "}
                    {loc.isDefault && (
                        <span className="text-xs text-lily font-medium ml-2">
                        (Default)
                        </span>
                    )}
                    </p>
                    <p className="text-sm text-gray-600">{loc.address}</p>
                </div>
                </div>
             ))
          )}
        </div>
      )}

      {/* Footer Button */}
      {/* Only show button if data exists */}
      {data && data.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <button
            onClick={() => {
                // TODO: Add logic here to save the selected pickup location
                // e.g., using a mutation or updating global state
                console.log("Selected Pickup ID:", selectedPickupId);
                navigate("/cart"); // Go back to cart
            }}
            disabled={!selectedPickupId} // Disable if nothing is selected
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Use this location
            </button>
        </div>
      )}
    </div>
  );
};

export default ChoosePickupPage;

