import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDeliveryAddresses } from "../../services/api";
import { usePayment } from "../../context/paymentContext";
import { ChevronLeft, Plus, MapPin, Loader2, CheckCircle2 } from "lucide-react";

const ChooseAddress = () => {
  const navigate = useNavigate();
  const { setPaymentData } = usePayment();
  const [selectedId, setSelectedId] = useState(null);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["deliveryAddresses"],
    queryFn: fetchDeliveryAddresses,
  });

  const handleContinue = () => {
    const selectedAddress = addresses?.find((addr) => addr.id === selectedId);
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    // Save choice to context
    setPaymentData((prev) => ({ ...prev, selectedAddress }));
    
    // Navigate to Payment Method selection (formerly ChooseCardPage)
    navigate("/choose-card");
  };

  // Auto-select default if available
  React.useEffect(() => {
    if (addresses?.length > 0 && !selectedId) {
      setSelectedId(addresses[0].id);
    }
  }, [addresses]);

  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto bg-white">
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center">
        <button
          onClick={() => navigate("/cart")}
          className="absolute left-4 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Select Address</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <button
          onClick={() => navigate("/add-address")}
          className="w-full flex items-center p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lily mr-3">
            <Plus size={20} />
          </div>
          <span className="font-medium text-gray-700">Add New Address</span>
        </button>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-lily" size={32} />
          </div>
        ) : (
          <div className="space-y-3">
            {addresses?.map((addr) => (
              <div
                key={addr.id}
                onClick={() => setSelectedId(addr.id)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedId === addr.id
                    ? "border-lily bg-pink-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold text-gray-800">{addr.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                    <p className="text-gray-500 text-xs mt-1">{addr.phone}</p>
                  </div>
                </div>
                {selectedId === addr.id && (
                  <CheckCircle2 className="absolute top-4 right-4 text-lily" size={24} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleContinue}
          className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default ChooseAddress;