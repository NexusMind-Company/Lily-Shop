import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPickupLocations } from "../services/api";
import { usePayment } from "../context/paymentContext";
import {
  ChevronLeft,
  MapPin,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "../utils/formatters";

const ChoosePickupAddressPage = () => {
  const navigate = useNavigate();
  const { paymentData, setPaymentData } = usePayment();
  const selectedPickupId = paymentData?.selectedPickup?.id;

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["pickupLocations"],
    queryFn: fetchPickupLocations,
    retry: 1,
  });

  const handleSelect = (pickupLocation) => {
    setPaymentData((prev) => ({
      ...prev,
      selectedPickup: pickupLocation,
      deliveryType: "pickup",
    }));
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white max-w-xl mx-auto">
        <div className="w-10 h-10 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Failed to load pickup locations
        </h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          {error?.message ||
            "There was a problem retrieving available pickup stations."}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-3 bg-lily text-white rounded-xl font-semibold hover:bg-opacity-90 transition-opacity"
        >
          <RefreshCw size={20} />
          Try Again
        </button>
      </div>
    );
  }

  // Handle paginated response ({ count, results: [...] }) or direct array
  const locationsList = data?.results || data || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center justify-center border-b border-gray-100 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 focus:outline-none"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-semibold text-lg text-gray-900">
          Choose Pickup Station
        </h2>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {locationsList && locationsList.length > 0 ? (
          locationsList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all ${
                selectedPickupId === item.id
                  ? "border-lily"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0 text-pink">
                  <MapPin size={24} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-900 text-base pr-4">
                      {item.name}
                    </p>
                    {selectedPickupId === item.id && (
                      <div className="w-6 h-6 rounded-full bg-lily flex items-center justify-center text-white shrink-0">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.address}, {item.city}, {item.state}
                  </p>

                  <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 mt-3">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">
                        Hours:
                      </span>{" "}
                      {item.operating_hours || "9AM - 6PM"}
                    </p>
                    {item.contact_phone && (
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">
                          Contact:
                        </span>{" "}
                        {item.contact_phone}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-pink mt-1">
                      {Number(item.pickup_fee_naira) > 0
                        ? `Pickup Fee: ₦${formatPrice(item.pickup_fee_naira)}`
                        : "Free Pickup"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No stations available
            </h3>
            <p className="text-gray-500 text-sm">
              There are no pickup locations in your area right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoosePickupAddressPage;
