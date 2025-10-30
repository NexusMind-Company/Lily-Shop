import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// --- Fixed Import Path ---
import { fetchSavedCards } from "../api/checkoutApi.js"; // Added .js extension
import {
  ChevronLeft,
  Circle,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

const ChooseCardPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["savedCards"],
    queryFn: fetchSavedCards,
  });

  const [selectedCardId, setSelectedCardId] = useState(null); // Initialize to null

  // --- Effect to set default selection once data loads ---
  useEffect(() => {
    if (data && data.length > 0 && selectedCardId === null) {
      const defaultCard = data.find((card) => card.isDefault);
      const firstCard = data[0];
      // Set the state only once when data is loaded
      setSelectedCardId(defaultCard?.id || firstCard?.id || null);
    }
    // We only want this to run when 'data' is loaded or if selectedCardId was reset to null.
    // Adding selectedCardId to dependencies avoids unnecessary reruns after initial selection.
  }, [data, selectedCardId]);

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Choose card</h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <Loader2 size={32} className="text-lily animate-spin" />
          <p className="text-gray-500 mt-3">Loading cards...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <X size={32} className="text-red-500" />
          <p className="text-gray-500 mt-3">Failed to load cards.</p>
          {/* Optionally add a retry button? */}
        </div>
      )}

      {/* Data Loaded State */}
      {data && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              No saved cards found.
            </p>
          ) : (
            data.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                // Highlight selected card
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                  selectedCardId === card.id
                    ? "border-lily ring-1 ring-lily"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {selectedCardId === card.id ? (
                    <CheckCircle2
                      size={24}
                      className="text-lily flex-shrink-0"
                    />
                  ) : (
                    <Circle size={24} className="text-gray-300 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {card.name}{" "}
                      {card.isDefault && (
                        <span className="text-xs text-lily font-medium ml-2">
                          (Default)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{card.last4}</p>
                    <p className="text-sm text-gray-600">Exp: {card.expiry}</p>
                  </div>
                </div>
                {/* Keep the Chevron, it's in the design */}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            ))
          )}

          <button
            onClick={() => navigate("/add-card")}
            className="text-lily font-medium mt-4 hover:underline" // Added hover state
          >
            + Add new card
          </button>
        </div>
      )}

      {/* Footer Button - Only show if there's data */}
      {data && data.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => {
              // TODO: Add logic here to save the selected card preference
              // e.g., using a mutation or updating global state
              console.log("Selected Card ID:", selectedCardId);
              navigate("/cart"); // Go back to cart
            }}
            disabled={!selectedCardId} // Disable if no card is selected
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default ChooseCardPage;
