import React from "react";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../../context/paymentContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDeliveryAddresses,
  setDefaultAddress,
  deleteAddress,
} from "../../services/api";
import {
  ChevronLeft,
  Plus,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ChooseAddress = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { paymentData, setPaymentData } = usePayment();
  const { selectedAddressId } = paymentData;

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["deliveryAddresses"],
    queryFn: fetchDeliveryAddresses,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: (_, deletedAddressId) => {
      toast.success("Address deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });

      // If the deleted address was the one currently selected, clear it
      if (selectedAddressId === deletedAddressId) {
        setPaymentData((prev) => ({
          ...prev,
          selectedAddress: null,
          selectedAddressId: null,
        }));
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete address");
    },
  });

  const handleDelete = (e, addressId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteMutation.mutate(addressId);
    }
  };

  const handleSelect = async (address) => {
    try {
      // Tell the backend to set this address as the default
      await setDefaultAddress(address.id);
    } catch (err) {
      console.error("Failed to set default address on backend:", err);
    }

    // Update local state so the rest of the app knows about the selection
    setPaymentData((prev) => ({
      ...prev,
      selectedAddress: address,
      selectedAddressId: address.id,
    }));
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Failed to load addresses
        </h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          {error?.message ||
            "There was a problem retrieving your saved addresses. Please check your connection."}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
        >
          <RefreshCw size={20} />
          Try Again
        </button>
      </div>
    );
  }

  const addressList = data?.results || data || [];

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="sticky top-0 bg-white z-10 px-4 py-6 flex items-center border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-900"
        >
          <ChevronLeft size={28} />
        </button>
        <h2 className="flex-1 text-center font-semibold text-xl text-gray-900 mr-8">
          Choose delivery address
        </h2>
      </div>

      <div className="p-4">
        {addressList && addressList.length > 0 ? (
          <div className="space-y-8">
            {addressList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex items-start gap-4 cursor-pointer group"
              >
                <div className="mt-1">
                  {selectedAddressId === item.id ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-900 group-hover:border-pink-600 transition-colors" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  {item.is_default && (
                    <p className="text-sm text-gray-500 font-medium tracking-tight">
                      Default Address
                    </p>
                  )}
                  <p className="font-bold text-gray-900 text-lg">
                    {item.label || "Address"}
                    {item.phone_number && (
                      <span className="font-normal ml-1">
                        {item.phone_number}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-900 text-lg leading-relaxed max-w-[90%]">
                    {item.street_address}, {item.city}, {item.state}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={deleteMutation.isPending}
                  className="mt-1 p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  aria-label="Delete address"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No saved addresses found.</p>
          </div>
        )}

        <button
          onClick={() => navigate("/add-address")}
          className="mt-8 flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors"
        >
          <Plus size={24} strokeWidth={3} />
          <span className="text-lg">Add new address</span>
        </button>
      </div>
    </div>
  );
};

export default ChooseAddress;
