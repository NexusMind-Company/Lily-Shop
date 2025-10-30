import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDeliveryAddresses } from "../api/checkoutApi"; // .js removed
import { ChevronLeft, Circle, CheckCircle2, Loader2, X } from "lucide-react";

const ChooseAddressPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["deliveryAddresses"],
    queryFn: fetchDeliveryAddresses,
  });
  
  // In a real app, this default would come from user profile
  const [selectedAddressId, setSelectedAddressId] = useState(
    data?.find(a => a.isDefault)?.id || (data?.[0]?.id || null)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Inlined PageHeader */}
      <div className="relative p-4 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
        <button
          onClick={() => navigate("/cart")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Choose delivery address</h2>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <Loader2 size={32} className="text-lily animate-spin" />
          <p className="text-gray-500 mt-3">Loading addresses...</p>
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <X size={32} className="text-red-500" />
          <p className="text-gray-500 mt-3">Failed to load addresses.</p>
        </div>
      )}
      
      {data && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {data.map((addr) => (
            <div
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer"
            >
              {selectedAddressId === addr.id ? (
                 <CheckCircle2 size={24} className="text-lily flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={24} className="text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{addr.name} {addr.isDefault && <span className="text-xs text-lily font-medium ml-2">(Default)</span>}</p>
                <p className="text-sm text-gray-600">{addr.phone}</p>
                <p className="text-sm text-gray-600">{addr.address}</p>
              </div>
            </div>
          ))}
          
          <button onClick={() => navigate("/add-address")} className="text-lily font-medium mt-4">
            + Add new address
          </button>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
         {/* Inlined FormButton */}
         <button
            onClick={() => navigate("/cart")}
            disabled={!selectedAddressId}
            className="w-full bg-lily text-white py-3 rounded-lg text-lg font-semibold hover:bg-darklily transition-colors disabled:opacity-50"
          >
            Use this address
          </button>
      </div>
    </div>
  );
};

export default ChooseAddressPage;

