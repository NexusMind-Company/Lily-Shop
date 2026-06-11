import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Plus, Loader2, AlertCircle } from "lucide-react";
import { usePayment } from "../hooks/usePayment";
import { api } from "../services/api";

const fetchSavedCards = async () => {
  // Anticipated endpoint to be created by the backend developer
  const response = await api.get("/wallet/cards/");

  // Assumes the backend returns an array of cards directly or inside a 'data'/'results' property
  return response.data?.results || response.data || [];
};

const ChooseCardPage = () => {
  const navigate = useNavigate();
  const { setPaymentData } = usePayment();
  const [selectedCardId, setSelectedCardId] = useState(null);

  const {
    data: savedCards,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["savedCards"],
    queryFn: fetchSavedCards,
    retry: 1, // Only retry once to avoid long waits on a missing endpoint
  });

  useEffect(() => {
    const defaultCard = savedCards?.find((card) => card.is_default);
    if (defaultCard && !selectedCardId) {
      setSelectedCardId(defaultCard.id);
    }
  }, [savedCards, selectedCardId]);

  const handleCardSelection = (card) => {
    setSelectedCardId(card.id);
    setPaymentData((prev) => ({
      ...prev,
      selectedPaymentMethod: "card",
      selectedCard: card,
    }));
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-5xl mx-auto bg-white font-sans text-black">
      <div className="relative flex items-center p-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-1 -ml-1 text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
        >
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-medium">
          Choose card
        </h1>
      </div>

      <div className="flex-1 p-5">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
            <p className="text-gray-500 text-sm">Loading your cards...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 text-red-500 bg-red-50 rounded-xl p-4">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium text-center">
              {error?.response?.data?.message ||
                error?.message ||
                "Failed to load saved cards."}
            </p>
            <p className="text-xs text-red-400 text-center">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-6">
            {!savedCards || savedCards.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                You have no saved cards.
              </p>
            ) : (
              savedCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardSelection(card)}
                  className="flex items-start space-x-4 cursor-pointer group"
                >
                  <div className="shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full border-[1.5px] border-black flex items-center justify-center bg-white transition-all">
                      {(selectedCardId === card.id ||
                        (!selectedCardId && card.is_default)) && (
                        <div className="w-3.5 h-3.5 rounded-full bg-black" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[16px] leading-none">
                      {card.card_holder_name || "Card Holder"}
                    </span>

                    <div className="flex items-center text-[15px] leading-none">
                      <span className="tracking-widest">
                        {card.masked_pan || "**** **** **** ****"}
                      </span>
                      {card.is_default && (
                        <>
                          <span className="mx-2.5 text-gray-400 text-lg leading-none mt-0.5">
                            •
                          </span>
                          <span className="text-gray-500 text-[15px] tracking-wide">
                            Default
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-[15px] leading-none pt-0.5">
                      Exp: {card.expiry_month}/{card.expiry_year}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/add-card")}
          className="flex items-center mt-7 text-[#D81B60] hover:text-[#AD1457] transition-colors focus:outline-none disabled:opacity-50"
          disabled={isLoading}
        >
          <Plus size={22} strokeWidth={1.5} className="mr-3" />
          <span className="text-[15px] font-medium">Add new card</span>
        </button>
      </div>
    </div>
  );
};

export default ChooseCardPage;
